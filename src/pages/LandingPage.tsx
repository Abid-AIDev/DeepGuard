import { Header } from "@/components/Header";
import { FeatureCard } from "@/components/FeatureCard";
import { HowItWorks } from "@/components/HowItWorks";
import { UseCases } from "@/components/UseCases";
import { ModelPerformance } from "@/components/ModelPerformance";
import { TechStack } from "@/components/TechStack";
import { CTASection } from "@/components/CTASection";
import { FadeIn, StaggerContainer, StaggerItem, CountUp, FloatingParticles } from "@/components/Animations";
import { Link } from "react-router-dom";
import {
    Shield,
    Cpu,
    Fingerprint,
    Zap,
    Lock,
    FileSearch,
    ArrowRight,
    Sparkles,
    Layers,
    ShieldCheck,
    WifiOff,
} from "lucide-react";

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-background">
            <Header />

            {/* Hero Section */}
            <section className="relative bg-muted overflow-hidden">
                <FloatingParticles count={15} />
                <div className="container py-16 md:py-24">
                    <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
                        <FadeIn className="flex flex-col justify-center">
                            <div className="shimmer mb-4 inline-flex w-fit items-center gap-2 border border-border bg-background/80 backdrop-blur-sm rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-wider">
                                <Shield className="h-3 w-3" />
                                100% Client-Side · Zero Uploads
                            </div>
                            <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-5xl lg:text-6xl">
                                Your Complete
                                <br />
                                <span className="gradient-text">AI Image</span>
                                <br />
                                Intelligence
                            </h1>
                            <p className="mt-6 max-w-lg text-lg text-muted-foreground leading-relaxed">
                                DeepGuard AI runs entirely in your browser — no uploads,
                                no servers, no data collection. Detect deepfakes, identify
                                AI-generated art, run forensic analysis, and encrypt secret
                                messages inside images.
                            </p>
                            <div className="mt-8 flex flex-wrap items-center gap-4">
                                <Link
                                    to="/deepfake"
                                    className="inline-flex items-center gap-2 aurora-gradient text-white rounded-lg px-6 py-3 font-semibold btn-glow transition-all hover:opacity-90 active:shadow-sm"
                                >
                                    Start Scanning
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <a
                                    href="#features"
                                    className="inline-flex items-center gap-2 border border-border bg-background/80 backdrop-blur-sm rounded-lg px-6 py-3 font-semibold shadow-sm transition-all hover:bg-accent/10 hover:border-primary/30"
                                >
                                    Explore Tools
                                </a>
                            </div>
                        </FadeIn>

                        {/* Hero Visual */}
                        <FadeIn delay={0.2} className="flex items-center justify-center">
                            <div className="border border-border bg-card rounded-xl p-4 shadow-lg card-glow">
                                <img
                                    src="/hero-illustration.png"
                                    alt="DeepGuard AI — Deepfake detection and image forensics"
                                    className="h-auto w-full max-w-md"
                                />
                            </div>
                        </FadeIn>
                    </div>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="aurora-gradient text-white">
                <div className="container py-12">
                    <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                        <div className="text-center">
                            <div className="text-3xl font-bold md:text-4xl"><CountUp value={5} /></div>
                            <div className="mt-1 text-sm uppercase tracking-wide opacity-70">
                                AI Tools
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold md:text-4xl"><CountUp value={100} suffix="%" /></div>
                            <div className="mt-1 text-sm uppercase tracking-wide opacity-70">
                                Client-Side
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold md:text-4xl"><CountUp value={0} /></div>
                            <div className="mt-1 text-sm uppercase tracking-wide opacity-70">
                                Data Uploaded
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
            <section id="features">
                <div className="container py-16 md:py-24">
                    <div className="mb-12 text-center">
                        <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
                            What We <span className="gradient-text">Offer</span>
                        </h2>
                        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                            A complete image intelligence platform — deepfake detection,
                            AI art identification, forensic analysis, and steganographic
                            encryption — all running 100% in your browser.
                        </p>
                    </div>

                    <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        <Link to="/deepfake" className="group">
                            <FeatureCard
                                icon={Fingerprint}
                                title="Deepfake Detection"
                                description="Binary ViT model detecting face-swap manipulations. Upload a face photo and get a real/fake verdict with detailed confidence score."
                                className="h-full group-hover:border-chart-1 transition-colors"
                            />
                        </Link>
                        <Link to="/ai-detect" className="group">
                            <FeatureCard
                                icon={Sparkles}
                                title="AI Image Detection"
                                description="3-class model identifying AI-generated art (Stable Diffusion, DALL-E, Midjourney), deepfakes, and real photos — works with any image."
                                className="h-full group-hover:border-chart-2 transition-colors"
                            />
                        </Link>
                        <Link to="/batch" className="group">
                            <FeatureCard
                                icon={Layers}
                                title="Batch Scanning"
                                description="Process up to 20 images at once with per-image verdicts displayed in real-time. Export results as CSV for reporting."
                                className="h-full group-hover:border-chart-3 transition-colors"
                            />
                        </Link>
                        <Link to="/forensics" className="group">
                            <FeatureCard
                                icon={FileSearch}
                                title="Forensics Toolkit"
                                description="ELA, noise analysis, RGB histogram, EXIF/GPS extraction, SHA-256 hash, and composite integrity scoring — all in the browser."
                                className="h-full group-hover:border-chart-4 transition-colors"
                            />
                        </Link>
                        <Link to="/stegocrypt" className="group">
                            <FeatureCard
                                icon={Lock}
                                title="StegoCrypt"
                                description="AES-256 encryption hidden inside images using LSB steganography. Invisible to the naked eye, recoverable only with the password."
                                className="h-full group-hover:border-chart-5 transition-colors"
                            />
                        </Link>
                        <FeatureCard
                            icon={ShieldCheck}
                            title="Privacy First"
                            description="All AI models run in your browser via ONNX Runtime Web. Images never leave your device — zero server dependency, zero data collection."
                        />
                        <FeatureCard
                            icon={Cpu}
                            title="Vision Transformer"
                            description="Powered by ViT-Base (patch 16×16) models fine-tuned for deepfake and AI detection, running via Transformers.js in the browser."
                        />
                        <FeatureCard
                            icon={WifiOff}
                            title="Works Offline"
                            description="After the first model download (~50MB, cached in IndexedDB), the app works fully offline — no internet needed for analysis."
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

            {/* Technology Stack */}
            <TechStack />

            {/* CTA Section */}
            <CTASection />

            {/* Footer */}
            <div className="section-divider" />
            <footer className="bg-card">
                <div className="container py-8">
                    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            <span className="font-bold tracking-wide">
                                DeepGuard AI
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            © 2026 DeepGuard AI. 100% client-side — your images never leave your browser.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
