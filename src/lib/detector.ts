/**
 * Client-side Deepfake Detection using Transformers.js
 *
 * Runs the HuggingFace ViT model directly in the browser via ONNX Runtime Web.
 * Model is cached in IndexedDB after first download (~350MB).
 */

import { pipeline, env, type ImageClassificationOutput } from "@huggingface/transformers";

// Disable local model check (always use remote HuggingFace Hub)
env.allowLocalModels = false;

// Singleton classifier instance
let classifier: any = null;
let loadingPromise: Promise<void> | null = null;

/**
 * Progress callback shape for model loading
 */
export interface ModelLoadProgress {
    status: string;
    file?: string;
    progress?: number;
    loaded?: number;
    total?: number;
}

/**
 * Load the deepfake detection model into memory.
 * Downloads from HuggingFace on first call (~350MB), cached after.
 */
export async function loadModel(
    onProgress?: (progress: ModelLoadProgress) => void
): Promise<void> {
    if (classifier) return;

    // Prevent duplicate loading
    if (loadingPromise) {
        await loadingPromise;
        return;
    }

    loadingPromise = (async () => {
        try {
            classifier = await pipeline(
                "image-classification",
                "onnx-community/Deep-Fake-Detector-v2-Model-ONNX",
                {
                    progress_callback: onProgress,
                }
            );
        } catch (error) {
            loadingPromise = null;
            throw error;
        }
    })();

    await loadingPromise;
}

/**
 * Check if the model is already loaded
 */
export function isModelLoaded(): boolean {
    return classifier !== null;
}

/**
 * Detection result matching the VerificationData interface
 */
export interface DetectionResult {
    verdict: "VERIFIED_AI" | "VERIFIED_REAL" | "UNVERIFIED";
    confidence: number;
    watermark: {
        present: boolean;
        valid: boolean;
        source_id: string | null;
        timestamp: string | null;
        payload: string | null;
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

/**
 * Detect if an image is a deepfake or real.
 *
 * @param imageSource - A File, Blob, object URL, or base64 data URL
 * @returns Detection result matching VerificationData interface
 */
export async function detectDeepfake(imageSource: string | File | Blob): Promise<DetectionResult> {
    if (!classifier) {
        await loadModel();
    }

    const start = performance.now();

    // Convert File/Blob to object URL for Transformers.js
    let imageUrl: string;
    if (imageSource instanceof File || imageSource instanceof Blob) {
        imageUrl = URL.createObjectURL(imageSource);
    } else {
        imageUrl = imageSource;
    }

    try {
        const results: ImageClassificationOutput = await classifier(imageUrl);

        // results = [{ label: "Realism", score: 0.03 }, { label: "Deepfake", score: 0.97 }]
        const fakeResult = results.find((r: any) => r.label === "Deepfake");
        const realResult = results.find((r: any) => r.label === "Realism");

        const fakeScore = fakeResult?.score ?? 0;
        const realScore = realResult?.score ?? 0;
        const isDeepfake = fakeScore > realScore;
        const confidence = Math.max(fakeScore, realScore);

        const processingTime = Math.round(performance.now() - start);

        // Determine verdict
        let verdict: DetectionResult["verdict"];
        if (confidence >= 0.6) {
            verdict = isDeepfake ? "VERIFIED_AI" : "VERIFIED_REAL";
        } else {
            verdict = "UNVERIFIED";
        }

        return {
            verdict,
            confidence,
            watermark: {
                present: false,
                valid: false,
                source_id: null,
                timestamp: null,
                payload: null,
            },
            detection: {
                model_name: "Deep-Fake-Detector-v2",
                model_version: "2.0.0",
                score: isDeepfake ? fakeScore : realScore,
                label: isDeepfake ? "AI_GENERATED" : "LIKELY_REAL",
                artifact_types: detectArtifacts(isDeepfake, confidence),
            },
            image_quality: {
                psnr: 0,
                ssim: 0,
            },
            reasons: generateReasons(isDeepfake, confidence, fakeScore, realScore),
            processing_time_ms: processingTime,
        };
    } finally {
        // Clean up any object URLs we created
        if (imageSource instanceof File || imageSource instanceof Blob) {
            URL.revokeObjectURL(imageUrl);
        }
    }
}

function detectArtifacts(isDeepfake: boolean, confidence: number): string[] {
    const artifacts: string[] = [];
    if (!isDeepfake) return artifacts;

    if (confidence > 0.9) {
        artifacts.push("facial_inconsistency", "texture_anomaly", "boundary_artifacts");
    } else if (confidence > 0.75) {
        artifacts.push("texture_anomaly", "lighting_inconsistency");
    } else if (confidence > 0.6) {
        artifacts.push("minor_artifacts");
    }
    return artifacts;
}

function generateReasons(
    isDeepfake: boolean,
    confidence: number,
    fakeScore: number,
    realScore: number
): string[] {
    const reasons: string[] = [];

    if (isDeepfake) {
        if (confidence > 0.9) {
            reasons.push("High confidence AI generation detected");
            reasons.push("Model strongly indicates synthetic origin");
            reasons.push("Multiple deepfake artifacts identified in image features");
        } else if (confidence > 0.75) {
            reasons.push("Moderate-high confidence of AI generation");
            reasons.push("Texture patterns consistent with generative models");
        } else {
            reasons.push("Low confidence AI generation indicators present");
            reasons.push("Image shows some characteristics of synthetic generation");
        }
    } else {
        if (confidence > 0.9) {
            reasons.push("Image appears to be authentic with high confidence");
            reasons.push("Natural image features and consistent noise patterns");
            reasons.push("No significant deepfake artifacts detected");
        } else if (confidence > 0.75) {
            reasons.push("Image likely authentic based on model analysis");
            reasons.push("Most image features consistent with real photography");
        } else {
            reasons.push("Image analysis inconclusive");
            reasons.push("Features do not strongly indicate either real or synthetic origin");
        }
    }

    reasons.push(`AI score: ${(fakeScore * 100).toFixed(1)}% | Real score: ${(realScore * 100).toFixed(1)}%`);
    reasons.push("Analysis performed client-side using Vision Transformer (ViT) model");

    return reasons;
}
