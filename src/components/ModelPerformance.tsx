import { Cpu, Sparkles } from "lucide-react";
import { FadeIn } from "@/components/Animations";

const deepfakeMetrics = [
    { label: "Realism", precision: "96.83%", recall: "87.08%", f1: "91.70%" },
    { label: "Deepfake", precision: "88.26%", recall: "97.15%", f1: "92.49%" },
];

const aiDetectMetrics = [
    { label: "Artificial", precision: "—", recall: "—", f1: "—" },
    { label: "Deepfake", precision: "—", recall: "—", f1: "—" },
    { label: "Real", precision: "—", recall: "—", f1: "—" },
];

export const ModelPerformance = () => {
    return (
        <section>
            <div className="section-divider" />
            <div className="container py-16 md:py-24">
                <div className="mb-12 text-center">
                    <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
                        Model <span className="gradient-text">Performance</span>
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                        Two Vision Transformer models running in your browser via Transformers.js
                        and ONNX Runtime Web — no server required.
                    </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-2">
                    {/* Deepfake Detector Card */}
                    <FadeIn>
                        <div className="border border-border bg-card rounded-lg p-8 shadow-sm card-glow">
                            <div className="mb-6 flex items-center gap-3">
                                <div className="bg-primary/10 rounded-lg p-2">
                                    <Cpu className="h-5 w-5 text-primary" />
                                </div>
                                <h3 className="text-lg font-bold tracking-wide">
                                    Deepfake Detector
                                </h3>
                            </div>

                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between border-b border-border pb-3">
                                    <span className="text-muted-foreground">Model</span>
                                    <span className="font-mono font-bold">Deep-Fake-Detector-v2</span>
                                </div>
                                <div className="flex justify-between border-b border-border pb-3">
                                    <span className="text-muted-foreground">Architecture</span>
                                    <span className="font-mono font-bold">ViT-Base (16×16)</span>
                                </div>
                                <div className="flex justify-between border-b border-border pb-3">
                                    <span className="text-muted-foreground">Classes</span>
                                    <span className="font-mono font-bold">2 (Real / Deepfake)</span>
                                </div>
                                <div className="flex justify-between border-b border-border pb-3">
                                    <span className="text-muted-foreground">Format</span>
                                    <span className="font-mono font-bold">ONNX (quantized)</span>
                                </div>
                                <div className="flex justify-between border-b border-border pb-3">
                                    <span className="text-muted-foreground">Runtime</span>
                                    <span className="font-mono font-bold">Transformers.js</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Overall Accuracy</span>
                                    <span className="font-mono text-lg font-bold gradient-text">92.12%</span>
                                </div>
                            </div>

                            {/* Metrics Table */}
                            <div className="mt-6 overflow-hidden rounded-lg border border-border">
                                <div className="grid grid-cols-4 aurora-gradient text-white">
                                    <div className="p-3 text-xs font-semibold uppercase tracking-wider">Class</div>
                                    <div className="p-3 text-center text-xs font-semibold uppercase tracking-wider">Precision</div>
                                    <div className="p-3 text-center text-xs font-semibold uppercase tracking-wider">Recall</div>
                                    <div className="p-3 text-center text-xs font-semibold uppercase tracking-wider">F1</div>
                                </div>
                                {deepfakeMetrics.map(({ label, precision, recall, f1 }) => (
                                    <div key={label} className="grid grid-cols-4 border-b border-border last:border-b-0">
                                        <div className="p-3 font-semibold text-sm">{label}</div>
                                        <div className="p-3 text-center font-mono text-sm">{precision}</div>
                                        <div className="p-3 text-center font-mono text-sm">{recall}</div>
                                        <div className="p-3 text-center font-mono text-sm font-bold">{f1}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </FadeIn>

                    {/* AI Image Detector Card */}
                    <FadeIn delay={0.15}>
                        <div className="border border-border bg-card rounded-lg p-8 shadow-sm card-glow">
                            <div className="mb-6 flex items-center gap-3">
                                <div className="bg-primary/10 rounded-lg p-2">
                                    <Sparkles className="h-5 w-5 text-primary" />
                                </div>
                                <h3 className="text-lg font-bold tracking-wide">
                                    AI Image Detector
                                </h3>
                            </div>

                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between border-b border-border pb-3">
                                    <span className="text-muted-foreground">Model</span>
                                    <span className="font-mono font-bold">AI-vs-Deepfake-vs-Real</span>
                                </div>
                                <div className="flex justify-between border-b border-border pb-3">
                                    <span className="text-muted-foreground">Architecture</span>
                                    <span className="font-mono font-bold">ViT-Base (16×16)</span>
                                </div>
                                <div className="flex justify-between border-b border-border pb-3">
                                    <span className="text-muted-foreground">Classes</span>
                                    <span className="font-mono font-bold">3 (Art / Fake / Real)</span>
                                </div>
                                <div className="flex justify-between border-b border-border pb-3">
                                    <span className="text-muted-foreground">Format</span>
                                    <span className="font-mono font-bold">ONNX (quantized)</span>
                                </div>
                                <div className="flex justify-between border-b border-border pb-3">
                                    <span className="text-muted-foreground">Runtime</span>
                                    <span className="font-mono font-bold">Transformers.js</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Input Size</span>
                                    <span className="font-mono text-lg font-bold gradient-text">224 × 224</span>
                                </div>
                            </div>

                            {/* Classes Table */}
                            <div className="mt-6 overflow-hidden rounded-lg border border-border">
                                <div className="grid grid-cols-4 aurora-gradient text-white">
                                    <div className="p-3 text-xs font-semibold uppercase tracking-wider">Class</div>
                                    <div className="p-3 text-center text-xs font-semibold uppercase tracking-wider">Precision</div>
                                    <div className="p-3 text-center text-xs font-semibold uppercase tracking-wider">Recall</div>
                                    <div className="p-3 text-center text-xs font-semibold uppercase tracking-wider">F1</div>
                                </div>
                                {aiDetectMetrics.map(({ label, precision, recall, f1 }) => (
                                    <div key={label} className="grid grid-cols-4 border-b border-border last:border-b-0">
                                        <div className="p-3 font-semibold text-sm">{label}</div>
                                        <div className="p-3 text-center font-mono text-sm">{precision}</div>
                                        <div className="p-3 text-center font-mono text-sm">{recall}</div>
                                        <div className="p-3 text-center font-mono text-sm font-bold">{f1}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </FadeIn>
                </div>
            </div>
        </section>
    );
};
