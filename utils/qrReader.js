import {Jimp} from "jimp";
import QrCode from "qrcode-reader";

export const extractQRCode = async (imagePath) => {
  try {
    const img = await Jimp.read(imagePath);

    return await new Promise((resolve, reject) => {
      const qr = new QrCode();

      qr.callback = (err, value) => {
        if (err) return resolve(null);
        resolve(value?.result || null);
      };

      qr.decode(img.bitmap);
    });

  } catch (error) {
    console.log("QR Read Error:", error);
    return null;
  }
};
