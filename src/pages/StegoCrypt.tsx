import { useState, useRef } from "react";
import { Header } from "@/components/Header";
import { FadeIn } from "@/components/Animations";
import { encrypt, decrypt } from "@/lib/encryption";
import {
    loadImageToCanvas,
    encodeTextInImage,
    decodeTextFromImage,
    imageDataToDataURL,
} from "@/lib/steganography";
import {
    Shield,
    Lock,
    Unlock,
    Upload,
    Download,
    Image as ImageIcon,
    Eye,
    EyeOff,
    AlertTriangle,
    CheckCircle2,
    Loader2,
    Info,
    ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const StegoCrypt = () => {
    const [tab, setTab] = useState<"encode" | "decode">("encode");

    return (
        <div className="min-h-screen bg-background">
            <Header />

            {/* Hero */}
            <section className="border-b-4 border-foreground bg-muted">
                <div className="container py-12 md:py-16">
                    <FadeIn>
                        <div className="mb-2 inline-flex items-center gap-2 border-2 border-foreground bg-background px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-xs">
                            <Lock className="h-3 w-3" />
                            AES-256 + LSB Steganography
                        </div>
                        <h1 className="text-4xl font-bold uppercase leading-tight tracking-tight md:text-5xl">
                            Image <span className="text-muted-foreground">Encryption</span>
                        </h1>
                        <p className="mt-4 max-w-xl text-muted-foreground">
                            Hide encrypted messages inside images — invisible to the naked eye.
                            All processing happens locally in your browser. No data leaves your device.
                        </p>
                    </FadeIn>

                    {/* Tab Switcher */}
                    <div className="mt-8 flex border-4 border-foreground shadow-sm">
                        <button
                            onClick={() => setTab("encode")}
                            className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-bold uppercase tracking-wide transition-all ${tab === "encode"
                                    ? "bg-foreground text-background"
                                    : "bg-card text-muted-foreground hover:bg-accent"
                                }`}
                        >
                            <EyeOff className="h-4 w-4" />
                            Hide Message
                        </button>
                        <button
                            onClick={() => setTab("decode")}
                            className={`flex flex-1 items-center justify-center gap-2 border-l-4 border-foreground py-3 text-sm font-bold uppercase tracking-wide transition-all ${tab === "decode"
                                    ? "bg-foreground text-background"
                                    : "bg-card text-muted-foreground hover:bg-accent"
                                }`}
                        >
                            <Eye className="h-4 w-4" />
                            Reveal Message
                        </button>
                    </div>

                    {/* Content */}
                    <div className="mt-6 border-4 border-foreground bg-card p-6 shadow-md md:p-8">
                        {tab === "encode" ? <EncodePanel /> : <DecodePanel />}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="border-b-4 border-foreground">
                <div className="container py-12 md:py-16">
                    <h2 className="mb-8 text-2xl font-bold uppercase tracking-tight md:text-3xl">
                        How It Works
                    </h2>
                    <div className="grid gap-6 md:grid-cols-3">
                        {[
                            {
                                step: "01",
                                icon: Upload,
                                title: "Upload Image",
                                description:
                                    "Select a PNG image as the carrier. Larger images can hold longer messages.",
                            },
                            {
                                step: "02",
                                icon: Lock,
                                title: "Encrypt & Embed",
                                description:
                                    "Your message is encrypted with AES-256-GCM, then hidden in the image's pixel data using LSB steganography.",
                            },
                            {
                                step: "03",
                                icon: Download,
                                title: "Download & Share",
                                description:
                                    "The output image looks identical to the original. Only someone with the password can reveal the hidden message.",
                            },
                        ].map(({ step, icon: Icon, title, description }) => (
                            <div
                                key={step}
                                className="border-4 border-foreground bg-card p-6 shadow-md"
                            >
                                <div className="mb-3 flex items-center gap-3">
                                    <div className="border-2 border-foreground bg-accent p-2 shadow-xs">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <span className="font-mono text-2xl font-bold text-muted-foreground">
                                        {step}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold uppercase tracking-wide">{title}</h3>
                                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                                    {description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Security Info */}
            <section className="border-b-4 border-foreground bg-muted">
                <div className="container py-12">
                    <h2 className="mb-6 text-2xl font-bold uppercase tracking-tight">
                        Security Details
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {[
                            { label: "Encryption", value: "AES-256-GCM" },
                            { label: "Key Derivation", value: "PBKDF2 · 100K iter" },
                            { label: "Data Hiding", value: "LSB Steganography" },
                            { label: "Processing", value: "100% Client-Side" },
                        ].map(({ label, value }) => (
                            <div
                                key={label}
                                className="border-4 border-foreground bg-card p-4 shadow-sm"
                            >
                                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    {label}
                                </div>
                                <div className="mt-1 font-mono text-lg font-bold">{value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
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

/* ─── Encode Panel ─── */

const EncodePanel = () => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [text, setText] = useState("");
    const [password, setPassword] = useState("");
    const [resultURL, setResultURL] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setFile(f);
        setPreview(URL.createObjectURL(f));
        setResultURL(null);
        setError(null);
    };

    const handleEncode = async () => {
        if (!file || !text || !password) {
            setError("Please provide an image, message, and password.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const encrypted = await encrypt(text, password);
            const { imageData } = await loadImageToCanvas(file);
            const encoded = encodeTextInImage(imageData, encrypted);
            const url = imageDataToDataURL(encoded);
            setResultURL(url);
        } catch (err: any) {
            setError(err.message || "Encoding failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Upload Zone */}
            <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Carrier Image
                </label>
                <div
                    onClick={() => inputRef.current?.click()}
                    className="relative cursor-pointer border-4 border-dashed border-foreground/30 bg-muted/50 p-8 text-center transition-all hover:border-foreground hover:shadow-sm"
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/png,image/bmp,image/tiff"
                        className="hidden"
                        onChange={handleFile}
                    />
                    {preview ? (
                        <img
                            src={preview}
                            alt="Source"
                            className="mx-auto max-h-48 object-contain"
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                            <div className="border-2 border-foreground bg-accent p-3 shadow-xs">
                                <Upload className="h-6 w-6" />
                            </div>
                            <p className="text-sm font-bold uppercase">
                                Drop or click to upload a <span className="text-foreground">PNG</span> image
                            </p>
                            <p className="text-xs">Supports PNG, BMP, TIFF (lossless formats only)</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Secret Message */}
            <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Secret Message
                </label>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter your secret message..."
                    rows={3}
                    className="w-full border-4 border-foreground bg-background p-3 text-sm font-mono shadow-xs placeholder:text-muted-foreground focus:outline-none focus:shadow-md transition-shadow"
                />
            </div>

            {/* Password */}
            <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Encryption Password
                </label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter encryption key..."
                        className="w-full border-4 border-foreground bg-background py-2.5 pl-10 pr-3 text-sm font-mono shadow-xs placeholder:text-muted-foreground focus:outline-none focus:shadow-md transition-shadow"
                    />
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-2 border-2 border-destructive bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    {error}
                </div>
            )}

            {/* Encode Button */}
            <Button
                onClick={handleEncode}
                disabled={loading || !file || !text || !password}
                className="w-full gap-2 border-4 border-foreground py-3 text-sm font-bold uppercase tracking-wide shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-40"
            >
                {loading ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Encrypting & Encoding...
                    </>
                ) : (
                    <>
                        <ImageIcon className="h-4 w-4" />
                        Encode Message
                    </>
                )}
            </Button>

            {/* Result */}
            {resultURL && (
                <div className="space-y-4 border-4 border-chart-2 bg-chart-2/5 p-6 shadow-md">
                    <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-chart-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Message Hidden Successfully
                    </div>
                    <img
                        src={resultURL}
                        alt="Encoded"
                        className="mx-auto max-h-48 border-2 border-foreground object-contain shadow-xs"
                    />
                    <a
                        href={resultURL}
                        download="stego-output.png"
                        className="flex items-center justify-center gap-2 border-4 border-foreground bg-foreground px-4 py-2.5 text-sm font-bold uppercase text-background shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
                    >
                        <Download className="h-4 w-4" />
                        Download Image
                    </a>
                    <div className="flex items-start gap-2 text-xs text-muted-foreground">
                        <Info className="mt-0.5 h-3 w-3 shrink-0" />
                        The output image looks identical to the original. Share it safely — only the password holder can reveal the message.
                    </div>
                </div>
            )}
        </div>
    );
};

/* ─── Decode Panel ─── */

const DecodePanel = () => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [password, setPassword] = useState("");
    const [decoded, setDecoded] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setFile(f);
        setPreview(URL.createObjectURL(f));
        setDecoded(null);
        setError(null);
    };

    const handleDecode = async () => {
        if (!file || !password) {
            setError("Please provide an image and password.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const { imageData } = await loadImageToCanvas(file);
            const raw = decodeTextFromImage(imageData);
            const text = await decrypt(raw, password);
            setDecoded(text);
        } catch (err: any) {
            setError(
                err.message?.includes("decrypt")
                    ? "Wrong password or no hidden message found."
                    : err.message || "Decoding failed."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Upload Zone */}
            <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Encoded Image
                </label>
                <div
                    onClick={() => inputRef.current?.click()}
                    className="relative cursor-pointer border-4 border-dashed border-foreground/30 bg-muted/50 p-8 text-center transition-all hover:border-foreground hover:shadow-sm"
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/png,image/bmp,image/tiff"
                        className="hidden"
                        onChange={handleFile}
                    />
                    {preview ? (
                        <img
                            src={preview}
                            alt="Encoded source"
                            className="mx-auto max-h-48 object-contain"
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                            <div className="border-2 border-foreground bg-accent p-3 shadow-xs">
                                <Upload className="h-6 w-6" />
                            </div>
                            <p className="text-sm font-bold uppercase">
                                Upload the <span className="text-foreground">encoded</span> image
                            </p>
                            <p className="text-xs">Must be the original PNG output — JPEG will not work</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Password */}
            <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Decryption Password
                </label>
                <div className="relative">
                    <Unlock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter decryption key..."
                        className="w-full border-4 border-foreground bg-background py-2.5 pl-10 pr-3 text-sm font-mono shadow-xs placeholder:text-muted-foreground focus:outline-none focus:shadow-md transition-shadow"
                    />
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-2 border-2 border-destructive bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    {error}
                </div>
            )}

            {/* Decode Button */}
            <Button
                onClick={handleDecode}
                disabled={loading || !file || !password}
                className="w-full gap-2 border-4 border-foreground py-3 text-sm font-bold uppercase tracking-wide shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-40"
            >
                {loading ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Decrypting...
                    </>
                ) : (
                    <>
                        <Eye className="h-4 w-4" />
                        Decode Message
                    </>
                )}
            </Button>

            {/* Result */}
            {decoded !== null && (
                <div className="space-y-3 border-4 border-chart-2 bg-chart-2/5 p-6 shadow-md">
                    <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-chart-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Hidden Message Revealed
                    </div>
                    <div className="whitespace-pre-wrap border-4 border-foreground bg-muted p-4 font-mono text-sm shadow-xs">
                        {decoded}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StegoCrypt;
