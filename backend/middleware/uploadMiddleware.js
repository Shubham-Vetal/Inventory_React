// middleware/uploadMiddleware.js
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary'; 
import path from 'path';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

// Configure Cloudinary using environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer-Cloudinary Storage Configuration
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: (req, file) => {
        return {
            folder: 'item_images', // This will be the folder in your Cloudinary account
            format: 'webp', // Recommended for web: convert to webp for better performance
            public_id: `${file.fieldname}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`, // More unique ID
            resource_type: 'auto', // Auto-detects if it's an image or video
        };
    },
});

// Multer Upload Middleware Configuration
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB per file
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif|webp|tiff|bmp/; // Broaden accepted image types
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files (jpeg, jpg, png, gif, webp, tiff, bmp) are allowed!'));
        }
    }
}).fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'additionalImages', maxCount: 5 }
]);

export default upload; // Export the configured upload middleware using default export
