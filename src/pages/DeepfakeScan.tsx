import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { ImageUpload } from "@/components/ImageUpload";
import { VerificationResult, VerificationData } from "@/components/VerificationResult";
import { ModelSelector } from "@/components/ModelSelector";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { loadModel, detectDeepfake, isModelLoaded, type ModelLoadProgress } from "@/lib/detector";
import { Shield, ArrowLeft, Flame, Loader2, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

const DeepfakeScan = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<VerificationData | null>(null);
    const [selectedModel, setSelectedModel] = useState("vit-v2");
    const [enableHeatmap, setEnableHeatmap] = useState(true);
    const { toast } = useToast();
    const { user } = useAuth();

    // Model loading state
    const [modelReady, setModelReady] = useState(false);
    const [modelLoading, setModelLoading] = useState(false);
    const [loadProgress, setLoadProgress] = useState(0);
    const [loadStatus, setLoadStatus] = useState("");

    // Load model on first visit
    const initModel = useCallback(async () => {
        if (isModelLoaded()) {
            setModelReady(true);
            return;
        }

        setModelLoading(true);
        setLoadStatus("Downloading AI model...");

        try {
            await loadModel((progress: ModelLoadProgress) => {
                if (progress.status === "progress" && progress.progress) {
                    setLoadProgress(Math.round(progress.progress));
                    const mb = progress.loaded ? (progress.loaded / 1024 / 1024).toFixed(1) : "?";
                    const totalMb = progress.total ? (progress.total / 1024 / 1024).toFixed(1) : "?";
                    setLoadStatus(`Downloading model... ${mb}MB / ${totalMb}MB`);
                } else if (progress.status === "done") {
                    setLoadProgress(100);
                    setLoadStatus("Model ready!");
                }
            });
            setModelReady(true);
        } catch (error) {
            console.error("Model loading failed:", error);
            toast({
                title: "Model Load Failed",
                description: "Could not download the AI model. Please check your connection and try again.",
                variant: "destructive",
            });
        } finally {
            setModelLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        initModel();
    }, [initModel]);

    const saveScanToHistory = async (data: VerificationData, fileName: string) => {
        if (!user) return;
        try {
            await supabase.from("scans").insert({
                user_id: user.id,
                verdict: data.verdict,
                confidence: data.confidence,
                detection_data: data.detection || {},
                watermark_data: data.watermark || {},
                image_quality: data.image_quality || {},
                reasons: data.reasons || [],
                processing_time_ms: data.processing_time_ms || 0,
                image_name: fileName,
            });
        } catch (err) {
            console.error("Failed to save scan:", err);
        }
    };

    const handleImageSelect = async (file: File | string) => {
        if (!(file instanceof File)) {
            toast({
                title: "URL Verification",
                description: "Please upload an image file directly for verification.",
                variant: "destructive",
            });
            return;
        }

        if (!modelReady) {
            toast({
                title: "Model Loading",
                description: "Please wait for the AI model to finish loading.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            // Run detection client-side
            const verificationResult = await detectDeepfake(file) as unknown as VerificationData;
            setResult(verificationResult);
            await saveScanToHistory(verificationResult, file.name);
        } catch (error) {
            console.error("Verification failed:", error);
            toast({
                title: "Verification Failed",
                description: error instanceof Error ? error.message : "Could not verify the image.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setResult(null);
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

                    <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
                        <div className="flex flex-col justify-center">
                            <div className="mb-4 inline-flex w-fit items-center gap-2 border border-border bg-background rounded-md px-3 py-1 text-xs font-bold tracking-wide shadow-xs">
                                <Shield className="h-3 w-3" />
                                Deepfake Scanner
                            </div>
                            <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
                                Scan Your
                                <br />
                                <span className="text-muted-foreground">Image</span>
                            </h1>
                            <p className="mt-6 max-w-lg text-lg text-muted-foreground leading-relaxed">
                                Upload an image to instantly detect if it's AI-generated or authentic.
                                All analysis runs directly in your browser — your images never leave your device.
                            </p>
                            <div className="mt-8 space-y-3 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <span className="flex h-5 w-5 items-center justify-center bg-primary/10 rounded-lg font-mono text-xs font-bold">✓</span>
                                    100% client-side — images never uploaded
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="flex h-5 w-5 items-center justify-center bg-primary/10 rounded-lg font-mono text-xs font-bold">✓</span>
                                    Vision Transformer AI detection
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="flex h-5 w-5 items-center justify-center bg-primary/10 rounded-lg font-mono text-xs font-bold">✓</span>
                                    Detailed confidence scores and reports
                                </div>
                                {user && (
                                    <div className="flex items-center gap-2">
                                        <span className="flex h-5 w-5 items-center justify-center bg-primary/10 rounded-lg font-mono text-xs font-bold">✓</span>
                                        Auto-saved to your scan history
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Scan Card */}
                        <div className="flex items-start">
                            <div className="w-full space-y-4">
                                {/* Model Loading Indicator */}
                                {modelLoading && (
                                    <div className="border border-border bg-card rounded-lg p-6 shadow-lg">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Download className="h-5 w-5 animate-bounce" />
                                            <h2 className="text-sm font-bold tracking-wide">
                                                Loading AI Model
                                            </h2>
                                        </div>
                                        <Progress value={loadProgress} className="h-3 mb-2 border border-border rounded-md" />
                                        <p className="text-xs text-muted-foreground font-mono">{loadStatus}</p>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            First time only — model is cached for future visits.
                                        </p>
                                    </div>
                                )}

                                {result ? (
                                    <VerificationResult data={result} onReset={handleReset} />
                                ) : (
                                    !modelLoading && (
                                        <>
                                            <div className="border border-border bg-card rounded-lg p-6 shadow-lg md:p-8">
                                                <h2 className="mb-6 text-xl font-bold tracking-wide">
                                                    Scan for Deepfakes
                                                </h2>

                                                {/* Model Selector */}
                                                <div className="mb-6">
                                                    <ModelSelector selectedModel={selectedModel} onModelChange={setSelectedModel} />
                                                </div>

                                                {/* Heatmap Toggle */}
                                                <div className="mb-6">
                                                    <label className="flex items-center gap-3 cursor-pointer">
                                                        <div
                                                            className={`relative flex h-6 w-11 items-center rounded-none border border-border rounded-md transition-colors ${enableHeatmap ? "bg-destructive" : "bg-muted"
                                                                }`}
                                                            onClick={() => setEnableHeatmap(!enableHeatmap)}
                                                        >
                                                            <div
                                                                className={`absolute h-4 w-4 border border-border rounded-md bg-background transition-transform ${enableHeatmap ? "translate-x-5" : "translate-x-0.5"
                                                                    }`}
                                                            />
                                                        </div>
                                                        <span className="flex items-center gap-2 text-xs font-bold tracking-wide">
                                                            <Flame className="h-3.5 w-3.5 text-destructive" />
                                                            Generate Heatmap
                                                        </span>
                                                    </label>
                                                </div>

                                                <ImageUpload onImageSelect={handleImageSelect} isLoading={isLoading} />

                                                {isLoading && (
                                                    <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        <span className="font-bold uppercase text-xs tracking-wider">Running AI analysis...</span>
                                                    </div>
                                                )}
                                            </div>
                                        </>
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
                            © 2026 DeepGuard AI. Powered by Vision Transformer — runs 100% in your browser.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default DeepfakeScan;
