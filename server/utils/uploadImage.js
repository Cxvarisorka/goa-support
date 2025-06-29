const cloudinary = require("../config/cloudinary.js");
const fs = require('fs');

const imageUpload = async (folder, imagePath) => {
    try {
        const result = await cloudinary.uploader.upload(imagePath, {
            folder: folder,
            use_filename: true,
            unique_filename: false,
            overwrite: true,
            resource_type: "image",
            quality: "auto",
            format: "webp",
            transformation: [
                { width: 500, height: 500, crop: "fit", gravity: "center" }
            ]
        });

        console.log(result)

        // fs.unlinkSync(req.file.path); 

        return result;
    } catch(err) {
       return { message: "Error uploading image", error: err.message };
    }
}

module.exports = imageUpload;