import { useState, useRef } from "react";
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
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface ForensicsData {
    metadata: {
        format: string;
        mode: string;
        width: number;
        height: number;
        camera: string;
        datetime: string;
        software: string;
        iso: string;
        exposure: string;
        focal_length: string;
        ai_software_detected: boolean;
        exif: Record<string, string>;
    };
    ela_base64: string;
    noise_base64: string;
}

const ForensicsToolkit = () => {
    const [activeTab, setActiveTab] = useState<"metadata" | "ela" | "noise">("metadata");
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<ForensicsData | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !file.type.startsWith("image/")) {
            toast({ title: "Invalid file", description: "Please select an image.", variant: "destructive" });
            return;
        }

        setPreviewUrl(URL.createObjectURL(file));
        setIsLoading(true);
        setData(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("/api/forensics", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) throw new Error("Analysis failed");

            const result = await response.json();
            setData(result);
            setActiveTab("metadata");
        } catch (error) {
            toast({
                title: "Analysis Failed",
                description: error instanceof Error ? error.message : "Please ensure the backend is running.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const tabs = [
        { id: "metadata" as const, label: "Metadata", icon: Camera },
        { id: "ela" as const, label: "Error Level Analysis", icon: FileSearch },
        { id: "noise" as const, label: "Noise Analysis", icon: AudioWaveform },
    ];

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <section className="border-b-4 border-foreground bg-muted">
                <div className="container py-12 md:py-16">
                    <Link
                        to="/"
                        className="mb-8 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Home
                    </Link>

                    <div className="mb-4 inline-flex w-fit items-center gap-2 border-2 border-foreground bg-background px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-xs">
                        <Shield className="h-3 w-3" />
                        Forensics
                    </div>
                    <h1 className="text-4xl font-bold uppercase leading-tight tracking-tight md:text-5xl mb-2">
                        Image <span className="text-muted-foreground">Forensics</span>
                    </h1>
                    <p className="max-w-xl text-lg text-muted-foreground mb-8">
                        Analyze images with EXIF metadata extraction, Error Level Analysis (ELA), and noise pattern visualization.
                    </p>

                    {/* Upload */}
                    {!data && !isLoading && (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-4 border-dashed border-foreground bg-card p-12 text-center shadow-md cursor-pointer hover:bg-accent/30 transition-colors max-w-xl"
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
                            <p className="text-lg font-bold uppercase">Upload Image for Analysis</p>
                            <p className="text-sm text-muted-foreground mt-2">PNG, JPG, WEBP — max 20MB</p>
                        </div>
                    )}

                    {/* Loading */}
                    {isLoading && (
                        <div className="border-4 border-foreground bg-card p-12 text-center shadow-md max-w-xl">
                            <Loader2 className="mx-auto h-10 w-10 animate-spin mb-4" />
                            <p className="text-lg font-bold uppercase">Analyzing Image...</p>
                            <p className="text-sm text-muted-foreground mt-2">Running metadata, ELA, and noise analysis</p>
                        </div>
                    )}

                    {/* Results */}
                    {data && (
                        <div className="space-y-6">
                            {/* Tab Navigation */}
                            <div className="flex gap-0 border-4 border-foreground">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === tab.id
                                                ? "bg-foreground text-background"
                                                : "bg-card hover:bg-accent"
                                            } ${tab.id !== "metadata" ? "border-l-2 border-foreground" : ""}`}
                                    >
                                        <tab.icon className="h-4 w-4" />
                                        <span className="hidden sm:inline">{tab.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Metadata Tab */}
                            {activeTab === "metadata" && (
                                <div className="border-4 border-foreground bg-card p-6 shadow-md">
                                    {data.metadata.ai_software_detected && (
                                        <div className="mb-4 flex items-center gap-2 border-2 border-chart-1 bg-chart-1/10 p-3 text-sm font-bold">
                                            <AlertTriangle className="h-4 w-4 text-chart-1" />
                                            <span className="text-chart-1 uppercase">AI generation software detected in metadata!</span>
                                        </div>
                                    )}

                                    <h3 className="text-lg font-bold uppercase mb-4">Image Metadata</h3>
                                    <div className="grid gap-2 text-sm">
                                        {[
                                            ["Format", data.metadata.format],
                                            ["Dimensions", `${data.metadata.width} × ${data.metadata.height}`],
                                            ["Color Mode", data.metadata.mode],
                                            ["Camera", data.metadata.camera],
                                            ["Date/Time", data.metadata.datetime],
                                            ["Software", data.metadata.software],
                                            ["ISO", data.metadata.iso],
                                            ["Exposure", data.metadata.exposure],
                                            ["Focal Length", data.metadata.focal_length],
                                        ].map(([label, value]) => (
                                            <div key={label} className="flex justify-between border-b border-border pb-2">
                                                <span className="text-muted-foreground font-bold uppercase">{label}</span>
                                                <span className="font-mono text-right max-w-[60%] truncate">{value || "Unknown"}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {Object.keys(data.metadata.exif).length > 0 && (
                                        <details className="mt-4">
                                            <summary className="cursor-pointer font-bold uppercase text-xs tracking-wider text-muted-foreground hover:text-foreground">
                                                <Info className="inline h-3.5 w-3.5 mr-1" />
                                                All EXIF Data ({Object.keys(data.metadata.exif).length} fields)
                                            </summary>
                                            <div className="mt-3 max-h-60 overflow-y-auto border-2 border-dashed border-foreground/30 p-3 text-xs">
                                                {Object.entries(data.metadata.exif).map(([key, value]) => (
                                                    <div key={key} className="flex justify-between py-1 border-b border-border/50">
                                                        <span className="text-muted-foreground">{key}</span>
                                                        <span className="font-mono max-w-[50%] truncate text-right">{value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </details>
                                    )}
                                </div>
                            )}

                            {/* ELA Tab */}
                            {activeTab === "ela" && (
                                <div className="border-4 border-foreground bg-card p-6 shadow-md">
                                    <h3 className="text-lg font-bold uppercase mb-2">Error Level Analysis</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        ELA reveals compression inconsistencies. Manipulated regions often have different error levels
                                        than the surrounding image, appearing as brighter areas.
                                    </p>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {previewUrl && (
                                            <div>
                                                <p className="text-xs font-bold uppercase mb-2 text-muted-foreground">Original</p>
                                                <div className="border-2 border-foreground overflow-hidden">
                                                    <img src={previewUrl} alt="Original" className="w-full h-auto" />
                                                </div>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-xs font-bold uppercase mb-2 text-muted-foreground">ELA Result</p>
                                            <div className="border-2 border-foreground overflow-hidden">
                                                <img
                                                    src={`data:image/png;base64,${data.ela_base64}`}
                                                    alt="Error Level Analysis"
                                                    className="w-full h-auto"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 border-2 border-dashed border-foreground/30 bg-muted/50 p-3 text-xs text-muted-foreground">
                                        <strong>How to read:</strong> Uniform brightness = original. Bright spots in specific regions = possible manipulation.
                                        Edges naturally appear bright in ELA.
                                    </div>
                                </div>
                            )}

                            {/* Noise Tab */}
                            {activeTab === "noise" && (
                                <div className="border-4 border-foreground bg-card p-6 shadow-md">
                                    <h3 className="text-lg font-bold uppercase mb-2">Noise Analysis</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Extracts and visualizes the noise pattern. Authentic photos have consistent noise across the image.
                                        Manipulated regions often show different noise patterns.
                                    </p>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {previewUrl && (
                                            <div>
                                                <p className="text-xs font-bold uppercase mb-2 text-muted-foreground">Original</p>
                                                <div className="border-2 border-foreground overflow-hidden">
                                                    <img src={previewUrl} alt="Original" className="w-full h-auto" />
                                                </div>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-xs font-bold uppercase mb-2 text-muted-foreground">Noise Residual</p>
                                            <div className="border-2 border-foreground overflow-hidden">
                                                <img
                                                    src={`data:image/png;base64,${data.noise_base64}`}
                                                    alt="Noise Analysis"
                                                    className="w-full h-auto"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 border-2 border-dashed border-foreground/30 bg-muted/50 p-3 text-xs text-muted-foreground">
                                        <strong>How to read:</strong> Consistent noise = authentic. Abrupt changes in noise texture = possible splicing or AI generation.
                                    </div>
                                </div>
                            )}

                            {/* Reset */}
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setData(null);
                                    setPreviewUrl(null);
                                    if (fileInputRef.current) fileInputRef.current.value = "";
                                }}
                            >
                                Analyze Another Image
                            </Button>
                        </div>
                    )}
                </div>
            </section>

            <footer className="border-t-4 border-foreground bg-card">
                <div className="container py-8">
                    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            <span className="font-bold uppercase tracking-wider">DeepGuard AI</span>
                        </div>
                        <p className="text-sm text-muted-foreground">© 2026 DeepGuard AI</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default ForensicsToolkit;
