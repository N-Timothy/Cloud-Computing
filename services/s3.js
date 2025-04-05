const {
  S3Client,
  ListObjectsV2Command,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

// Get configuration from environment variables
const region = process.env.AWS_REGION || "ap-southeast-1";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const bucketName = process.env.AWS_BUCKET_NAME;

// Create S3 client
const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

// List all objects in the bucket
const listObjects = async () => {
  try {
    const command = new ListObjectsV2Command({ Bucket: bucketName });
    const data = await s3Client.send(command);
    return data.Contents || [];
  } catch (error) {
    console.error("Error listing objects:", error);
    throw error;
  }
};

// Upload a file to the bucket
const uploadFile = async (file) => {
  try {
    const params = {
      Bucket: bucketName,
      Key: file.originalname,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const command = new PutObjectCommand(params);
    return await s3Client.send(command);
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

// Get a signed URL for downloading an object
const getPresignedUrl = async (key) => {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    return await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL expires in 1 hour
  } catch (error) {
    console.error("Error generating signed URL:", error);
    throw error;
  }
};

// Delete an object from the bucket
const deleteObject = async (key) => {
  try {
    const params = {
      Bucket: bucketName,
      Key: key,
    };

    const command = new DeleteObjectCommand(params);
    return await s3Client.send(command);
  } catch (error) {
    console.error("Error deleting object:", error);
    throw error;
  }
};

module.exports = {
  listObjects,
  uploadFile,
  getPresignedUrl,
  deleteObject,
  bucketName,
};
