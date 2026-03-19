"""
Image Forensics Toolkit
Provides comprehensive image analysis: EXIF metadata, GPS, file stats,
Error Level Analysis (ELA), noise analysis, color histogram, and integrity scoring.
"""

import numpy as np
import cv2
from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS
import base64
import io
import hashlib


def extract_metadata(image: Image.Image, image_bytes: bytes = None) -> dict:
    """
    Extract comprehensive metadata from an image.

    Returns a dict with file stats, camera info, GPS, color profile, etc.
    """
    metadata = {
        "format": image.format or "Unknown",
        "mode": image.mode,
        "width": image.size[0],
        "height": image.size[1],
        "bit_depth": _get_bit_depth(image),
        "has_alpha": image.mode in ("RGBA", "PA", "LA"),
        "color_profile": _get_color_profile(image),
    }

    # File-level stats
    if image_bytes:
        metadata["file_size_bytes"] = len(image_bytes)
        metadata["hash_sha256"] = hashlib.sha256(image_bytes).hexdigest()
    else:
        metadata["file_size_bytes"] = 0
        metadata["hash_sha256"] = "N/A"

    # Try to extract EXIF data
    exif_data = {}
    try:
        raw_exif = image._getexif()
        if raw_exif:
            for tag_id, value in raw_exif.items():
                tag_name = TAGS.get(tag_id, str(tag_id))

                # Skip GPS sub-dict (handled separately)
                if tag_name == "GPSInfo":
                    continue

                # Handle bytes and other non-serializable types
                if isinstance(value, bytes):
                    try:
                        value = value.decode("utf-8", errors="replace")
                    except Exception:
                        value = str(value)[:100]
                elif isinstance(value, tuple) and len(value) == 2:
                    try:
                        value = f"{value[0]}/{value[1]}"
                    except Exception:
                        value = str(value)
                elif not isinstance(value, (str, int, float)):
                    value = str(value)

                # Skip very large data
                if isinstance(value, str) and len(value) > 500:
                    value = value[:500] + "..."

                exif_data[tag_name] = str(value)
    except Exception:
        pass

    metadata["exif"] = exif_data

    # Key fields for easy display
    metadata["camera"] = (exif_data.get("Make", "Unknown") + " " + exif_data.get("Model", "")).strip() or "Unknown"
    metadata["datetime"] = exif_data.get("DateTime", exif_data.get("DateTimeOriginal", "Unknown"))
    metadata["software"] = exif_data.get("Software", "Unknown")
    metadata["iso"] = exif_data.get("ISOSpeedRatings", "Unknown")
    metadata["exposure"] = exif_data.get("ExposureTime", "Unknown")
    metadata["focal_length"] = exif_data.get("FocalLength", "Unknown")

    # Extended camera settings
    metadata["white_balance"] = exif_data.get("WhiteBalance", "Unknown")
    metadata["metering_mode"] = _decode_metering_mode(exif_data.get("MeteringMode", "Unknown"))
    metadata["flash"] = _decode_flash(exif_data.get("Flash", "Unknown"))
    metadata["orientation"] = exif_data.get("Orientation", "Unknown")
    metadata["color_space"] = _decode_color_space(exif_data.get("ColorSpace", "Unknown"))

    # GPS extraction
    metadata["gps"] = _extract_gps(image)

    # AI generation indicators
    software = str(metadata["software"]).lower()
    ai_indicators = ["stable diffusion", "midjourney", "dall-e", "comfyui",
                     "automatic1111", "novelai", "invoke ai", "adobe firefly"]
    metadata["ai_software_detected"] = any(ind in software for ind in ai_indicators)

    return metadata


def _get_bit_depth(image: Image.Image) -> int:
    """Get bits per channel."""
    mode_depths = {"1": 1, "L": 8, "P": 8, "RGB": 8, "RGBA": 8, "CMYK": 8,
                   "I": 32, "F": 32, "I;16": 16}
    return mode_depths.get(image.mode, 8)


def _get_color_profile(image: Image.Image) -> str:
    """Extract ICC profile name if present."""
    try:
        icc = image.info.get("icc_profile")
        if icc:
            # The profile description is typically around byte 52+
            desc_start = icc.find(b"desc")
            if desc_start > 0:
                length = int.from_bytes(icc[desc_start + 8:desc_start + 12], "big")
                name = icc[desc_start + 12:desc_start + 12 + length].decode("ascii", errors="replace").strip("\x00")
                if name:
                    return name
            return "ICC Profile Present"
    except Exception:
        pass
    return "None (sRGB assumed)"


def _extract_gps(image: Image.Image) -> dict:
    """Extract GPS coordinates from EXIF if available."""
    try:
        raw_exif = image._getexif()
        if not raw_exif:
            return None

        gps_info = {}
        for tag_id, value in raw_exif.items():
            tag_name = TAGS.get(tag_id, str(tag_id))
            if tag_name == "GPSInfo":
                for gps_tag_id, gps_value in value.items():
                    gps_tag_name = GPSTAGS.get(gps_tag_id, str(gps_tag_id))
                    gps_info[gps_tag_name] = gps_value

        if not gps_info:
            return None

        def _to_degrees(values):
            d, m, s = float(values[0]), float(values[1]), float(values[2])
            return d + (m / 60.0) + (s / 3600.0)

        lat = _to_degrees(gps_info.get("GPSLatitude", [0, 0, 0]))
        if gps_info.get("GPSLatitudeRef", "N") == "S":
            lat = -lat

        lng = _to_degrees(gps_info.get("GPSLongitude", [0, 0, 0]))
        if gps_info.get("GPSLongitudeRef", "E") == "W":
            lng = -lng

        alt = float(gps_info.get("GPSAltitude", 0))

        if lat == 0 and lng == 0:
            return None

        return {"lat": round(lat, 6), "lng": round(lng, 6), "alt": round(alt, 1)}
    except Exception:
        return None


def _decode_metering_mode(value: str) -> str:
    modes = {"0": "Unknown", "1": "Average", "2": "Center-weighted", "3": "Spot",
             "4": "Multi-spot", "5": "Pattern", "6": "Partial"}
    return modes.get(str(value), str(value))


def _decode_flash(value: str) -> str:
    try:
        v = int(value)
        fired = "Yes" if v & 1 else "No"
        return f"{'Fired' if v & 1 else 'Did not fire'}"
    except (ValueError, TypeError):
        return str(value)


def _decode_color_space(value: str) -> str:
    spaces = {"1": "sRGB", "65535": "Uncalibrated", "2": "Adobe RGB"}
    return spaces.get(str(value), str(value))


def error_level_analysis(image_bytes: bytes, quality: int = 95) -> str:
    """
    Error Level Analysis (ELA).
    Re-compresses at JPEG quality, computes pixel difference.
    Returns base64-encoded PNG.
    """
    original = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    buffer = io.BytesIO()
    original.save(buffer, format="JPEG", quality=quality)
    buffer.seek(0)
    recompressed = Image.open(buffer).convert("RGB")

    orig_np = np.array(original, dtype=np.float32)
    recomp_np = np.array(recompressed, dtype=np.float32)

    diff = np.abs(orig_np - recomp_np)
    scale = 20.0
    ela = np.clip(diff * scale, 0, 255).astype(np.uint8)

    ela_image = Image.fromarray(ela)
    out_buffer = io.BytesIO()
    ela_image.save(out_buffer, format="PNG")
    out_buffer.seek(0)

    return base64.b64encode(out_buffer.getvalue()).decode("utf-8")


def noise_analysis(image: Image.Image) -> str:
    """
    Noise residual analysis with INFERNO colormap.
    Returns base64-encoded PNG.
    """
    if image.mode != "RGB":
        image = image.convert("RGB")

    img_np = np.array(image)
    smooth = cv2.medianBlur(img_np, 5)
    noise = cv2.absdiff(img_np, smooth)
    noise_amplified = np.clip(noise.astype(np.float32) * 10, 0, 255).astype(np.uint8)
    noise_gray = cv2.cvtColor(noise_amplified, cv2.COLOR_RGB2GRAY)
    noise_colored = cv2.applyColorMap(noise_gray, cv2.COLORMAP_INFERNO)
    noise_colored = cv2.cvtColor(noise_colored, cv2.COLOR_BGR2RGB)

    noise_image = Image.fromarray(noise_colored)
    out_buffer = io.BytesIO()
    noise_image.save(out_buffer, format="PNG")
    out_buffer.seek(0)

    return base64.b64encode(out_buffer.getvalue()).decode("utf-8")


def generate_histogram(image: Image.Image) -> str:
    """
    Generate RGB channel histogram as a base64-encoded PNG image.
    Uses OpenCV drawing to avoid matplotlib dependency.
    """
    if image.mode != "RGB":
        image = image.convert("RGB")

    img_np = np.array(image)

    # Create histogram image (300h x 512w)
    hist_h, hist_w = 300, 512
    hist_img = np.zeros((hist_h, hist_w, 3), dtype=np.uint8)
    hist_img[:] = (18, 18, 18)  # dark background

    colors = [(66, 133, 244), (52, 168, 83), (234, 67, 53)]  # B, G, R for OpenCV
    channel_names = [2, 1, 0]  # RGB -> BGR order for OpenCV

    for i, (color, ch) in enumerate(zip(colors, channel_names)):
        hist = cv2.calcHist([img_np], [i], None, [256], [0, 256])
        cv2.normalize(hist, hist, 0, hist_h - 20, cv2.NORM_MINMAX)

        pts = []
        for x in range(256):
            px = int(x * hist_w / 256)
            py = hist_h - int(hist[x][0])
            pts.append((px, py))

        for j in range(1, len(pts)):
            cv2.line(hist_img, pts[j - 1], pts[j], color, 1, cv2.LINE_AA)

    # Encode
    hist_pil = Image.fromarray(cv2.cvtColor(hist_img, cv2.COLOR_BGR2RGB))
    out_buffer = io.BytesIO()
    hist_pil.save(out_buffer, format="PNG")
    out_buffer.seek(0)

    return base64.b64encode(out_buffer.getvalue()).decode("utf-8")


def compute_integrity_score(metadata: dict, image_bytes: bytes, image: Image.Image) -> dict:
    """
    Compute a composite integrity score (0-100) from multiple forensic signals.

    Returns { score, risk_level, findings }
    """
    score = 100
    findings = []

    # 1. EXIF richness (real photos have lots of EXIF)
    exif_count = len(metadata.get("exif", {}))
    if exif_count >= 10:
        findings.append("✓ Rich EXIF metadata present (" + str(exif_count) + " fields)")
    elif exif_count >= 3:
        score -= 10
        findings.append("△ Partial EXIF metadata (" + str(exif_count) + " fields)")
    else:
        score -= 25
        findings.append("✗ Little or no EXIF metadata — could be stripped or AI-generated")

    # 2. Camera info
    if metadata.get("camera", "Unknown") != "Unknown":
        findings.append("✓ Camera identified: " + metadata["camera"])
    else:
        score -= 10
        findings.append("✗ No camera information found")

    # 3. AI software detection
    if metadata.get("ai_software_detected"):
        score -= 40
        findings.append("✗ AI generation software detected in metadata: " + metadata.get("software", ""))
    else:
        findings.append("✓ No AI generation software tags detected")

    # 4. GPS presence
    if metadata.get("gps"):
        findings.append("✓ GPS coordinates present")
    else:
        score -= 5
        findings.append("△ No GPS data found")

    # 5. Date/time
    if metadata.get("datetime", "Unknown") != "Unknown":
        findings.append("✓ Date/time stamp present: " + metadata["datetime"])
    else:
        score -= 5
        findings.append("△ No date/time stamp")

    # 6. ELA uniformity check
    try:
        original = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        buffer = io.BytesIO()
        original.save(buffer, format="JPEG", quality=95)
        buffer.seek(0)
        recompressed = Image.open(buffer).convert("RGB")

        diff = np.abs(np.array(original, dtype=np.float32) - np.array(recompressed, dtype=np.float32))
        ela_std = float(np.std(diff))

        if ela_std < 5.0:
            findings.append("✓ ELA shows uniform error levels (consistent compression)")
        elif ela_std < 15.0:
            score -= 10
            findings.append("△ ELA shows moderate variation (may indicate editing)")
        else:
            score -= 20
            findings.append("✗ ELA shows high variation — possible manipulation detected")
    except Exception:
        findings.append("△ Could not compute ELA statistics")

    # 7. Noise consistency check
    try:
        if image.mode != "RGB":
            img_check = image.convert("RGB")
        else:
            img_check = image

        img_np = np.array(img_check)
        smooth = cv2.medianBlur(img_np, 5)
        noise = cv2.absdiff(img_np, smooth).astype(np.float32)

        # Check noise uniformity across quadrants
        h, w = noise.shape[:2]
        quadrants = [
            noise[:h // 2, :w // 2],
            noise[:h // 2, w // 2:],
            noise[h // 2:, :w // 2],
            noise[h // 2:, w // 2:],
        ]
        quad_stds = [float(np.std(q)) for q in quadrants]
        noise_variance = max(quad_stds) - min(quad_stds)

        if noise_variance < 2.0:
            findings.append("✓ Consistent noise patterns across image")
        elif noise_variance < 5.0:
            score -= 10
            findings.append("△ Moderate noise variation across regions")
        else:
            score -= 15
            findings.append("✗ Inconsistent noise patterns — possible splicing")
    except Exception:
        findings.append("△ Could not compute noise statistics")

    # Clamp score
    score = max(0, min(100, score))

    # Risk level
    if score >= 70:
        risk_level = "low"
    elif score >= 40:
        risk_level = "medium"
    else:
        risk_level = "high"

    return {
        "score": score,
        "risk_level": risk_level,
        "findings": findings,
    }
