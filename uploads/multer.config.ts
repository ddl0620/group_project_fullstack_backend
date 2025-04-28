import multer from "multer";
import fs from "fs";
import path from "path";

// Tạo thư mục uploads nếu chưa tồn tại
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình storage cho multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Thư mục lưu file tạm thời
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${uniqueSuffix}-${file.originalname}`); // Tên file duy nhất
    },
});

// Cấu hình multer
const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // Giới hạn 5MB mỗi file
        files: 10, // Giới hạn tối đa 10 file mỗi request
    },
    fileFilter: (req, file, cb) => {
        // Chỉ cho phép file ảnh
        if (!file.mimetype.startsWith("image/")) {
            return new Error("Only image files are allowed");
        }
        cb(null, true);
    },
});

export default upload;