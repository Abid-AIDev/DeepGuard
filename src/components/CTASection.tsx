import { ArrowRight, Shield } from "lucide-react";
import { Link } from "react-router-dom";

export const CTASection = () => {
    return (
        <section className="bg-foreground text-background">
            <div className="container py-16 md:py-24">
                <div className="mx-auto max-w-3xl text-center">
                    <div className="mx-auto mb-6 inline-flex items-center gap-2 border-2 border-background bg-background/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider">
                        <Shield className="h-3 w-3" />
                        Get Started Today
                    </div>
                    <h2 className="text-3xl font-bold uppercase tracking-tight md:text-5xl">
                        Ready to Detect
                        <br />
                        Deepfakes?
                    </h2>
                    <p className="mx-auto mt-6 max-w-xl text-lg text-background/70">
                        Start scanning images for free. No signup required, no data
                        stored. Upload an image and get results in seconds.
                    </p>
                    <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                        <Link
                            to="/deepfake"
                            className="inline-flex items-center gap-2 border-4 border-background bg-background px-8 py-4 font-bold uppercase text-foreground shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-sm"
                        >
                            Start Scanning
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};
