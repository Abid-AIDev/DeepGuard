import { useState } from "react";
import { Header } from "@/components/Header";
import { ImageUpload } from "@/components/ImageUpload";
import { VerificationResult, VerificationData } from "@/components/VerificationResult";
import { ModelSelector } from "@/components/ModelSelector";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { Shield, ArrowLeft, Flame } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * Verify an image using the real AI detection API
 */
const verifyImageWithAPI = async (
    file: File,
    model: string,
    heatmap: boolean
): Promise<VerificationData> => {
    const formData = new FormData();
    formData.append("file", file);

    const params = new URLSearchParams();
    params.set("model", model);
    if (heatmap) params.set("heatmap", "true");

    const response = await fetch(`/api/verify?${params.toString()}`, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Verification failed. Please try again.");
    }

    return response.json();
};

const DeepfakeScan = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<VerificationData | null>(null);
    const [selectedModel, setSelectedModel] = useState("vit-v2");
    const [enableHeatmap, setEnableHeatmap] = useState(true);
    const { toast } = useToast();
    const { user } = useAuth();

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
        setIsLoading(true);
        try {
            if (file instanceof File) {
                const verificationResult = await verifyImageWithAPI(file, selectedModel, enableHeatmap);
                setResult(verificationResult);
                await saveScanToHistory(verificationResult, file.name);
            } else {
                toast({
                    title: "URL Verification",
                    description: "Please upload an image file directly for verification.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Verification failed:", error);
            toast({
                title: "Verification Failed",
                description: error instanceof Error ? error.message : "Could not verify the image. Please ensure the backend is running.",
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

            <section className="border-b-4 border-foreground bg-muted">
                <div className="container py-12 md:py-16">
                    <Link
                        to="/"
                        className="mb-8 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Home
                    </Link>

                    <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
                        <div className="flex flex-col justify-center">
                            <div className="mb-4 inline-flex w-fit items-center gap-2 border-2 border-foreground bg-background px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-xs">
                                <Shield className="h-3 w-3" />
                                Deepfake Scanner
                            </div>
                            <h1 className="text-4xl font-bold uppercase leading-tight tracking-tight md:text-5xl">
                                Scan Your
                                <br />
                                <span className="text-muted-foreground">Image</span>
                            </h1>
                            <p className="mt-6 max-w-lg text-lg text-muted-foreground leading-relaxed">
                                Upload an image to instantly detect if it's AI-generated or authentic.
                                Choose a detection model and enable heatmap visualization for deeper insights.
                            </p>
                            <div className="mt-8 space-y-3 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <span className="flex h-5 w-5 items-center justify-center border-2 border-foreground bg-accent font-mono text-xs font-bold">✓</span>
                                    Multiple AI detection models
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="flex h-5 w-5 items-center justify-center border-2 border-foreground bg-accent font-mono text-xs font-bold">✓</span>
                                    Attention heatmap visualization
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="flex h-5 w-5 items-center justify-center border-2 border-foreground bg-accent font-mono text-xs font-bold">✓</span>
                                    Detailed confidence scores and reports
                                </div>
                                {user && (
                                    <div className="flex items-center gap-2">
                                        <span className="flex h-5 w-5 items-center justify-center border-2 border-foreground bg-accent font-mono text-xs font-bold">✓</span>
                                        Auto-saved to your scan history
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Scan Card */}
                        <div className="flex items-start">
                            <div className="w-full space-y-4">
                                {result ? (
                                    <VerificationResult data={result} onReset={handleReset} />
                                ) : (
                                    <>
                                        <div className="border-4 border-foreground bg-card p-6 shadow-lg md:p-8">
                                            <h2 className="mb-6 text-xl font-bold uppercase tracking-wide">
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
                                                        className={`relative flex h-6 w-11 items-center rounded-none border-2 border-foreground transition-colors ${enableHeatmap ? "bg-destructive" : "bg-muted"
                                                            }`}
                                                        onClick={() => setEnableHeatmap(!enableHeatmap)}
                                                    >
                                                        <div
                                                            className={`absolute h-4 w-4 border border-foreground bg-background transition-transform ${enableHeatmap ? "translate-x-5" : "translate-x-0.5"
                                                                }`}
                                                        />
                                                    </div>
                                                    <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                                                        <Flame className="h-3.5 w-3.5 text-destructive" />
                                                        Generate Heatmap
                                                    </span>
                                                </label>
                                            </div>

                                            <ImageUpload onImageSelect={handleImageSelect} isLoading={isLoading} />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="border-t-4 border-foreground bg-card">
                <div className="container py-8">
                    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            <span className="font-bold uppercase tracking-wider">DeepGuard AI</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            © 2026 DeepGuard AI. Powered by Vision Transformer.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default DeepfakeScan;
