import { Cpu, BarChart3 } from "lucide-react";

const metrics = [
    { label: "Realism", precision: "96.83%", recall: "87.08%", f1: "91.70%" },
    { label: "Deepfake", precision: "88.26%", recall: "97.15%", f1: "92.49%" },
];

export const ModelPerformance = () => {
    return (
        <section className="border-b-4 border-foreground">
            <div className="container py-16 md:py-24">
                <div className="mb-12 text-center">
                    <h2 className="text-3xl font-bold uppercase tracking-tight md:text-4xl">
                        Model Performance
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                        Our Vision Transformer achieves state-of-the-art accuracy in
                        deepfake detection, trained on 56,000+ images from 4,800+
                        generators.
                    </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-2">
                    {/* Model Info Card */}
                    <div className="border-4 border-foreground bg-card p-8 shadow-md">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="border-2 border-foreground bg-accent p-2 shadow-xs">
                                <Cpu className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-bold uppercase tracking-wide">
                                Model Details
                            </h3>
                        </div>

                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between border-b border-border pb-3">
                                <span className="text-muted-foreground">Model</span>
                                <span className="font-mono font-bold">
                                    Deep-Fake-Detector-v2
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-border pb-3">
                                <span className="text-muted-foreground">Architecture</span>
                                <span className="font-mono font-bold">
                                    ViT-Base (Patch 16×16)
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-border pb-3">
                                <span className="text-muted-foreground">Base Model</span>
                                <span className="font-mono font-bold">
                                    google/vit-base-patch16-224
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-border pb-3">
                                <span className="text-muted-foreground">Input Size</span>
                                <span className="font-mono font-bold">224 × 224 RGB</span>
                            </div>
                            <div className="flex justify-between border-b border-border pb-3">
                                <span className="text-muted-foreground">Classification</span>
                                <span className="font-mono font-bold">Binary (Real / Fake)</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Overall Accuracy</span>
                                <span className="font-mono text-lg font-bold">92.12%</span>
                            </div>
                        </div>
                    </div>

                    {/* Classification Metrics Card */}
                    <div className="border-4 border-foreground bg-card p-8 shadow-md">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="border-2 border-foreground bg-accent p-2 shadow-xs">
                                <BarChart3 className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-bold uppercase tracking-wide">
                                Classification Metrics
                            </h3>
                        </div>

                        {/* Table */}
                        <div className="border-2 border-foreground">
                            <div className="grid grid-cols-4 border-b-2 border-foreground bg-foreground text-background">
                                <div className="p-3 text-xs font-bold uppercase tracking-wider">
                                    Class
                                </div>
                                <div className="p-3 text-center text-xs font-bold uppercase tracking-wider">
                                    Precision
                                </div>
                                <div className="p-3 text-center text-xs font-bold uppercase tracking-wider">
                                    Recall
                                </div>
                                <div className="p-3 text-center text-xs font-bold uppercase tracking-wider">
                                    F1-Score
                                </div>
                            </div>
                            {metrics.map(({ label, precision, recall, f1 }) => (
                                <div
                                    key={label}
                                    className="grid grid-cols-4 border-b border-border last:border-b-0"
                                >
                                    <div className="p-3 font-bold uppercase text-sm">
                                        {label}
                                    </div>
                                    <div className="p-3 text-center font-mono text-sm">
                                        {precision}
                                    </div>
                                    <div className="p-3 text-center font-mono text-sm">
                                        {recall}
                                    </div>
                                    <div className="p-3 text-center font-mono text-sm font-bold">
                                        {f1}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Visual bars */}
                        <div className="mt-6 space-y-4">
                            <div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-bold uppercase">Realism Detection</span>
                                    <span className="font-mono">91.70%</span>
                                </div>
                                <div className="mt-1.5 h-4 border-2 border-foreground">
                                    <div
                                        className="h-full bg-foreground"
                                        style={{ width: "91.7%" }}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-bold uppercase">Deepfake Detection</span>
                                    <span className="font-mono">92.49%</span>
                                </div>
                                <div className="mt-1.5 h-4 border-2 border-foreground">
                                    <div
                                        className="h-full bg-foreground"
                                        style={{ width: "92.49%" }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
