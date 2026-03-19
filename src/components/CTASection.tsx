import { ArrowRight, Shield, FileSearch } from "lucide-react";
import { Link } from "react-router-dom";
import { FadeIn } from "@/components/Animations";

export const CTASection = () => {
    return (
        <section className="aurora-gradient text-white">
            <div className="container py-16 md:py-24">
                <FadeIn>
                    <div className="mx-auto max-w-3xl text-center">
                        <div className="mx-auto mb-6 inline-flex items-center gap-2 border border-white/20 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-wider">
                            <Shield className="h-3 w-3" />
                            Get Started Today
                        </div>
                        <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">
                            Ready to Protect
                            <br />
                            Your Images?
                        </h2>
                        <p className="mx-auto mt-6 max-w-xl text-lg text-white/70">
                            5 powerful tools running entirely in your browser.
                            No signup, no uploads, no data collection. Start now.
                        </p>
                        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                            <Link
                                to="/deepfake"
                                className="inline-flex items-center gap-2 bg-white text-gray-900 rounded-lg px-8 py-4 font-semibold shadow-md transition-all hover:shadow-lg hover:bg-white/90 active:shadow-sm"
                            >
                                Start Scanning
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                            <Link
                                to="/forensics"
                                className="inline-flex items-center gap-2 border border-white/30 bg-white/10 backdrop-blur-sm rounded-lg px-8 py-4 font-semibold text-white shadow-sm transition-all hover:bg-white/20"
                            >
                                <FileSearch className="h-5 w-5" />
                                Explore Forensics
                            </Link>
                        </div>
                    </div>
                </FadeIn>
            </div>
        </section>
    );
};
