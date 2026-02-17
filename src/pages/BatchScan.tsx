import { useState, useRef } from "react";
import { Header } from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import {
    Shield,
    ArrowLeft,
    Upload,
    CheckCircle2,
    AlertTriangle,
    HelpCircle,
    Loader2,
    Download,
    Trash2,
    FileImage,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BatchResult {
    filename: string;
    status: "success" | "error";
    verdict?: string;
    confidence?: number;
    processing_time_ms?: number;
    error?: string;
}

const BatchScan = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [results, setResults] = useState<BatchResult[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(e.target.files || []).filter((f) =>
            f.type.startsWith("image/")
        );
        if (selected.length === 0) {
            toast({ title: "No valid images", description: "Please select image files.", variant: "destructive" });
            return;
        }
        if (selected.length > 20) {
            toast({ title: "Too many files", description: "Maximum 20 images per batch.", variant: "destructive" });
            return;
        }
        setFiles(selected);
        setResults([]);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const dropped = Array.from(e.dataTransfer.files).filter((f) =>
            f.type.startsWith("image/")
        );
        if (dropped.length > 20) {
            toast({ title: "Too many files", description: "Maximum 20 images per batch.", variant: "destructive" });
            return;
        }
        setFiles(dropped);
        setResults([]);
    };

    const handleProcess = async () => {
        if (files.length === 0) return;

        setIsProcessing(true);
        setProgress({ current: 0, total: files.length });

        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));

        try {
            const response = await fetch("/api/verify/batch", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Batch processing failed");
            }

            const data = await response.json();
            setResults(data.results);
            setProgress({ current: data.total, total: data.total });

            toast({
                title: "Batch Complete",
                description: `${data.total} images processed.`,
            });
        } catch (error) {
            toast({
                title: "Processing Failed",
                description: error instanceof Error ? error.message : "An error occurred.",
                variant: "destructive",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const exportCSV = () => {
        const header = "Filename,Status,Verdict,Confidence,Processing Time (ms)\n";
        const rows = results
            .map((r) =>
                [r.filename, r.status, r.verdict || "N/A", r.confidence?.toFixed(4) || "N/A", r.processing_time_ms || "N/A"].join(",")
            )
            .join("\n");
        const blob = new Blob([header + rows], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `deepguard-batch-${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const verdictIcon = (verdict?: string) => {
        if (verdict === "VERIFIED_AI") return <AlertTriangle className="h-4 w-4 text-chart-1" />;
        if (verdict === "VERIFIED_REAL") return <CheckCircle2 className="h-4 w-4 text-chart-2" />;
        return <HelpCircle className="h-4 w-4 text-chart-4" />;
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <section className="border-b-4 border-foreground bg-muted">
                <div className="container py-12 md:py-16">
                    <Link
                        to="/"
                        className="mb-8 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Home
                    </Link>

                    <div className="mb-4 inline-flex w-fit items-center gap-2 border-2 border-foreground bg-background px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-xs">
                        <Shield className="h-3 w-3" />
                        Batch Scanner
                    </div>
                    <h1 className="text-4xl font-bold uppercase leading-tight tracking-tight md:text-5xl mb-2">
                        Batch <span className="text-muted-foreground">Processing</span>
                    </h1>
                    <p className="max-w-xl text-lg text-muted-foreground mb-8">
                        Upload up to 20 images at once. Each image will be analyzed and results displayed in a table.
                    </p>

                    {/* Upload Zone */}
                    <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        className="border-4 border-dashed border-foreground bg-card p-8 text-center shadow-md mb-8 cursor-pointer hover:bg-accent/30 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
                        <p className="text-lg font-bold uppercase">Drop images here or click to browse</p>
                        <p className="text-sm text-muted-foreground mt-2">PNG, JPG, WEBP — up to 20 images, 20MB each</p>
                    </div>

                    {/* Selected Files */}
                    {files.length > 0 && results.length === 0 && (
                        <div className="border-4 border-foreground bg-card p-6 shadow-md mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold uppercase">{files.length} Images Selected</h3>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => { setFiles([]); setResults([]); }}>
                                        <Trash2 className="mr-2 h-3.5 w-3.5" /> Clear
                                    </Button>
                                    <Button size="sm" onClick={handleProcess} disabled={isProcessing}>
                                        {isProcessing ? (
                                            <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Processing...</>
                                        ) : (
                                            <><Shield className="mr-2 h-3.5 w-3.5" /> Scan All</>
                                        )}
                                    </Button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                                {files.map((file, i) => (
                                    <div key={i} className="border-2 border-foreground p-2 text-center text-xs">
                                        <FileImage className="mx-auto h-6 w-6 text-muted-foreground mb-1" />
                                        <p className="truncate font-bold">{file.name}</p>
                                        <p className="text-muted-foreground">{(file.size / 1024).toFixed(0)}KB</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Progress */}
                    {isProcessing && (
                        <div className="border-4 border-foreground bg-card p-6 shadow-md mb-8">
                            <div className="flex items-center gap-3 mb-3">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span className="font-bold uppercase">
                                    Processing {progress.current}/{progress.total}...
                                </span>
                            </div>
                            <div className="h-3 w-full border-2 border-foreground bg-muted overflow-hidden">
                                <div
                                    className="h-full bg-foreground transition-all duration-300"
                                    style={{ width: `${(progress.current / Math.max(progress.total, 1)) * 100}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Results Table */}
                    {results.length > 0 && (
                        <div className="border-4 border-foreground bg-card shadow-md">
                            <div className="flex items-center justify-between border-b-4 border-foreground p-4">
                                <h3 className="text-lg font-bold uppercase">Results ({results.length})</h3>
                                <Button variant="outline" size="sm" onClick={exportCSV}>
                                    <Download className="mr-2 h-3.5 w-3.5" /> Export CSV
                                </Button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b-2 border-foreground bg-muted text-left">
                                            <th className="px-4 py-3 font-bold uppercase tracking-wider">#</th>
                                            <th className="px-4 py-3 font-bold uppercase tracking-wider">Filename</th>
                                            <th className="px-4 py-3 font-bold uppercase tracking-wider">Verdict</th>
                                            <th className="px-4 py-3 font-bold uppercase tracking-wider">Confidence</th>
                                            <th className="px-4 py-3 font-bold uppercase tracking-wider">Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.map((r, i) => (
                                            <tr key={i} className="border-b border-border hover:bg-accent/50">
                                                <td className="px-4 py-3 font-mono">{i + 1}</td>
                                                <td className="px-4 py-3 font-bold truncate max-w-[200px]">{r.filename}</td>
                                                <td className="px-4 py-3">
                                                    {r.status === "error" ? (
                                                        <span className="text-destructive font-bold uppercase">Error</span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5">
                                                            {verdictIcon(r.verdict)}
                                                            <span className={cn("font-bold uppercase text-xs",
                                                                r.verdict === "VERIFIED_AI" ? "text-chart-1" :
                                                                    r.verdict === "VERIFIED_REAL" ? "text-chart-2" :
                                                                        "text-chart-4"
                                                            )}>
                                                                {r.verdict === "VERIFIED_AI" ? "Deepfake" :
                                                                    r.verdict === "VERIFIED_REAL" ? "Real" : "Unsure"}
                                                            </span>
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 font-mono">
                                                    {r.confidence ? `${(r.confidence * 100).toFixed(1)}%` : "—"}
                                                </td>
                                                <td className="px-4 py-3 font-mono text-muted-foreground">
                                                    {r.processing_time_ms ? `${r.processing_time_ms}ms` : "—"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Summary */}
                            <div className="border-t-2 border-foreground bg-muted p-4 grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <div className="text-2xl font-bold text-chart-1 font-mono">
                                        {results.filter((r) => r.verdict === "VERIFIED_AI").length}
                                    </div>
                                    <div className="text-xs font-bold uppercase text-muted-foreground">Deepfakes</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-chart-2 font-mono">
                                        {results.filter((r) => r.verdict === "VERIFIED_REAL").length}
                                    </div>
                                    <div className="text-xs font-bold uppercase text-muted-foreground">Real</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-chart-4 font-mono">
                                        {results.filter((r) => r.status === "error" || r.verdict === "UNVERIFIED").length}
                                    </div>
                                    <div className="text-xs font-bold uppercase text-muted-foreground">Errors/Unsure</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <footer className="border-t-4 border-foreground bg-card">
                <div className="container py-8">
                    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            <span className="font-bold uppercase tracking-wider">DeepGuard AI</span>
                        </div>
                        <p className="text-sm text-muted-foreground">© 2026 DeepGuard AI</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default BatchScan;
