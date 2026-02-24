// LSB Steganography - hide/extract text in image pixels

const DELIMITER = "<<END>>";

export function encodeTextInImage(
  imageData: ImageData,
  text: string
): ImageData {
  const message = text + DELIMITER;
  const binaryMessage = Array.from(new TextEncoder().encode(message))
    .map((byte) => byte.toString(2).padStart(8, "0"))
    .join("");

  const maxBits = imageData.data.length * 0.75; // only RGB channels, skip alpha
  if (binaryMessage.length > maxBits) {
    throw new Error(
      `Message too large. Max ~${Math.floor(maxBits / 8)} characters for this image.`
    );
  }

  const data = new Uint8ClampedArray(imageData.data);
  let bitIndex = 0;

  for (let i = 0; i < data.length; i++) {
    // Skip alpha channel (every 4th byte)
    if ((i + 1) % 4 === 0) continue;
    if (bitIndex >= binaryMessage.length) break;

    // Clear LSB and set to message bit
    data[i] = (data[i] & 0xfe) | parseInt(binaryMessage[bitIndex], 10);
    bitIndex++;
  }

  return new ImageData(data, imageData.width, imageData.height);
}

export function decodeTextFromImage(imageData: ImageData): string {
  const data = imageData.data;
  let binaryString = "";

  for (let i = 0; i < data.length; i++) {
    if ((i + 1) % 4 === 0) continue;
    binaryString += (data[i] & 1).toString();
  }

  // Convert binary to text
  let text = "";
  for (let i = 0; i < binaryString.length; i += 8) {
    const byte = binaryString.slice(i, i + 8);
    if (byte.length < 8) break;
    const charCode = parseInt(byte, 2);
    if (charCode === 0) break;
    text += String.fromCharCode(charCode);

    // Check for delimiter
    if (text.endsWith(DELIMITER)) {
      return text.slice(0, -DELIMITER.length);
    }
  }

  throw new Error("No hidden message found in this image.");
}

export function loadImageToCanvas(
  file: File
): Promise<{ canvas: HTMLCanvasElement; imageData: ImageData }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve({ canvas, imageData });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

export function imageDataToDataURL(imageData: ImageData): string {
  const canvas = document.createElement("canvas");
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext("2d")!;
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL("image/png");
}
