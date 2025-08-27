
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config({debug: true});


const varl = cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
  api_key: process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string,
  
});
console.log(varl)

export const uploadProductImages = async (
  files: Express.Multer.File[]
): Promise<string[]> => {
  const uploadPromises = files.map(file => 
    new Promise<string>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { 
          folder: "products",
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Upload failed'));
          resolve(result.secure_url);
        }
      ).end(file.buffer);
    })
  );
  
  return await Promise.all(uploadPromises);
};

export default cloudinary;