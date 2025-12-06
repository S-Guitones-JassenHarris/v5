// src/pdf/image-loader.js

/**
 * Load an image (e.g., PNG) from a URL and return a Base64 data URL string.
 *
 * @param {string} url - Path to the image, relative to the HTML or server root.
 * @returns {Promise<string>} data URL (e.g. "data:image/png;base64,...")
 */
export async function loadImageAsBase64(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load image: ${url} (${response.status})`);
  }

  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(blob);
  });
}
