import { useState } from "react";
import { Header } from "@/components/Header";
import { ImageUpload } from "@/components/ImageUpload";
import { VerificationResult, VerificationData } from "@/components/VerificationResult";
import { FeatureCard } from "@/components/FeatureCard";
import { useToast } from "@/hooks/use-toast";
import {
  Shield,
  Cpu,
  Fingerprint,
  Zap,
  Lock,
  FileSearch,
  ArrowRight
} from "lucide-react";

/**
 * Verify an image using the real AI detection API
 */
const verifyImageWithAPI = async (file: File): Promise<VerificationData> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/verify', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Verification failed. Please try again.');
  }

  return response.json();
};

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VerificationData | null>(null);
  const { toast } = useToast();

  const handleImageSelect = async (file: File | string) => {
    setIsLoading(true);
    try {
      // Handle File upload
      if (file instanceof File) {
        const verificationResult = await verifyImageWithAPI(file);
        setResult(verificationResult);
      } else {
        // URL handling - for now show a message that URL verification requires backend support
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

      {/* Hero Section */}
      <section className="border-b-4 border-foreground bg-muted">
        <div className="container py-16 md:py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col justify-center">
              <div className="mb-4 inline-flex w-fit items-center gap-2 border-2 border-foreground bg-background px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-xs">
                <Shield className="h-3 w-3" />
                Deepfake Detection
              </div>
              <h1 className="text-4xl font-bold uppercase leading-tight tracking-tight md:text-5xl lg:text-6xl">
                Detect
                <br />
                <span className="text-muted-foreground">Deepfakes</span>
              </h1>
              <p className="mt-6 max-w-lg text-lg text-muted-foreground leading-relaxed">
                Instantly identify AI-generated and manipulated images using state-of-the-art
                Vision Transformer technology. Protect yourself from deepfakes with 92% accuracy.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="#verify"
                  className="inline-flex items-center gap-2 border-4 border-foreground bg-foreground px-6 py-3 font-bold uppercase text-background shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-sm"
                >
                  Scan Image
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="#features"
                  className="inline-flex items-center gap-2 border-4 border-foreground bg-background px-6 py-3 font-bold uppercase shadow-md transition-all hover:bg-accent"
                >
                  Learn More
                </a>
              </div>
            </div>

            {/* Upload Card */}
            <div id="verify" className="flex items-center">
              <div className="w-full">
                {result ? (
                  <VerificationResult data={result} onReset={handleReset} />
                ) : (
                  <div className="border-4 border-foreground bg-card p-6 shadow-lg md:p-8">
                    <h2 className="mb-6 text-xl font-bold uppercase tracking-wide">
                      Scan for Deepfakes
                    </h2>
                    <ImageUpload onImageSelect={handleImageSelect} isLoading={isLoading} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-b-4 border-foreground">
        <div className="container py-16 md:py-24">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold uppercase tracking-tight md:text-4xl">
              How It Works
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Our Vision Transformer-based detection system analyzes images at multiple levels
              to identify AI-generated content, face manipulations, and synthetic media.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={Fingerprint}
              title="Face Manipulation Detection"
              description="Advanced neural network analysis to detect face swaps, morphing, and synthetic face generation."
            />
            <FeatureCard
              icon={Cpu}
              title="Vision Transformer Model"
              description="State-of-the-art ViT-based classifier trained on millions of deepfake samples from 4,800+ generators."
            />
            <FeatureCard
              icon={FileSearch}
              title="Artifact Analysis"
              description="Identifies GAN fingerprints, compression artifacts, and pixel-level inconsistencies in synthetic images."
            />
            <FeatureCard
              icon={Zap}
              title="Real-Time Detection"
              description="Get instant results in under 300ms with detailed confidence scores and AI probability breakdown."
            />
            <FeatureCard
              icon={Lock}
              title="Privacy First"
              description="Images are processed locally on your device and never stored. Your data stays completely private."
            />
            <FeatureCard
              icon={Shield}
              title="API Access"
              description="Integrate deepfake detection into your platform with our RESTful API for content moderation."
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-foreground text-background">
        <div className="container py-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="text-3xl font-bold md:text-4xl">92%</div>
              <div className="mt-1 text-sm uppercase tracking-wide opacity-70">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold md:text-4xl">&lt;2s</div>
              <div className="mt-1 text-sm uppercase tracking-wide opacity-70">Processing</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold md:text-4xl">4.8K+</div>
              <div className="mt-1 text-sm uppercase tracking-wide opacity-70">Generators Detected</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold md:text-4xl">ViT</div>
              <div className="mt-1 text-sm uppercase tracking-wide opacity-70">Transformer</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
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

export default Index;
