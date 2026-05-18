import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import {
    loadAIDetector,
    detectAIImage,
    isAIDetectorLoaded,
    type AILoadProgress,
    type AIDetectionResult,
} from "@/lib/aiDetector";
import {
    Shield,
    ArrowLeft,
    Loader2,
    Download,
    Upload,
    Sparkles,
    Camera,
    Bot,
    CheckCircle2,
    AlertTriangle,
    ImageIcon,
    RotateCcw,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

const AIImageDetect = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<AIDetectionResult | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [fileName, setFileName] = useState("");
    const { toast } = useToast();
    const { user } = useAuth();

    // Model loading state
    const [modelReady, setModelReady] = useState(false);
    const [modelLoading, setModelLoading] = useState(false);
    const [loadProgress, setLoadProgress] = useState(0);
    const [loadStatus, setLoadStatus] = useState("");

    const initModel = useCallback(async () => {
        if (isAIDetectorLoaded()) {
            setModelReady(true);
            return;
        }

        setModelLoading(true);
        setLoadStatus("Downloading AI detection model...");

        try {
            await loadAIDetector((progress: AILoadProgress) => {
                if (progress.status === "progress" && progress.progress) {
                    setLoadProgress(Math.round(progress.progress));
                    const mb = progress.loaded ? (progress.loaded / 1024 / 1024).toFixed(1) : "?";
                    const totalMb = progress.total ? (progress.total / 1024 / 1024).toFixed(1) : "?";
                    setLoadStatus(`Downloading... ${mb}MB / ${totalMb}MB`);
                } else if (progress.status === "done") {
                    setLoadProgress(100);
                    setLoadStatus("Model ready!");
                }
            });
            setModelReady(true);
        } catch (error) {
            console.error("AI model loading failed:", error);
            toast({
                title: "Model Load Failed",
                description: "Could not download the AI detection model.",
                variant: "destructive",
            });
        } finally {
            setModelLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        initModel();
    }, [initModel]);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !file.type.startsWith("image/")) {
            toast({ title: "Invalid file", description: "Please select an image.", variant: "destructive" });
            return;
        }

        if (!modelReady) {
            toast({ title: "Model Loading", description: "Please wait for the model to finish loading.", variant: "destructive" });
            return;
        }

        setPreviewUrl(URL.createObjectURL(file));
        setFileName(file.name);
        setIsLoading(true);
        setResult(null);

        try {
            const detection = await detectAIImage(file);
            setResult(detection);

            // Save to scan history if logged in
            if (user) {
                try {
                    await supabase.from("scans").insert({
                        user_id: user.id,
                        verdict: detection.verdict === "Real" ? "VERIFIED_REAL"
                            : detection.verdict === "Artificial" ? "VERIFIED_AI"
                                : "VERIFIED_AI",
                        confidence: detection.confidence,
                        detection_data: {
                            model_name: "AI-vs-Deepfake-vs-Real",
                            score: detection.confidence,
                            label: detection.verdict,
                            breakdown: detection.breakdown,
                        },
                        watermark_data: {},
                        image_quality: {},
                        reasons: detection.reasons,
                        processing_time_ms: detection.processing_time_ms,
                        image_name: file.name,
                    });
                } catch (err) {
                    console.error("Failed to save scan:", err);
                }
            }
        } catch (error) {
            console.error("AI detection failed:", error);
            toast({
                title: "Detection Failed",
                description: error instanceof Error ? error.message : "Could not analyze the image.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setResult(null);
        setPreviewUrl(null);
        setFileName("");
    };

    const verdictConfig = {
        Artificial: {
            icon: Bot,
            label: "AI-GENERATED",
            color: "text-chart-1",
            bg: "bg-chart-1/10",
            border: "border-chart-1",
            description: "This image appears to be generated by an AI tool (Stable Diffusion, DALL-E, Midjourney, etc.)",
        },
        Deepfake: {
            icon: AlertTriangle,
            label: "DEEPFAKE",
            color: "text-orange-500",
            bg: "bg-orange-500/10",
            border: "border-orange-500",
            description: "This image shows signs of face manipulation (deepfake technology)",
        },
        Real: {
            icon: CheckCircle2,
            label: "AUTHENTIC",
            color: "text-chart-2",
            bg: "bg-chart-2/10",
            border: "border-chart-2",
            description: "This image appears to be an authentic, unmodified photograph",
        },
    };

    const barConfig = [
        { key: "artificial" as const, label: "AI GENERATED", color: "bg-chart-1", icon: Bot },
        { key: "deepfake" as const, label: "DEEPFAKE", color: "bg-orange-500", icon: AlertTriangle },
        { key: "real" as const, label: "AUTHENTIC", color: "bg-chart-2", icon: CheckCircle2 },
    ];

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

                    <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
                        {/* Left column — info */}
                        <div className="flex flex-col justify-center">
                            <div className="mb-4 inline-flex w-fit items-center gap-2 border border-border bg-background rounded-md px-3 py-1 text-xs font-bold tracking-wide shadow-xs">
                                <Sparkles className="h-3 w-3" />
                                AI Image Detection
                            </div>
                            <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
                                Detect{" "}
                                <span className="text-muted-foreground">AI Images</span>
                            </h1>
                            <p className="mt-6 max-w-lg text-lg text-muted-foreground leading-relaxed">
                                Upload any image to determine if it was created by AI tools like Stable Diffusion, DALL-E, or Midjourney — or if it's a real photograph.
                            </p>
                            <div className="mt-8 space-y-3 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <span className="flex h-5 w-5 items-center justify-center bg-primary/10 rounded-lg font-mono text-xs font-bold">✓</span>
                                    3-class detection: AI Art · Deepfake · Real
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="flex h-5 w-5 items-center justify-center bg-primary/10 rounded-lg font-mono text-xs font-bold">✓</span>
                                    Works with any image — not just faces
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="flex h-5 w-5 items-center justify-center bg-primary/10 rounded-lg font-mono text-xs font-bold">✓</span>
                                    100% client-side — images never leave your device
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="flex h-5 w-5 items-center justify-center bg-primary/10 rounded-lg font-mono text-xs font-bold">✓</span>
                                    Powered by Vision Transformer (ViT)
                                </div>
                            </div>
                        </div>

                        {/* Right column — scanner */}
                        <div className="flex items-start">
                            <div className="w-full space-y-4">
                                {/* Model Loading */}
                                {modelLoading && (
                                    <div className="border border-border bg-card rounded-lg p-6 shadow-lg">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Download className="h-5 w-5 animate-bounce" />
                                            <h2 className="text-sm font-bold tracking-wide">Loading AI Model</h2>
                                        </div>
                                        <Progress value={loadProgress} className="h-3 mb-2 border border-border rounded-md" />
                                        <p className="text-xs text-muted-foreground font-mono">{loadStatus}</p>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            First time only — model is cached for future visits.
                                        </p>
                                    </div>
                                )}

                                {/* Result Display */}
                                {result ? (
                                    <div className="space-y-4">
                                        {/* Verdict Card */}
                                        <div className="border border-border bg-card rounded-lg p-6 shadow-lg">
                                            <div className="flex items-center justify-between mb-6">
                                                <h2 className="text-sm font-bold tracking-wide">Detection Result</h2>
                                                <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
                                                    <RotateCcw className="h-3.5 w-3.5" />
                                                    New Scan
                                                </Button>
                                            </div>

                                            {/* Image preview */}
                                            {previewUrl && (
                                                <div className="mb-6 border border-border rounded-md overflow-hidden">
                                                    <img src={previewUrl} alt="Scanned" className="w-full max-h-48 object-cover" />
                                                </div>
                                            )}

                                            {/* Verdict badge */}
                                            {(() => {
                                                const config = verdictConfig[result.verdict];
                                                const Icon = config.icon;
                                                return (
                                                    <div className={`border-2 ${config.border} ${config.bg} p-4 mb-6`}>
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <Icon className={`h-6 w-6 ${config.color}`} />
                                                            <span className={`text-xl font-bold tracking-wide ${config.color}`}>
                                                                {config.label}
                                                            </span>
                                                            <span className={`ml-auto font-mono text-2xl font-bold ${config.color}`}>
                                                                {(result.confidence * 100).toFixed(1)}%
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">{config.description}</p>
                                                        {result.confidence < 0.70 && (
                                                            <div className="mt-3 flex items-center gap-2 border border-amber-500/30 bg-amber-500/5 p-2 text-xs text-amber-500 font-medium">
                                                                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                                                                Low confidence — consider using the Forensics Toolkit for deeper analysis
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })()}

                                            {/* 3-bar breakdown */}
                                            <div className="space-y-3 mb-6">
                                                <h3 className="text-xs font-bold tracking-wide text-muted-foreground">
                                                    Classification Breakdown
                                                </h3>
                                                {barConfig.map(({ key, label, color, icon: BarIcon }) => {
                                                    const score = result.breakdown[key];
                                                    return (
                                                        <div key={key}>
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="flex items-center gap-2 text-xs font-bold tracking-wide">
                                                                    <BarIcon className="h-3.5 w-3.5" />
                                                                    {label}
                                                                </span>
                                                                <span className="font-mono text-sm font-bold">
                                                                    {(score * 100).toFixed(1)}%
                                                                </span>
                                                            </div>
                                                            <div className="h-4 w-full border border-border rounded-md bg-muted overflow-hidden">
                                                                <div
                                                                    className={`h-full ${color} transition-all duration-700 ease-out`}
                                                                    style={{ width: `${score * 100}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Reasons */}
                                            <div className="border-t border-border pt-4">
                                                <h3 className="text-xs font-bold tracking-wide text-muted-foreground mb-3">
                                                    Analysis Details
                                                </h3>
                                                <ul className="space-y-2">
                                                    {result.reasons.map((reason, i) => (
                                                        <li key={i} className="flex items-start gap-2 text-sm">
                                                            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center bg-primary/10 rounded-md font-mono text-[10px] font-bold">
                                                                {i + 1}
                                                            </span>
                                                            {reason}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Processing time */}
                                            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                                                <span className="font-mono">{result.processing_time_ms}ms</span>
                                                <span>·</span>
                                                <span>{fileName}</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    !modelLoading && (
                                        <div className="border border-border bg-card rounded-lg p-6 shadow-lg md:p-8">
                                            <h2 className="mb-6 text-xl font-bold tracking-wide">
                                                Detect AI Images
                                            </h2>

                                            {/* Upload zone */}
                                            <label className="block cursor-pointer">
                                                <div className="border-2 border-dashed border-border/40 p-8 text-center transition-colors hover:border-primary hover:bg-accent/30">
                                                    <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
                                                    <p className="text-lg font-bold">
                                                        Drop Image Here
                                                    </p>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        or click to browse files
                                                    </p>
                                                    <div className="flex items-center justify-center gap-2 mt-3 text-xs text-muted-foreground">
                                                        <ImageIcon className="h-3.5 w-3.5" />
                                                        PNG, JPG, WEBP up to 20MB
                                                    </div>
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileSelect}
                                                    className="hidden"
                                                />
                                            </label>

                                            {isLoading && (
                                                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    <span className="font-bold uppercase text-xs tracking-wider">
                                                        Running 3-class AI analysis...
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="border-t border-border bg-card">
                <div className="container py-8">
                    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            <span className="font-bold tracking-wide">DeepGuard AI</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            © 2026 DeepGuard AI. AI Image Detection — runs 100% in your browser.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default AIImageDetect;
