const fs = require("fs");
const path = require("path");
const config = require("../config");

// POST /image-upload
async function uploadImage(req, res) {
    if (!req.file) {
        return res.status(200).json({ placeHolderImgUrl: `${config.baseUrl}/assets/placeholder.png` });
    }
    res.status(200).json({ imageUrl: `${config.baseUrl}/uploads/${req.file.filename}` });
}

// DELETE /delete-image?imageUrl=
async function deleteImage(req, res) {
    const { imageUrl } = req.query;
    if (!imageUrl) {
        return res.status(400).json({ error: true, message: "No image url provided" });
    }

    // basename() keeps a crafted imageUrl from escaping the uploads folder
    const filePath = path.join(config.paths.uploads, path.basename(imageUrl));
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: true, message: "Image not found" });
    }

    fs.unlinkSync(filePath);
    res.status(200).json({ error: false, message: "Image deleted successfully" });
}

module.exports = { uploadImage, deleteImage };
