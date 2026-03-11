"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3 = new client_s3_1.S3Client({
    region: 'us-east-1',
    credentials: { accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY },
});
const uploadFile = async (file) => {
    const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: file.originalname,
        Body: file.buffer,
    };
    await s3.send(new client_s3_1.PutObjectCommand(params));
    return `https://${params.Bucket}.s3.amazonaws.com/${params.Key}`;
};
exports.uploadFile = uploadFile;
