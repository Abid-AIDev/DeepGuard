import { ChevronDown } from "lucide-react";

interface ModelSelectorProps {
    selectedModel: string;
    onModelChange: (model: string) => void;
}

const MODELS = [
    {
        id: "ensemble",
        name: "Ensemble (Recommended)",
        description: "Runs all models and averages results for highest accuracy",
        badge: "Best Accuracy",
    },
    {
        id: "vit-v2",
        name: "Deep-Fake-Detector v2",
        description: "ViT-Base — General purpose deepfake detection",
        badge: "Fast",
    },
    {
        id: "ai-detector",
        name: "AI Image Detector",
        description: "ViT-Large — Specialized for AI-generated art",
        badge: "AI Art",
    },
    {
        id: "sdxl-detector",
        name: "SDXL Detector",
        description: "CLIP-based — Tuned for Stable Diffusion outputs",
        badge: "SD/SDXL",
    },
];

export const ModelSelector = ({ selectedModel, onModelChange }: ModelSelectorProps) => {
    return (
        <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Detection Model
            </label>
            <div className="relative">
                <select
                    value={selectedModel}
                    onChange={(e) => onModelChange(e.target.value)}
                    className="w-full appearance-none border-2 border-foreground bg-background px-4 py-2.5 pr-10 text-sm font-bold uppercase tracking-wide shadow-xs focus:outline-none focus:ring-2 focus:ring-foreground cursor-pointer"
                >
                    {MODELS.map((model) => (
                        <option key={model.id} value={model.id}>
                            {model.name}
                        </option>
                    ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            </div>

            {/* Model info card */}
            {MODELS.filter((m) => m.id === selectedModel).map((model) => (
                <div
                    key={model.id}
                    className="flex items-start gap-3 border-2 border-dashed border-foreground/30 bg-muted/50 px-3 py-2"
                >
                    <span className="mt-0.5 inline-block border border-foreground bg-accent px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                        {model.badge}
                    </span>
                    <p className="text-xs text-muted-foreground">{model.description}</p>
                </div>
            ))}
        </div>
    );
};
