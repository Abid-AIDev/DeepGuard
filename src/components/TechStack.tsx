import { Code, Cpu, Image, Lock, MapPin, Database } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/Animations";

const technologies = [
    {
        icon: Code,
        name: "Transformers.js",
        category: "AI Inference",
        description: "Run HuggingFace models directly in the browser — no server needed.",
    },
    {
        icon: Cpu,
        name: "ONNX Runtime Web",
        category: "Engine",
        description: "Hardware-accelerated neural network inference with WebGPU/WASM support.",
    },
    {
        icon: Image,
        name: "Canvas API",
        category: "Forensics",
        description: "Pixel-level image analysis — ELA, noise detection, and histogram generation.",
    },
    {
        icon: Lock,
        name: "Web Crypto API",
        category: "Security",
        description: "Native SHA-256 hashing and AES-256 encryption for steganography.",
    },
    {
        icon: MapPin,
        name: "exifr",
        category: "Metadata",
        description: "Parse EXIF, GPS coordinates, ICC profiles, and camera metadata from images.",
    },
    {
        icon: Database,
        name: "IndexedDB",
        category: "Caching",
        description: "Model weights cached locally — download once, load instantly forever.",
    },
];

export const TechStack = () => {
    return (
        <section className="bg-muted/50">
            <div className="section-divider" />
            <div className="container py-16 md:py-24">
                <div className="mb-12 text-center">
                    <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
                        Technology <span className="gradient-text">Stack</span>
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                        Built with modern browser APIs and open-source libraries.
                        No backend, no cloud — everything runs on your device.
                    </p>
                </div>

                <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {technologies.map(({ icon: Icon, name, category, description }) => (
                        <StaggerItem
                            key={name}
                            className="flex items-start gap-4 border border-border bg-card rounded-lg p-5 shadow-sm card-glow transition-all"
                        >
                            <div className="shrink-0 bg-primary/10 rounded-lg p-2.5">
                                <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-sm tracking-wide">
                                        {name}
                                    </h4>
                                    <span className="border border-primary/30 text-primary rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider">
                                        {category}
                                    </span>
                                </div>
                                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                                    {description}
                                </p>
                            </div>
                        </StaggerItem>
                    ))}
                </StaggerContainer>
            </div>
        </section>
    );
};
