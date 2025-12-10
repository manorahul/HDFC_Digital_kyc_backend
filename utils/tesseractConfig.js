// utils/tesseractConfig.js
import Tesseract from "tesseract.js";

export const recognizeImage = async (imageBuffer, mimeType) => {
  const blob = new Blob([imageBuffer], { type: mimeType });

  const worker = await Tesseract.createWorker({
    workerPath: "/tesseract/worker.min.js",
    langPath: "/tesseract/",
    corePath: "/tesseract/tesseract-core-simd.js",
  });

  await worker.loadLanguage("eng");
  await worker.initialize("eng");

  const { data } = await worker.recognize(blob);

  await worker.terminate();

  return data.text;
};
