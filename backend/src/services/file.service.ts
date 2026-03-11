import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
const s3 = new S3Client({
  region: 'us-east-1',
  credentials: { accessKeyId: process.env.AWS_ACCESS_KEY_ID!, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY! },
});
export const uploadFile = async (file: Express.Multer.File) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: file.originalname,
    Body: file.buffer,
  };
  await s3.send(new PutObjectCommand(params));
  return `https://${params.Bucket}.s3.amazonaws.com/${params.Key}`;
};