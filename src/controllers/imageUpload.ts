import ImageKit from "imagekit";
import dotenv from "dotenv";
dotenv.config();
const imageKit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY as string,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT as string,
});

class UploadImage {
  public file: Buffer;
  public fileName: string;

  constructor(fileBuffer: Buffer, name: string) {
    this.file = fileBuffer;
    this.fileName = name;
  }

  async uploadImage() {
    try {
      const result = await imageKit.upload({
        file: this.file,
        fileName: this.fileName,
      });

      return result.url;
    } catch (error) {
      if (error instanceof Error) {
        console.log(error);
        return false;
      }
    }
  }
}

export default UploadImage;
