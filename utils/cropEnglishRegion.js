import {Jimp} from "jimp";

export const cropEnglishRegion = async (imagePath) => {
  try {
    const img = await Jimp.read(imagePath);

    const width = img.bitmap.width;
    const height = img.bitmap.height;

    const cropStartY = Math.floor(height * 0.35);
    const cropHeight = height - cropStartY;

    const cropped = img.clone().crop(0, cropStartY, width, cropHeight);

    const englishImg = imagePath + "_eng.jpg";
    await cropped.writeAsync(englishImg);

    return englishImg; // MUST return string path
  } catch (error) {
    console.error("Crop error:", error);
    return imagePath; // fallback = use original image
  }
};
