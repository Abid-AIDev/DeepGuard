import { Header } from "@/components/Header";
import { FeatureCard } from "@/components/FeatureCard";
import { HowItWorks } from "@/components/HowItWorks";
import { UseCases } from "@/components/UseCases";
import { ModelPerformance } from "@/components/ModelPerformance";
import { DeveloperAPI } from "@/components/DeveloperAPI";
import { CTASection } from "@/components/CTASection";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/Animations";
import { Link } from "react-router-dom";
import {
    Shield,
    Cpu,
    Fingerprint,
    Zap,
    Lock,
    FileSearch,
    ArrowRight,
    BarChart3,
} from "lucide-react";

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-background">
            <Header />

            {/* Hero Section */}
            <section className="border-b-4 border-foreground bg-muted">
                <div className="container py-16 md:py-24">
                    <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
                        <FadeIn className="flex flex-col justify-center">
                            <div className="mb-4 inline-flex w-fit items-center gap-2 border-2 border-foreground bg-background px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-xs">
                                <Shield className="h-3 w-3" />
                                AI-Powered Protection
                            </div>
                            <h1 className="text-4xl font-bold uppercase leading-tight tracking-tight md:text-5xl lg:text-6xl">
                                Detect
                                <br />
                                <span className="text-muted-foreground">Deepfakes</span>
                                <br />
                                Instantly
                            </h1>
                            <p className="mt-6 max-w-lg text-lg text-muted-foreground leading-relaxed">
                                DeepGuard AI uses state-of-the-art Vision Transformer technology
                                to identify AI-generated and manipulated images with 92% accuracy.
                                Protect your organization from synthetic media threats.
                            </p>
                            <div className="mt-8 flex flex-wrap items-center gap-4">
                                <Link
                                    to="/deepfake"
                                    className="inline-flex items-center gap-2 border-4 border-foreground bg-foreground px-6 py-3 font-bold uppercase text-background shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-sm"
                                >
                                    Get Started
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <a
                                    href="#features"
                                    className="inline-flex items-center gap-2 border-4 border-foreground bg-background px-6 py-3 font-bold uppercase shadow-md transition-all hover:bg-accent"
                                >
                                    Learn More
                                </a>
                            </div>
                        </FadeIn>

                        {/* Hero Image */}
                        <FadeIn delay={0.2} className="flex items-center justify-center">
                            <div className="border-4 border-foreground bg-card p-4 shadow-lg">
                                <img
                                    src="/hero-illustration.png"
                                    alt="DeepGuard AI — Deepfake vs Real detection illustration"
                                    className="h-auto w-full max-w-md"
                                />
                            </div>
                        </FadeIn>
                    </div>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="bg-foreground text-background">
                <div className="container py-12">
                    <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                        <div className="text-center">
                            <div className="text-3xl font-bold md:text-4xl">92%</div>
                            <div className="mt-1 text-sm uppercase tracking-wide opacity-70">
                                Accuracy
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold md:text-4xl">&lt;2s</div>
                            <div className="mt-1 text-sm uppercase tracking-wide opacity-70">
                                Processing
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold md:text-4xl">4.8K+</div>
                            <div className="mt-1 text-sm uppercase tracking-wide opacity-70">
                                Generators Detected
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold md:text-4xl">ViT</div>
                            <div className="mt-1 text-sm uppercase tracking-wide opacity-70">
                                Transformer
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
                            What We Offer
                        </h2>
                        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                            A comprehensive deepfake detection platform powered by cutting-edge
                            AI, designed for security, speed, and developer-friendly integration.
                        </p>
                    </div>

                    <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        <FeatureCard
                            icon={Fingerprint}
                            title="Deepfake Detection"
                            description="Upload any image and get an instant AI vs. real verdict with a detailed confidence score and analysis report."
                        />
                        <FeatureCard
                            icon={Cpu}
                            title="Vision Transformer Model"
                            description="State-of-the-art ViT-based classifier fine-tuned on millions of deepfake samples from 4,800+ AI generators."
                        />
                        <FeatureCard
                            icon={Zap}
                            title="Real-Time Analysis"
                            description="Get results in under 2 seconds with detailed confidence scores, artifact detection, and AI probability breakdown."
                        />
                        <FeatureCard
                            icon={Lock}
                            title="Privacy First"
                            description="Images are processed locally and never stored on our servers. Your data stays completely private and secure."
                        />
                        <FeatureCard
                            icon={FileSearch}
                            title="Watermark Detection"
                            description="Checks for embedded digital watermarks and source signatures to trace the origin of AI-generated content."
                        />
                        <FeatureCard
                            icon={BarChart3}
                            title="Detailed Reports"
                            description="Get comprehensive JSON reports with artifact analysis, PSNR/SSIM image quality metrics, and processing times."
                        />
                    </StaggerContainer>
                </div>
            </section>

            {/* How It Works */}
            <HowItWorks />

            {/* Use Cases */}
            <UseCases />

            {/* Model Performance */}
            <ModelPerformance />

            {/* Developer API */}
            <DeveloperAPI />

            {/* CTA Section */}
            <CTASection />

            {/* Footer */}
            <footer className="border-t-4 border-foreground bg-card">
                <div className="container py-8">
                    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            <span className="font-bold uppercase tracking-wider">
                                DeepGuard AI
                            </span>
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

export default LandingPage;
