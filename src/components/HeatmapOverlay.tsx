import { useState } from "react";
import { Eye, EyeOff, Layers } from "lucide-react";

interface HeatmapOverlayProps {
    heatmapBase64: string;
    originalImageUrl?: string;
}

export const HeatmapOverlay = ({ heatmapBase64, originalImageUrl }: HeatmapOverlayProps) => {
    const [showHeatmap, setShowHeatmap] = useState(true);
    const [opacity, setOpacity] = useState(70);

    return (
        <div className="space-y-4">
            {/* Controls */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setShowHeatmap(!showHeatmap)}
                    className={`inline-flex items-center gap-2 border-2 border-foreground px-3 py-1.5 text-xs font-bold uppercase tracking-wide shadow-xs transition-colors ${showHeatmap ? "bg-destructive text-destructive-foreground" : "bg-background hover:bg-accent"
                        }`}
                >
                    {showHeatmap ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    {showHeatmap ? "Heatmap ON" : "Heatmap OFF"}
                </button>

                {showHeatmap && (
                    <div className="flex items-center gap-2">
                        <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs font-bold uppercase text-muted-foreground">Opacity</span>
                        <input
                            type="range"
                            min={10}
                            max={100}
                            value={opacity}
                            onChange={(e) => setOpacity(Number(e.target.value))}
                            className="h-2 w-24 cursor-pointer accent-destructive"
                        />
                        <span className="w-8 text-xs font-mono font-bold text-muted-foreground">{opacity}%</span>
                    </div>
                )}
            </div>

            {/* Image Display */}
            <div className="relative border-4 border-foreground overflow-hidden shadow-md">
                {/* Heatmap image (blended on backend) */}
                {showHeatmap ? (
                    <img
                        src={`data:image/png;base64,${heatmapBase64}`}
                        alt="Attention heatmap overlay"
                        className="w-full h-auto"
                        style={{ opacity: opacity / 100 }}
                    />
                ) : originalImageUrl ? (
                    <img
                        src={originalImageUrl}
                        alt="Original image"
                        className="w-full h-auto"
                    />
                ) : (
                    <img
                        src={`data:image/png;base64,${heatmapBase64}`}
                        alt="Attention heatmap"
                        className="w-full h-auto"
                    />
                )}

                {/* Legend */}
                {showHeatmap && (
                    <div className="absolute bottom-3 right-3 border-2 border-foreground bg-background/90 px-3 py-2 text-xs font-bold uppercase">
                        <div className="flex items-center gap-2">
                            <div className="flex h-3 w-20 overflow-hidden border border-foreground">
                                <div className="w-1/4 bg-blue-600" />
                                <div className="w-1/4 bg-green-500" />
                                <div className="w-1/4 bg-yellow-400" />
                                <div className="w-1/4 bg-red-600" />
                            </div>
                            <span>Low → High Attention</span>
                        </div>
                    </div>
                )}
            </div>

            <p className="text-xs text-muted-foreground">
                <strong>Heatmap:</strong> Red/yellow areas show where the AI focused most during detection.
                High-attention regions in AI-generated images often correspond to GAN artifacts or inconsistent textures.
            </p>
        </div>
    );
};
