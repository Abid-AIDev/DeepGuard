import { useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Shield,
  Cpu,
  FileText,
  Copy,
  Check,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { HeatmapOverlay } from "@/components/HeatmapOverlay";
import { cn } from "@/lib/utils";

export interface VerificationData {
  verdict: "VERIFIED_AI" | "VERIFIED_REAL" | "UNVERIFIED";
  confidence: number;
  watermark: {
    present: boolean;
    valid: boolean;
    source_id: string | null;
    timestamp: string | null;
    payload: Record<string, string> | null;
  };
  detection: {
    model_name: string;
    model_version: string;
    score: number;
    label: string;
    artifact_types: string[];
  };
  image_quality: {
    psnr: number;
    ssim: number;
  };
  reasons: string[];
  processing_time_ms: number;
  heatmap_base64?: string;
}

interface VerificationResultProps {
  data: VerificationData;
  onReset: () => void;
}

const VerdictBadge = ({ verdict, confidence }: { verdict: VerificationData["verdict"]; confidence: number }) => {
  const config = {
    VERIFIED_AI: {
      icon: Cpu,
      label: "Deepfake Detected",
      bgClass: "bg-chart-1/10 border-chart-1",
      textClass: "text-chart-1",
    },
    VERIFIED_REAL: {
      icon: CheckCircle2,
      label: "Authentic Image",
      bgClass: "bg-chart-2/10 border-chart-2",
      textClass: "text-chart-2",
    },
    UNVERIFIED: {
      icon: HelpCircle,
      label: "Inconclusive",
      bgClass: "bg-chart-4/10 border-chart-4",
      textClass: "text-chart-4",
    },
  };

  const { icon: Icon, label, bgClass, textClass } = config[verdict];

  return (
    <div className={cn("border-4 p-6 text-center shadow-md", bgClass)}>
      <Icon className={cn("mx-auto h-12 w-12", textClass)} />
      <h2 className={cn("mt-3 text-2xl font-bold uppercase tracking-wider", textClass)}>
        {label}
      </h2>
      <div className="mt-4">
        <div className="flex items-center justify-between text-sm font-medium">
          <span>Confidence</span>
          <span className={textClass}>{Math.round(confidence * 100)}%</span>
        </div>
        <Progress value={confidence * 100} className="mt-2 h-3" />
      </div>
    </div>
  );
};

export const VerificationResult = ({ data, onReset }: VerificationResultProps) => {
  const [showTechnical, setShowTechnical] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <VerdictBadge verdict={data.verdict} confidence={data.confidence} />

      {/* Heatmap Section */}
      {data.heatmap_base64 && (
        <>
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className="flex w-full items-center justify-between border-4 border-foreground bg-destructive/10 p-4 font-bold uppercase transition-all hover:bg-destructive/20"
          >
            <span className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-destructive" />
              Attention Heatmap
            </span>
            {showHeatmap ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
          {showHeatmap && (
            <div className="border-4 border-foreground bg-card p-6 shadow-md">
              <HeatmapOverlay heatmapBase64={data.heatmap_base64} />
            </div>
          )}
        </>
      )}

      {/* Summary */}
      <div className="border-4 border-foreground bg-card p-6 shadow-md">
        <h3 className="flex items-center gap-2 text-lg font-bold uppercase">
          <FileText className="h-5 w-5" />
          Analysis Summary
        </h3>
        <ul className="mt-4 space-y-3">
          {data.reasons.map((reason, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border-2 border-foreground bg-accent font-mono text-xs font-bold">
                {i + 1}
              </span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Watermark Status */}
      <div className="border-4 border-foreground bg-card p-6 shadow-md">
        <h3 className="flex items-center gap-2 text-lg font-bold uppercase">
          <Shield className="h-5 w-5" />
          Watermark Status
        </h3>
        <div className="mt-4 grid gap-3 text-sm">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <span className="text-muted-foreground">Present</span>
            <span className={cn("font-bold uppercase", data.watermark.present ? "text-chart-2" : "text-muted-foreground")}>
              {data.watermark.present ? "Yes" : "No"}
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-border pb-2">
            <span className="text-muted-foreground">Valid Signature</span>
            <span className={cn("font-bold uppercase", data.watermark.valid ? "text-chart-2" : "text-chart-1")}>
              {data.watermark.valid ? "Yes" : "No"}
            </span>
          </div>
          {data.watermark.source_id && (
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Source</span>
              <span className="font-mono font-bold">{data.watermark.source_id}</span>
            </div>
          )}
          {data.watermark.timestamp && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Timestamp</span>
              <span className="font-mono text-xs">{new Date(data.watermark.timestamp).toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Technical Details Toggle */}
      <button
        onClick={() => setShowTechnical(!showTechnical)}
        className="flex w-full items-center justify-between border-4 border-foreground bg-muted p-4 font-bold uppercase transition-all hover:bg-accent"
      >
        <span>Technical Details</span>
        {showTechnical ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
      </button>

      {showTechnical && (
        <div className="space-y-4">
          {/* Detection Model */}
          <div className="border-4 border-foreground bg-card p-6 shadow-md">
            <h3 className="text-lg font-bold uppercase">Detection Model</h3>
            <div className="mt-4 grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Model</span>
                <span className="font-mono">{data.detection.model_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Version</span>
                <span className="font-mono">{data.detection.model_version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Score</span>
                <span className="font-mono font-bold">{data.detection.score.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Classification</span>
                <span className="font-bold uppercase">{data.detection.label}</span>
              </div>
              {data.detection.artifact_types.length > 0 && (
                <div className="mt-2">
                  <span className="text-muted-foreground">Artifacts Detected:</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {data.detection.artifact_types.map((artifact) => (
                      <span
                        key={artifact}
                        className="border-2 border-foreground bg-accent px-2 py-1 font-mono text-xs uppercase"
                      >
                        {artifact.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Image Quality */}
          <div className="border-4 border-foreground bg-card p-6 shadow-md">
            <h3 className="text-lg font-bold uppercase">Image Quality Metrics</h3>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="border-2 border-foreground p-4 text-center">
                <div className="text-2xl font-bold font-mono">{data.image_quality.psnr.toFixed(1)}</div>
                <div className="mt-1 text-xs text-muted-foreground uppercase">PSNR (dB)</div>
              </div>
              <div className="border-2 border-foreground p-4 text-center">
                <div className="text-2xl font-bold font-mono">{data.image_quality.ssim.toFixed(2)}</div>
                <div className="mt-1 text-xs text-muted-foreground uppercase">SSIM</div>
              </div>
            </div>
          </div>

          {/* Processing Info */}
          <div className="flex items-center justify-between border-4 border-foreground bg-muted p-4 text-sm">
            <span className="text-muted-foreground">Processing Time</span>
            <span className="font-mono font-bold">{data.processing_time_ms}ms</span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={onReset} variant="outline" className="flex-1">
          Verify Another Image
        </Button>
        <Button onClick={handleCopyJson} variant="secondary" className="flex-1">
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              Copy JSON Report
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
