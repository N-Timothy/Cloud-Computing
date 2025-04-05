const express = require("express");
const router = express.Router();
const multer = require("multer");
const s3Service = require("../services/s3");
const { GetObjectCommand } = require("@aws-sdk/client-s3");

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Gallery home - show all images
router.get("/", async (req, res) => {
  try {
    // Get list of objects from S3
    const objects = await s3Service.listObjects();

    // Generate signed URLs for each object
    const items = await Promise.all(
      objects.map(async (object) => {
        return {
          key: object.Key,
          lastModified: object.LastModified,
          size: object.Size,
          url: await s3Service.getPresignedUrl(object.Key),
        };
      })
    );

    res.render("gallery", {
      items,
      bucketName: s3Service.bucketName,
    });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", { error: "Failed to fetch gallery items" });
  }
});

// Upload a file
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Upload file to S3
    await s3Service.uploadFile(req.file);
    res.redirect("/gallery");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to upload file" });
  }
});

// Delete an object
router.post("/delete/:key", async (req, res) => {
  try {
    const key = decodeURIComponent(req.params.key);

    // Delete object from S3
    await s3Service.deleteObject(key);
    res.redirect("/gallery");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete file" });
  }
});

module.exports = router;
