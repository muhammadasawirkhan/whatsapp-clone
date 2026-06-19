import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up Cloudinary storage engine for Multer
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'whatsapp-clone',
    resource_type: 'auto', // Correctly handles images, videos, audio, and docs
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'mp4', 'mp3', 'doc', 'docx', 'zip'],
  },
});

// Initialize Multer with the storage engine and a 10MB file size limit
const upload = multer({ 
  storage, 
  limits: { fileSize: 10 * 1024 * 1024 } 
});

export default upload;


// import multer from "multer";
// import path from "path";

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, "uploads/"),
//   filename: (req, file, cb) => {
//     const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, unique + path.extname(file.originalname));
//   },
// });

// const fileFilter = (req, file, cb) => {
//   const allowed = /jpeg|jpg|png|gif|pdf|mp4|mp3|doc|docx|zip/;

//   const ext = allowed.test(path.extname(file.originalname).toLowerCase());

//   if (ext) cb(null, true);
//   else cb(new Error("File type not supported"));
// };

// const upload = multer({
//   storage,
//   fileFilter,
//   limits: { fileSize: 10 * 1024 * 1024 },
// });

// export default upload;