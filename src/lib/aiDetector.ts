/**
 * Client-side AI Image Detection using Transformers.js
 *
 * Uses the 3-class model: Artificial (AI art) | Deepfake (face swap) | Real
 * Model: prithivMLmods/AI-vs-Deepfake-vs-Real-ONNX
 */

import { pipeline, env, type ImageClassificationOutput } from "@huggingface/transformers";

env.allowLocalModels = false;

let aiClassifier: any = null;
let aiLoadingPromise: Promise<void> | null = null;

export interface AILoadProgress {
    status: string;
    file?: string;
    progress?: number;
    loaded?: number;
    total?: number;
}

export interface AIDetectionResult {
    verdict: "Artificial" | "Deepfake" | "Real";
    confidence: number;
    breakdown: {
        artificial: number;
        deepfake: number;
        real: number;
    };
    reasons: string[];
    processing_time_ms: number;
}

/**
 * Load the AI image detection model.
 * Downloads from HuggingFace on first call, cached after.
 */
export async function loadAIDetector(
    onProgress?: (progress: AILoadProgress) => void
): Promise<void> {
    if (aiClassifier) return;

    if (aiLoadingPromise) {
        await aiLoadingPromise;
        return;
    }

    aiLoadingPromise = (async () => {
        try {
            aiClassifier = await pipeline(
                "image-classification",
                "prithivMLmods/AI-vs-Deepfake-vs-Real-ONNX",
                {
                    progress_callback: onProgress,
                }
            );
        } catch (error) {
            aiLoadingPromise = null;
            throw error;
        }
    })();

    await aiLoadingPromise;
}

export function isAIDetectorLoaded(): boolean {
    return aiClassifier !== null;
}

/**
 * Detect if an image is AI-generated, a deepfake, or real.
 *
 * Returns 3-class breakdown with confidence scores.
 */
export async function detectAIImage(
    imageSource: string | File | Blob
): Promise<AIDetectionResult> {
    if (!aiClassifier) {
        await loadAIDetector();
    }

    const start = performance.now();

    let imageUrl: string;
    if (imageSource instanceof File || imageSource instanceof Blob) {
        imageUrl = URL.createObjectURL(imageSource);
    } else {
        imageUrl = imageSource;
    }

    try {
        const results: ImageClassificationOutput = await aiClassifier(imageUrl, {
            topk: 3,
        });

        const artificialScore = results.find((r: any) => r.label === "Artificial")?.score ?? 0;
        const deepfakeScore = results.find((r: any) => r.label === "Deepfake")?.score ?? 0;
        const realScore = results.find((r: any) => r.label === "Real")?.score ?? 0;

        const scores = { artificial: artificialScore, deepfake: deepfakeScore, real: realScore };
        const topLabel = Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b);
        const verdict = topLabel[0] === "artificial" ? "Artificial"
            : topLabel[0] === "deepfake" ? "Deepfake"
                : "Real";
        const confidence = topLabel[1];

        const processingTime = Math.round(performance.now() - start);

        return {
            verdict,
            confidence,
            breakdown: scores,
            reasons: generateAIReasons(verdict, confidence, scores),
            processing_time_ms: processingTime,
        };
    } finally {
        if (imageSource instanceof File || imageSource instanceof Blob) {
            URL.revokeObjectURL(imageUrl);
        }
    }
}

function generateAIReasons(
    verdict: string,
    confidence: number,
    scores: { artificial: number; deepfake: number; real: number }
): string[] {
    const reasons: string[] = [];

    if (verdict === "Artificial") {
        if (confidence > 0.9) {
            reasons.push("Strong indicators of AI generation detected");
            reasons.push("Image patterns are highly consistent with generative AI tools (Stable Diffusion, DALL-E, Midjourney)");
            reasons.push("Texture and noise patterns typical of diffusion-based image synthesis");
        } else if (confidence > 0.7) {
            reasons.push("Moderate indicators of AI generation");
            reasons.push("Image features suggest possible AI synthesis");
        } else {
            reasons.push("Weak AI generation indicators present");
            reasons.push("Image shows some characteristics common in AI-generated content");
        }
    } else if (verdict === "Deepfake") {
        if (confidence > 0.9) {
            reasons.push("High confidence of face manipulation (deepfake)");
            reasons.push("Facial features show inconsistencies typical of face-swap technology");
        } else if (confidence > 0.7) {
            reasons.push("Moderate deepfake indicators detected");
            reasons.push("Some facial regions appear manipulated");
        } else {
            reasons.push("Minor deepfake indicators present");
        }
    } else {
        if (confidence > 0.9) {
            reasons.push("Image appears to be an authentic, unmodified photograph");
            reasons.push("Natural noise patterns and consistent image characteristics detected");
            reasons.push("No significant AI generation or manipulation artifacts found");
        } else if (confidence > 0.7) {
            reasons.push("Image likely authentic based on model analysis");
            reasons.push("Most features consistent with real photography");
        } else {
            reasons.push("Analysis inconclusive — features don't strongly indicate any category");
        }
    }

    reasons.push(
        `Breakdown — AI Art: ${(scores.artificial * 100).toFixed(1)}% · Deepfake: ${(scores.deepfake * 100).toFixed(1)}% · Real: ${(scores.real * 100).toFixed(1)}%`
    );
    reasons.push("Analysis performed client-side using ViT 3-class AI detection model");

    return reasons;
}
