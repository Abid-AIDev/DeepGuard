/**
 * Client-side EXIF + GPS extraction using exifr
 *
 * Replaces Python PIL EXIF extraction with browser-native exifr library.
 */

import exifr from "exifr";

const AI_INDICATORS = [
    "stable diffusion", "midjourney", "dall-e", "comfyui",
    "automatic1111", "novelai", "invoke ai", "adobe firefly",
];

export interface ImageMetadata {
    format: string;
    mode: string;
    width: number;
    height: number;
    bit_depth: number;
    has_alpha: boolean;
    color_profile: string | null;
    file_size_bytes: number;
    hash_sha256: string;
    camera: string;
    datetime: string;
    software: string;
    iso: string;
    exposure: string;
    focal_length: string;
    white_balance: string;
    metering_mode: string;
    flash: string;
    orientation: string;
    color_space: string;
    gps: { lat: number; lng: number; alt: number } | null;
    ai_software_detected: boolean;
    exif: Record<string, string>;
}

/**
 * Extract comprehensive metadata from an image file
 */
export async function extractMetadata(file: File): Promise<ImageMetadata> {
    // Get image dimensions by loading into an Image element
    const { width, height } = await getImageDimensions(file);

    // Parse EXIF using exifr
    let exifData: Record<string, any> = {};
    let gps: ImageMetadata["gps"] = null;

    try {
        const fullExif = await exifr.parse(file, {
            tiff: true,
            exif: true,
            gps: true,
            icc: true,
            iptc: true,
            xmp: true,
        });

        if (fullExif) {
            // Extract GPS
            if (fullExif.latitude && fullExif.longitude) {
                gps = {
                    lat: Math.round(fullExif.latitude * 1000000) / 1000000,
                    lng: Math.round(fullExif.longitude * 1000000) / 1000000,
                    alt: Math.round((fullExif.GPSAltitude || 0) * 10) / 10,
                };
            }

            // Build serializable EXIF dict
            for (const [key, value] of Object.entries(fullExif)) {
                if (value === null || value === undefined) continue;
                if (typeof value === "object" && !(value instanceof Date)) continue;
                if (key === "latitude" || key === "longitude") continue;

                const strValue = value instanceof Date
                    ? value.toISOString()
                    : String(value);

                if (strValue.length <= 500) {
                    exifData[key] = strValue;
                }
            }
        }
    } catch {
        // EXIF parsing failed — file might not have EXIF
    }

    // Compute SHA-256
    const hash = await computeSHA256(file);

    // Determine format from file type
    const format = file.type.split("/")[1]?.toUpperCase() || "Unknown";

    // Extract key fields
    const software = exifData.Software || "Unknown";
    const aiDetected = AI_INDICATORS.some(
        (ind) => software.toLowerCase().includes(ind)
    );

    return {
        format,
        mode: "RGB",
        width,
        height,
        bit_depth: 8,
        has_alpha: file.type === "image/png",
        color_profile: exifData.ProfileDescription || exifData.ColorSpace || null,
        file_size_bytes: file.size,
        hash_sha256: hash,
        camera: buildCameraName(exifData),
        datetime: exifData.DateTimeOriginal || exifData.DateTime || exifData.CreateDate || "Unknown",
        software,
        iso: exifData.ISO || exifData.ISOSpeedRatings || "Unknown",
        exposure: exifData.ExposureTime ? `1/${Math.round(1 / Number(exifData.ExposureTime))}` : "Unknown",
        focal_length: exifData.FocalLength ? `${exifData.FocalLength}mm` : "Unknown",
        white_balance: decodeWhiteBalance(exifData.WhiteBalance),
        metering_mode: decodeMeteringMode(exifData.MeteringMode),
        flash: decodeFlash(exifData.Flash),
        orientation: String(exifData.Orientation || "Unknown"),
        color_space: decodeColorSpace(exifData.ColorSpace),
        gps,
        ai_software_detected: aiDetected,
        exif: exifData,
    };
}

// ─── Helpers ───

function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            resolve({ width: img.naturalWidth, height: img.naturalHeight });
            URL.revokeObjectURL(img.src);
        };
        img.onerror = () => resolve({ width: 0, height: 0 });
        img.src = URL.createObjectURL(file);
    });
}

async function computeSHA256(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function buildCameraName(exif: Record<string, any>): string {
    const make = exif.Make || "";
    const model = exif.Model || "";
    const name = `${make} ${model}`.trim();
    return name || "Unknown";
}

function decodeWhiteBalance(val: any): string {
    if (val === 0 || val === "0") return "Auto";
    if (val === 1 || val === "1") return "Manual";
    return String(val || "Unknown");
}

function decodeMeteringMode(val: any): string {
    const modes: Record<string, string> = {
        "0": "Unknown", "1": "Average", "2": "Center-weighted",
        "3": "Spot", "4": "Multi-spot", "5": "Pattern", "6": "Partial",
    };
    return modes[String(val)] || String(val || "Unknown");
}

function decodeFlash(val: any): string {
    if (val === undefined || val === null) return "Unknown";
    const v = Number(val);
    if (isNaN(v)) return String(val);
    return v & 1 ? "Fired" : "Did not fire";
}

function decodeColorSpace(val: any): string {
    const spaces: Record<string, string> = {
        "1": "sRGB", "65535": "Uncalibrated", "2": "Adobe RGB",
    };
    return spaces[String(val)] || String(val || "Unknown");
}
