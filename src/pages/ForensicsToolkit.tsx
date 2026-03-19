import { useState, useRef } from "react";
import { loadImageToCanvas, errorLevelAnalysis, noiseAnalysis, generateHistogram, computeIntegrityScore } from "@/lib/clientForensics";
import { extractMetadata } from "@/lib/exifExtractor";
import { Header } from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import {
    Shield,
    ArrowLeft,
    Upload,
    Camera,
    FileSearch,
    AudioWaveform,
    Loader2,
    Info,
    AlertTriangle,
    BarChart3,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Hash,
    MapPin,
    Copy,
    Check,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface ForensicsData {
    metadata: {
        format: string;
        mode: string;
        width: number;
        height: number;
        bit_depth: number;
        has_alpha: boolean;
        color_profile: string | null;
        file_size_bytes: number;
        hash_sha256: string;
        camera: string;
        datetime: string;
        software: string;
        iso: string;
        exposure: string;
        focal_length: string;
        white_balance: string;
        metering_mode: string;
        flash: string;
        orientation: string;
        color_space: string;
        gps: { lat: number; lng: number; alt: number } | null;
        ai_software_detected: boolean;
        exif: Record<string, string>;
    };
    ela_base64: string;
    noise_base64: string;
    histogram_base64: string;
    integrity: {
        score: number;
        risk_level: "low" | "medium" | "high";
        findings: string[];
    };
}

type TabId = "summary" | "metadata" | "ela" | "noise" | "histogram";

const ForensicsToolkit = () => {
    const [activeTab, setActiveTab] = useState<TabId>("summary");
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<ForensicsData | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !file.type.startsWith("image/")) {
            toast({ title: "Invalid file", description: "Please select an image.", variant: "destructive" });
            return;
        }

        setPreviewUrl(URL.createObjectURL(file));
        setFileName(file.name);
        setIsLoading(true);
        setData(null);

        try {
            // Run all forensics client-side
            const [metadata, { canvas }] = await Promise.all([
                extractMetadata(file),
                loadImageToCanvas(file),
            ]);

            const [ela_base64, noise_base64, histogram_base64] = await Promise.all([
                errorLevelAnalysis(canvas),
                Promise.resolve(noiseAnalysis(canvas)),
                Promise.resolve(generateHistogram(canvas)),
            ]);

            const integrity = computeIntegrityScore(metadata, ela_base64, canvas);

            setData({
                metadata: metadata as ForensicsData["metadata"],
                ela_base64,
                noise_base64,
                histogram_base64,
                integrity,
            });
            setActiveTab("summary");
        } catch (error) {
            toast({
                title: "Analysis Failed",
                description: error instanceof Error ? error.message : "Could not analyze the image.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const tabs: { id: TabId; label: string; icon: typeof Shield }[] = [
        { id: "summary", label: "Summary", icon: Shield },
        { id: "metadata", label: "Metadata", icon: Camera },
        { id: "ela", label: "ELA", icon: FileSearch },
        { id: "noise", label: "Noise", icon: AudioWaveform },
        { id: "histogram", label: "Histogram", icon: BarChart3 },
    ];

    const handleReset = () => {
        setData(null);
        setPreviewUrl(null);
        setFileName("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <section className="border-b border-border bg-muted">
                <div className="container py-12 md:py-16">
                    <Link
                        to="/"
                        className="mb-8 inline-flex items-center gap-2 text-sm font-bold tracking-wide text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Home
                    </Link>

                    <div className="mb-4 inline-flex w-fit items-center gap-2 border border-border bg-background rounded-md px-3 py-1 text-xs font-bold tracking-wide shadow-xs">
                        <Shield className="h-3 w-3" />
                        Forensics
                    </div>
                    <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-5xl mb-2">
                        Image <span className="text-muted-foreground">Forensics</span>
                    </h1>
                    <p className="max-w-xl text-lg text-muted-foreground mb-8">
                        Comprehensive image analysis — EXIF metadata, integrity scoring, ELA, noise patterns, and color histograms.
                    </p>

                    {/* Upload */}
                    {!data && !isLoading && (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-border bg-card p-12 text-center shadow-md cursor-pointer hover:bg-accent/30 transition-colors max-w-xl"
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
                            <p className="text-lg font-bold">Upload Image for Analysis</p>
                            <p className="text-sm text-muted-foreground mt-2">PNG, JPG, WEBP — max 20MB</p>
                        </div>
                    )}

                    {/* Loading */}
                    {isLoading && (
                        <div className="border border-border bg-card rounded-lg p-12 text-center shadow-md max-w-xl">
                            <Loader2 className="mx-auto h-10 w-10 animate-spin mb-4" />
                            <p className="text-lg font-bold">Analyzing Image...</p>
                            <p className="text-sm text-muted-foreground mt-2">Running metadata, ELA, noise, histogram, and integrity analysis</p>
                        </div>
                    )}

                    {/* Results */}
                    {data && (
                        <div className="space-y-6">
                            {/* Tab Navigation */}
                            <div className="flex gap-0 border border-border rounded-lg overflow-x-auto">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold tracking-wide transition-colors whitespace-nowrap ${activeTab === tab.id
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-card hover:bg-accent"
                                            } ${tab.id !== "summary" ? "border-l border-border" : ""}`}
                                    >
                                        <tab.icon className="h-4 w-4" />
                                        <span className="hidden sm:inline">{tab.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Summary Tab */}
                            {activeTab === "summary" && <SummaryTab data={data} fileName={fileName} previewUrl={previewUrl} />}

                            {/* Metadata Tab */}
                            {activeTab === "metadata" && <MetadataTab data={data} />}

                            {/* ELA Tab */}
                            {activeTab === "ela" && (
                                <div className="border border-border bg-card rounded-lg p-6 shadow-md">
                                    <h3 className="text-lg font-bold mb-2">Error Level Analysis</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        ELA reveals compression inconsistencies. Manipulated regions often have different error levels
                                        than the surrounding image, appearing as brighter areas.
                                    </p>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {previewUrl && (
                                            <div>
                                                <p className="text-xs font-bold uppercase mb-2 text-muted-foreground">Original</p>
                                                <div className="border border-border rounded-md overflow-hidden">
                                                    <img src={previewUrl} alt="Original" className="w-full h-auto" />
                                                </div>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-xs font-bold uppercase mb-2 text-muted-foreground">ELA Result</p>
                                            <div className="border border-border rounded-md overflow-hidden">
                                                <img
                                                    src={`data:image/png;base64,${data.ela_base64}`}
                                                    alt="Error Level Analysis"
                                                    className="w-full h-auto"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 border border-dashed border-border bg-muted/50 p-3 text-xs text-muted-foreground">
                                        <strong>How to read:</strong> Uniform brightness = original. Bright spots in specific regions = possible manipulation.
                                        Edges naturally appear bright in ELA.
                                    </div>
                                </div>
                            )}

                            {/* Noise Tab */}
                            {activeTab === "noise" && (
                                <div className="border border-border bg-card rounded-lg p-6 shadow-md">
                                    <h3 className="text-lg font-bold mb-2">Noise Analysis</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Extracts and visualizes the noise pattern. Authentic photos have consistent noise across the image.
                                        Manipulated regions often show different noise patterns.
                                    </p>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {previewUrl && (
                                            <div>
                                                <p className="text-xs font-bold uppercase mb-2 text-muted-foreground">Original</p>
                                                <div className="border border-border rounded-md overflow-hidden">
                                                    <img src={previewUrl} alt="Original" className="w-full h-auto" />
                                                </div>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-xs font-bold uppercase mb-2 text-muted-foreground">Noise Residual</p>
                                            <div className="border border-border rounded-md overflow-hidden">
                                                <img
                                                    src={`data:image/png;base64,${data.noise_base64}`}
                                                    alt="Noise Analysis"
                                                    className="w-full h-auto"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 border border-dashed border-border bg-muted/50 p-3 text-xs text-muted-foreground">
                                        <strong>How to read:</strong> Consistent noise = authentic. Abrupt changes in noise texture = possible splicing or AI generation.
                                    </div>
                                </div>
                            )}

                            {/* Histogram Tab */}
                            {activeTab === "histogram" && (
                                <div className="border border-border bg-card rounded-lg p-6 shadow-md">
                                    <h3 className="text-lg font-bold mb-2">Color Histogram</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        RGB channel distribution. Smooth curves indicate natural photography. Abrupt spikes or gaps
                                        can indicate post-processing or AI generation.
                                    </p>
                                    <div className="border border-border rounded-md overflow-hidden bg-black">
                                        <img
                                            src={`data:image/png;base64,${data.histogram_base64}`}
                                            alt="RGB Histogram"
                                            className="w-full h-auto"
                                        />
                                    </div>
                                    <div className="mt-4 grid grid-cols-3 gap-3">
                                        <div className="flex items-center gap-2 text-xs">
                                            <div className="h-3 w-3 border border-border rounded-md" style={{ backgroundColor: "#EA4335" }} />
                                            <span className="font-bold uppercase text-muted-foreground">Red Channel</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs">
                                            <div className="h-3 w-3 border border-border rounded-md" style={{ backgroundColor: "#34A853" }} />
                                            <span className="font-bold uppercase text-muted-foreground">Green Channel</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs">
                                            <div className="h-3 w-3 border border-border rounded-md" style={{ backgroundColor: "#4285F4" }} />
                                            <span className="font-bold uppercase text-muted-foreground">Blue Channel</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 border border-dashed border-border bg-muted/50 p-3 text-xs text-muted-foreground">
                                        <strong>How to read:</strong> Natural photos have smooth bell-curved distributions. AI-generated images may show
                                        unusual clustering or unnatural gaps in the distribution.
                                    </div>
                                </div>
                            )}

                            {/* Reset */}
                            <Button
                                variant="outline"
                                onClick={handleReset}
                                className="border border-border rounded-md font-bold tracking-wide"
                            >
                                Analyze Another Image
                            </Button>
                        </div>
                    )}
                </div>
            </section>

            <footer className="border-t border-border bg-card">
                <div className="container py-8">
                    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            <span className="font-bold tracking-wide">DeepGuard AI</span>
                        </div>
                        <p className="text-sm text-muted-foreground">© 2026 DeepGuard AI</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

/* ─── Summary Tab ─── */

const SummaryTab = ({
    data,
    fileName,
    previewUrl,
}: {
    data: ForensicsData;
    fileName: string;
    previewUrl: string | null;
}) => {
    const { integrity, metadata } = data;
    const [copied, setCopied] = useState(false);

    const riskColors = {
        low: "text-chart-2 border-chart-2 bg-chart-2/10",
        medium: "text-chart-4 border-chart-4 bg-chart-4/10",
        high: "text-destructive border-destructive bg-destructive/10",
    };

    const riskIcons = {
        low: CheckCircle2,
        medium: AlertCircle,
        high: XCircle,
    };

    const RiskIcon = riskIcons[integrity.risk_level];

    const copyHash = () => {
        navigator.clipboard.writeText(metadata.hash_sha256);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "Unknown";
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    return (
        <div className="space-y-4">
            {/* Integrity Score Card */}
            <div className={`border-4 p-6 shadow-md ${riskColors[integrity.risk_level]}`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <RiskIcon className="h-8 w-8" />
                        <div>
                            <h3 className="text-2xl font-bold">{integrity.score}/100</h3>
                            <p className="text-xs font-bold tracking-wide">
                                Integrity Score — {integrity.risk_level} Risk
                            </p>
                        </div>
                    </div>
                    {metadata.ai_software_detected && (
                        <div className="flex items-center gap-2 border-2 border-destructive bg-destructive/20 px-3 py-1.5 text-xs font-bold uppercase text-destructive">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            AI Software Detected
                        </div>
                    )}
                </div>
                <Progress value={integrity.score} className="h-3 border-2 border-current" />
            </div>

            {/* Key Findings */}
            <div className="border border-border bg-card rounded-lg p-6 shadow-md">
                <h3 className="text-sm font-bold tracking-wide mb-4 text-muted-foreground">
                    Key Findings
                </h3>
                <div className="space-y-2">
                    {integrity.findings.map((finding, i) => {
                        const isGood = finding.startsWith("✓");
                        const isWarning = finding.startsWith("△");
                        const isBad = finding.startsWith("✗");
                        return (
                            <div
                                key={i}
                                className={`flex items-start gap-2 text-sm py-1.5 px-2 border-l-4 ${isGood
                                    ? "border-chart-2 bg-chart-2/5"
                                    : isBad
                                        ? "border-destructive bg-destructive/5"
                                        : isWarning
                                            ? "border-chart-4 bg-chart-4/5"
                                            : "border-border"
                                    }`}
                            >
                                <span className="font-mono text-xs leading-relaxed">{finding}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* File Overview */}
            <div className="grid gap-4 sm:grid-cols-2">
                {/* File Info */}
                <div className="border border-border bg-card rounded-lg p-5 shadow-md">
                    <h3 className="text-sm font-bold tracking-wide mb-3 text-muted-foreground">
                        File Info
                    </h3>
                    <div className="space-y-2 text-sm">
                        {[
                            ["Name", fileName || "—"],
                            ["Format", metadata.format],
                            ["Dimensions", `${metadata.width} × ${metadata.height}`],
                            ["Size", formatFileSize(metadata.file_size_bytes)],
                            ["Color Mode", `${metadata.mode} (${metadata.bit_depth}-bit)`],
                            ["Alpha Channel", metadata.has_alpha ? "Yes" : "No"],
                            ["Color Profile", metadata.color_profile || "None"],
                        ].map(([label, value]) => (
                            <div key={label} className="flex justify-between border-b border-border/50 pb-1.5">
                                <span className="text-muted-foreground font-bold uppercase text-xs">{label}</span>
                                <span className="font-mono text-right max-w-[55%] truncate">{value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Camera & Image Preview */}
                <div className="border border-border bg-card rounded-lg p-5 shadow-md">
                    {previewUrl && (
                        <div className="mb-3 border border-border rounded-md overflow-hidden">
                            <img src={previewUrl} alt="Preview" className="w-full h-auto max-h-40 object-contain bg-muted" />
                        </div>
                    )}
                    <div className="space-y-2 text-sm">
                        {[
                            ["Camera", metadata.camera],
                            ["Date/Time", metadata.datetime],
                            ["Software", metadata.software],
                        ].map(([label, value]) => (
                            <div key={label} className="flex justify-between border-b border-border/50 pb-1.5">
                                <span className="text-muted-foreground font-bold uppercase text-xs">{label}</span>
                                <span className="font-mono text-right max-w-[55%] truncate">{value || "Unknown"}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Hash */}
            <div className="border border-border bg-card rounded-lg p-4 shadow-md">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <Hash className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="text-xs font-bold tracking-wide text-muted-foreground shrink-0">SHA-256</span>
                        <span className="font-mono text-xs truncate">{metadata.hash_sha256}</span>
                    </div>
                    <button onClick={copyHash} className="shrink-0 border border-border rounded-md p-1.5 hover:bg-accent transition-colors">
                        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                </div>
            </div>

            {/* GPS */}
            {metadata.gps && (
                <div className="border border-border bg-card rounded-lg p-4 shadow-md">
                    <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs font-bold tracking-wide text-muted-foreground">GPS Location</span>
                    </div>
                    <div className="font-mono text-sm">
                        {metadata.gps.lat.toFixed(6)}°, {metadata.gps.lng.toFixed(6)}°
                        {metadata.gps.alt > 0 && ` — ${metadata.gps.alt}m altitude`}
                    </div>
                </div>
            )}
        </div>
    );
};

/* ─── Metadata Tab ─── */

const MetadataTab = ({ data }: { data: ForensicsData }) => {
    const { metadata } = data;

    const sections = [
        {
            title: "Image Properties",
            rows: [
                ["Format", metadata.format],
                ["Dimensions", `${metadata.width} × ${metadata.height}`],
                ["Color Mode", metadata.mode],
                ["Bit Depth", `${metadata.bit_depth}-bit`],
                ["Alpha Channel", metadata.has_alpha ? "Yes" : "No"],
                ["Color Profile", metadata.color_profile || "None"],
                ["Color Space", metadata.color_space],
            ],
        },
        {
            title: "Camera Information",
            rows: [
                ["Camera", metadata.camera],
                ["Date/Time", metadata.datetime],
                ["Software", metadata.software],
                ["ISO", metadata.iso],
                ["Exposure", metadata.exposure],
                ["Focal Length", metadata.focal_length],
                ["White Balance", metadata.white_balance],
                ["Metering Mode", metadata.metering_mode],
                ["Flash", metadata.flash],
                ["Orientation", metadata.orientation],
            ],
        },
    ];

    return (
        <div className="space-y-4">
            {metadata.ai_software_detected && (
                <div className="flex items-center gap-2 border-4 border-chart-1 bg-chart-1/10 p-4 text-sm font-bold shadow-md">
                    <AlertTriangle className="h-5 w-5 text-chart-1" />
                    <span className="text-chart-1 uppercase">AI generation software detected in metadata!</span>
                </div>
            )}

            {sections.map((section) => (
                <div key={section.title} className="border border-border bg-card rounded-lg p-6 shadow-md">
                    <h3 className="text-sm font-bold tracking-wide mb-4 text-muted-foreground">
                        {section.title}
                    </h3>
                    <div className="grid gap-2 text-sm">
                        {section.rows.map(([label, value]) => (
                            <div key={label} className="flex justify-between border-b border-border pb-2">
                                <span className="text-muted-foreground font-bold uppercase">{label}</span>
                                <span className="font-mono text-right max-w-[60%] truncate">{value || "Unknown"}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {/* GPS */}
            {metadata.gps && (
                <div className="border border-border bg-card rounded-lg p-6 shadow-md">
                    <h3 className="text-sm font-bold tracking-wide mb-4 text-muted-foreground">
                        <MapPin className="inline h-4 w-4 mr-1" /> GPS Location
                    </h3>
                    <div className="grid gap-2 text-sm">
                        <div className="flex justify-between border-b border-border pb-2">
                            <span className="text-muted-foreground font-bold uppercase">Latitude</span>
                            <span className="font-mono">{metadata.gps.lat.toFixed(6)}°</span>
                        </div>
                        <div className="flex justify-between border-b border-border pb-2">
                            <span className="text-muted-foreground font-bold uppercase">Longitude</span>
                            <span className="font-mono">{metadata.gps.lng.toFixed(6)}°</span>
                        </div>
                        <div className="flex justify-between border-b border-border pb-2">
                            <span className="text-muted-foreground font-bold uppercase">Altitude</span>
                            <span className="font-mono">{metadata.gps.alt}m</span>
                        </div>
                    </div>
                </div>
            )}

            {/* All EXIF */}
            {Object.keys(metadata.exif).length > 0 && (
                <div className="border border-border bg-card rounded-lg p-6 shadow-md">
                    <details>
                        <summary className="cursor-pointer font-bold uppercase text-xs tracking-wider text-muted-foreground hover:text-foreground">
                            <Info className="inline h-3.5 w-3.5 mr-1" />
                            All EXIF Data ({Object.keys(metadata.exif).length} fields)
                        </summary>
                        <div className="mt-3 max-h-72 overflow-y-auto border border-dashed border-border p-3 text-xs">
                            {Object.entries(metadata.exif).map(([key, value]) => (
                                <div key={key} className="flex justify-between py-1 border-b border-border/50">
                                    <span className="text-muted-foreground">{key}</span>
                                    <span className="font-mono max-w-[50%] truncate text-right">{value}</span>
                                </div>
                            ))}
                        </div>
                    </details>
                </div>
            )}
        </div>
    );
};

export default ForensicsToolkit;
