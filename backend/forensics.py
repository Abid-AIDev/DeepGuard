"""
Image Forensics Toolkit
Provides EXIF metadata extraction, Error Level Analysis (ELA), and noise analysis.
"""

import numpy as np
import cv2
from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS
import base64
import io
import json


def extract_metadata(image: Image.Image) -> dict:
    """
    Extract EXIF metadata from an image.
    
    Returns a dict with camera, datetime, GPS info, software, etc.
    """
    metadata = {
        "format": image.format or "Unknown",
        "mode": image.mode,
        "width": image.size[0],
        "height": image.size[1],
    }
    
    # Try to extract EXIF data
    exif_data = {}
    try:
        raw_exif = image._getexif()
        if raw_exif:
            for tag_id, value in raw_exif.items():
                tag_name = TAGS.get(tag_id, str(tag_id))
                
                # Handle bytes and other non-serializable types
                if isinstance(value, bytes):
                    try:
                        value = value.decode("utf-8", errors="replace")
                    except Exception:
                        value = str(value)[:100]
                elif isinstance(value, tuple) and len(value) == 2:
                    # Could be a rational number
                    try:
                        value = f"{value[0]}/{value[1]}"
                    except Exception:
                        value = str(value)
                
                # Skip very large data
                if isinstance(value, str) and len(value) > 500:
                    value = value[:500] + "..."
                
                exif_data[tag_name] = str(value)
    except Exception:
        pass
    
    metadata["exif"] = exif_data
    
    # Extract key fields for easy display
    metadata["camera"] = exif_data.get("Make", "Unknown") + " " + exif_data.get("Model", "")
    metadata["camera"] = metadata["camera"].strip() or "Unknown"
    metadata["datetime"] = exif_data.get("DateTime", exif_data.get("DateTimeOriginal", "Unknown"))
    metadata["software"] = exif_data.get("Software", "Unknown")
    metadata["iso"] = exif_data.get("ISOSpeedRatings", "Unknown")
    metadata["exposure"] = exif_data.get("ExposureTime", "Unknown")
    metadata["focal_length"] = exif_data.get("FocalLength", "Unknown")
    
    # Check for AI generation indicators
    software = str(metadata["software"]).lower()
    ai_indicators = ["stable diffusion", "midjourney", "dall-e", "comfyui", "automatic1111", "novelai"]
    metadata["ai_software_detected"] = any(ind in software for ind in ai_indicators)
    
    return metadata


def error_level_analysis(image_bytes: bytes, quality: int = 95) -> str:
    """
    Error Level Analysis (ELA).
    
    Re-compresses the image at a specific JPEG quality level, then computes
    the pixel-level difference between the original and re-compressed versions.
    Manipulated regions often show different error levels.
    
    Returns base64-encoded PNG of the ELA visualization.
    """
    # Load original image
    original = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    
    # Re-compress as JPEG at specified quality
    buffer = io.BytesIO()
    original.save(buffer, format="JPEG", quality=quality)
    buffer.seek(0)
    recompressed = Image.open(buffer).convert("RGB")
    
    # Compute pixel-level difference
    orig_np = np.array(original, dtype=np.float32)
    recomp_np = np.array(recompressed, dtype=np.float32)
    
    # Absolute difference
    diff = np.abs(orig_np - recomp_np)
    
    # Scale to make differences visible (multiply by a scale factor)
    scale = 20.0
    ela = np.clip(diff * scale, 0, 255).astype(np.uint8)
    
    # Encode to base64
    ela_image = Image.fromarray(ela)
    out_buffer = io.BytesIO()
    ela_image.save(out_buffer, format="PNG")
    out_buffer.seek(0)
    
    return base64.b64encode(out_buffer.getvalue()).decode("utf-8")


def noise_analysis(image: Image.Image) -> str:
    """
    Noise residual analysis.
    
    Applies a median filter to the image, then subtracts the filtered version
    from the original to reveal the noise pattern. Inconsistent noise patterns
    can indicate manipulation.
    
    Returns base64-encoded PNG of the noise residual visualization.
    """
    if image.mode != "RGB":
        image = image.convert("RGB")
    
    img_np = np.array(image)
    
    # Apply median blur to get the smooth version
    smooth = cv2.medianBlur(img_np, 5)
    
    # Compute noise residual
    noise = cv2.absdiff(img_np, smooth)
    
    # Amplify noise for visibility
    noise_amplified = np.clip(noise.astype(np.float32) * 10, 0, 255).astype(np.uint8)
    
    # Convert to grayscale for clearer visualization
    noise_gray = cv2.cvtColor(noise_amplified, cv2.COLOR_RGB2GRAY)
    
    # Apply colormap for better visualization
    noise_colored = cv2.applyColorMap(noise_gray, cv2.COLORMAP_INFERNO)
    noise_colored = cv2.cvtColor(noise_colored, cv2.COLOR_BGR2RGB)
    
    # Encode to base64
    noise_image = Image.fromarray(noise_colored)
    out_buffer = io.BytesIO()
    noise_image.save(out_buffer, format="PNG")
    out_buffer.seek(0)
    
    return base64.b64encode(out_buffer.getvalue()).decode("utf-8")
