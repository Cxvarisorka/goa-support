const cloudinary = require('cloudinary').v2;

const deleteImage = async (url) => {
    try {
        // Extract everything after 'upload/'
        const publicIdEncoded = url.split('/').slice(7).join('/').split('.')[0];

        // Decode it to handle non-English characters like Georgian
        const publicId = decodeURIComponent(publicIdEncoded);

        console.log("Deleting publicId:", publicId);

        // Delete the image
        const result = await cloudinary.uploader.destroy(publicId);
        console.log("Image deleted successfully:", result);
    } catch (error) {
        console.error("Error deleting image:", error);
    }
};

module.exports = deleteImage;
