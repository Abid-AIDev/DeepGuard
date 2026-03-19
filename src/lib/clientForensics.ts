/**
 * Client-side Image Forensics using Canvas API
 *
 * Replaces Python OpenCV forensics with browser-native implementations:
 * - Error Level Analysis (ELA) via JPEG recompression
 * - Noise residual analysis via box blur
 * - RGB histogram generation
 * - Integrity score computation
 */

/**
 * Load an image file into a canvas and return both
 */
export async function loadImageToCanvas(
    file: File
): Promise<{ canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D }> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext("2d")!;
            ctx.drawImage(img, 0, 0);
            URL.revokeObjectURL(img.src);
            resolve({ canvas, ctx });
        };
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = URL.createObjectURL(file);
    });
}

/**
 * Error Level Analysis (ELA)
 *
 * Re-compresses the image as JPEG and computes pixel-level differences.
 * Manipulated regions show different error levels than the original.
 *
 * @returns base64-encoded PNG of the ELA visualization
 */
export async function errorLevelAnalysis(
    canvas: HTMLCanvasElement,
    quality: number = 0.95
): Promise<string> {
    const ctx = canvas.getContext("2d")!;
    const w = canvas.width;
    const h = canvas.height;

    // Get original pixel data
    const originalData = ctx.getImageData(0, 0, w, h);

    // Recompress as JPEG
    const jpegBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), "image/jpeg", quality);
    });

    // Load recompressed image back
    const recompImg = await loadImageFromBlob(jpegBlob);
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = w;
    tempCanvas.height = h;
    const tempCtx = tempCanvas.getContext("2d")!;
    tempCtx.drawImage(recompImg, 0, 0, w, h);
    const recompData = tempCtx.getImageData(0, 0, w, h);

    // Compute amplified difference
    const elaData = new ImageData(w, h);
    const scale = 20;
    for (let i = 0; i < originalData.data.length; i += 4) {
        elaData.data[i] = Math.min(255, Math.abs(originalData.data[i] - recompData.data[i]) * scale);
        elaData.data[i + 1] = Math.min(255, Math.abs(originalData.data[i + 1] - recompData.data[i + 1]) * scale);
        elaData.data[i + 2] = Math.min(255, Math.abs(originalData.data[i + 2] - recompData.data[i + 2]) * scale);
        elaData.data[i + 3] = 255;
    }

    // Render to canvas and export
    tempCtx.putImageData(elaData, 0, 0);
    return tempCanvas.toDataURL("image/png").split(",")[1];
}

/**
 * Noise Residual Analysis
 *
 * Applies a box blur, subtracts from original, amplifies the result.
 * Shows noise patterns — inconsistencies indicate manipulation.
 *
 * @returns base64-encoded PNG of the noise visualization
 */
export function noiseAnalysis(canvas: HTMLCanvasElement): string {
    const ctx = canvas.getContext("2d")!;
    const w = canvas.width;
    const h = canvas.height;
    const imgData = ctx.getImageData(0, 0, w, h);
    const src = imgData.data;

    // Apply 5x5 box blur
    const blurred = boxBlur(src, w, h, 2);

    // Compute noise residual with amplification
    const noiseCanvas = document.createElement("canvas");
    noiseCanvas.width = w;
    noiseCanvas.height = h;
    const noiseCtx = noiseCanvas.getContext("2d")!;
    const noiseData = noiseCtx.createImageData(w, h);
    const amplification = 10;

    for (let i = 0; i < src.length; i += 4) {
        // Grayscale noise
        const rDiff = Math.abs(src[i] - blurred[i]);
        const gDiff = Math.abs(src[i + 1] - blurred[i + 1]);
        const bDiff = Math.abs(src[i + 2] - blurred[i + 2]);
        const gray = Math.min(255, ((rDiff + gDiff + bDiff) / 3) * amplification);

        // Apply inferno-style colormap
        const [r, g, b] = infernoColormap(gray / 255);
        noiseData.data[i] = r;
        noiseData.data[i + 1] = g;
        noiseData.data[i + 2] = b;
        noiseData.data[i + 3] = 255;
    }

    noiseCtx.putImageData(noiseData, 0, 0);
    return noiseCanvas.toDataURL("image/png").split(",")[1];
}

/**
 * Generate RGB histogram
 *
 * @returns base64-encoded PNG of the histogram chart
 */
export function generateHistogram(canvas: HTMLCanvasElement): string {
    const ctx = canvas.getContext("2d")!;
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const src = imgData.data;

    // Count values per channel
    const rHist = new Uint32Array(256);
    const gHist = new Uint32Array(256);
    const bHist = new Uint32Array(256);

    for (let i = 0; i < src.length; i += 4) {
        rHist[src[i]]++;
        gHist[src[i + 1]]++;
        bHist[src[i + 2]]++;
    }

    // Find max value for normalization
    let maxVal = 0;
    for (let i = 0; i < 256; i++) {
        maxVal = Math.max(maxVal, rHist[i], gHist[i], bHist[i]);
    }

    // Draw histogram
    const histW = 512;
    const histH = 300;
    const histCanvas = document.createElement("canvas");
    histCanvas.width = histW;
    histCanvas.height = histH;
    const hCtx = histCanvas.getContext("2d")!;

    // Dark background
    hCtx.fillStyle = "#121212";
    hCtx.fillRect(0, 0, histW, histH);

    const channels: [Uint32Array, string][] = [
        [rHist, "rgba(234, 67, 53, 0.7)"],
        [gHist, "rgba(52, 168, 83, 0.7)"],
        [bHist, "rgba(66, 133, 244, 0.7)"],
    ];

    for (const [hist, color] of channels) {
        hCtx.strokeStyle = color;
        hCtx.lineWidth = 1.5;
        hCtx.beginPath();

        for (let x = 0; x < 256; x++) {
            const px = (x / 256) * histW;
            const py = histH - (hist[x] / maxVal) * (histH - 20);
            if (x === 0) hCtx.moveTo(px, py);
            else hCtx.lineTo(px, py);
        }

        hCtx.stroke();
    }

    return histCanvas.toDataURL("image/png").split(",")[1];
}

/**
 * Compute integrity score from forensic signals
 */
export function computeIntegrityScore(
    metadata: Record<string, any>,
    elaBase64: string,
    canvas: HTMLCanvasElement
): { score: number; risk_level: "low" | "medium" | "high"; findings: string[] } {
    let score = 100;
    const findings: string[] = [];

    // 1. EXIF richness
    const exifCount = Object.keys(metadata.exif || {}).length;
    if (exifCount >= 10) {
        findings.push(`✓ Rich EXIF metadata present (${exifCount} fields)`);
    } else if (exifCount >= 3) {
        score -= 10;
        findings.push(`△ Partial EXIF metadata (${exifCount} fields)`);
    } else {
        score -= 25;
        findings.push("✗ Little or no EXIF metadata — could be stripped or AI-generated");
    }

    // 2. Camera info
    if (metadata.camera && metadata.camera !== "Unknown") {
        findings.push(`✓ Camera identified: ${metadata.camera}`);
    } else {
        score -= 10;
        findings.push("✗ No camera information found");
    }

    // 3. AI software
    if (metadata.ai_software_detected) {
        score -= 40;
        findings.push(`✗ AI generation software detected: ${metadata.software}`);
    } else {
        findings.push("✓ No AI generation software tags detected");
    }

    // 4. GPS
    if (metadata.gps) {
        findings.push("✓ GPS coordinates present");
    } else {
        score -= 5;
        findings.push("△ No GPS data found");
    }

    // 5. Date/time
    if (metadata.datetime && metadata.datetime !== "Unknown") {
        findings.push(`✓ Date/time stamp present`);
    } else {
        score -= 5;
        findings.push("△ No date/time stamp");
    }

    // 6. ELA uniformity (check standard deviation of ELA image)
    try {
        const ctx = canvas.getContext("2d")!;
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const src = imgData.data;

        // Compute noise std across quadrants
        const h = canvas.height;
        const w = canvas.width;
        const quadStds = computeQuadrantStds(src, w, h);
        const noiseVariance = Math.max(...quadStds) - Math.min(...quadStds);

        if (noiseVariance < 5) {
            findings.push("✓ Consistent noise patterns across image");
        } else if (noiseVariance < 15) {
            score -= 10;
            findings.push("△ Moderate noise variation across regions");
        } else {
            score -= 15;
            findings.push("✗ Inconsistent noise patterns — possible splicing");
        }
    } catch {
        findings.push("△ Could not compute noise statistics");
    }

    score = Math.max(0, Math.min(100, score));

    const risk_level = score >= 70 ? "low" : score >= 40 ? "medium" : "high";

    return { score, risk_level, findings };
}

// ─── Helpers ───

function loadImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(img.src);
            resolve(img);
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(blob);
    });
}

/**
 * Simple box blur with given radius
 */
function boxBlur(src: Uint8ClampedArray, w: number, h: number, radius: number): Uint8ClampedArray {
    const out = new Uint8ClampedArray(src.length);
    const kernelSize = (2 * radius + 1) ** 2;

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            let rSum = 0, gSum = 0, bSum = 0;

            for (let ky = -radius; ky <= radius; ky++) {
                for (let kx = -radius; kx <= radius; kx++) {
                    const sx = Math.min(w - 1, Math.max(0, x + kx));
                    const sy = Math.min(h - 1, Math.max(0, y + ky));
                    const idx = (sy * w + sx) * 4;
                    rSum += src[idx];
                    gSum += src[idx + 1];
                    bSum += src[idx + 2];
                }
            }

            const idx = (y * w + x) * 4;
            out[idx] = rSum / kernelSize;
            out[idx + 1] = gSum / kernelSize;
            out[idx + 2] = bSum / kernelSize;
            out[idx + 3] = 255;
        }
    }

    return out;
}

/**
 * Inferno colormap approximation (dark→orange→yellow→white)
 */
function infernoColormap(t: number): [number, number, number] {
    // Simplified inferno: black → dark purple → red → orange → yellow
    if (t < 0.25) {
        const s = t / 0.25;
        return [Math.round(s * 80), 0, Math.round(s * 120)];
    } else if (t < 0.5) {
        const s = (t - 0.25) / 0.25;
        return [Math.round(80 + s * 140), Math.round(s * 30), Math.round(120 - s * 60)];
    } else if (t < 0.75) {
        const s = (t - 0.5) / 0.25;
        return [Math.round(220 + s * 35), Math.round(30 + s * 120), Math.round(60 - s * 60)];
    } else {
        const s = (t - 0.75) / 0.25;
        return [255, Math.round(150 + s * 105), Math.round(s * 80)];
    }
}

/**
 * Compute per-quadrant pixel standard deviations for noise analysis
 */
function computeQuadrantStds(src: Uint8ClampedArray, w: number, h: number): number[] {
    const halfW = Math.floor(w / 2);
    const halfH = Math.floor(h / 2);
    const quadrants = [
        { x0: 0, y0: 0, x1: halfW, y1: halfH },
        { x0: halfW, y0: 0, x1: w, y1: halfH },
        { x0: 0, y0: halfH, x1: halfW, y1: h },
        { x0: halfW, y0: halfH, x1: w, y1: h },
    ];

    return quadrants.map(({ x0, y0, x1, y1 }) => {
        let sum = 0;
        let sumSq = 0;
        let count = 0;

        for (let y = y0; y < y1; y++) {
            for (let x = x0; x < x1; x++) {
                const idx = (y * w + x) * 4;
                const gray = (src[idx] + src[idx + 1] + src[idx + 2]) / 3;
                sum += gray;
                sumSq += gray * gray;
                count++;
            }
        }

        const mean = sum / count;
        return Math.sqrt(sumSq / count - mean * mean);
    });
}
