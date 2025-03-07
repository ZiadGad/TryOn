const { PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');
const s3Client = require('../../config/awsS3');
const AppError = require('../AppError');

exports.s3Upload = async (file) => {
  const params = {
    Bucket: process.env.MY_AWS_S3_BUCKET,
    Key: `${uuidv4()}-${Date.now()}-${file.originalname}.jpeg`,
    Body: file.buffer,
    ContentType: 'image/jpeg',
  };

  try {
    const command = new PutObjectCommand(params);
    const response = await s3Client.send(command);
    return {
      Location: `https://${params.Bucket}.s3.${process.env.MY_AWS_REGION}.amazonaws.com/${params.Key}`,
      ...response,
    };
  } catch (err) {
    console.error('S3 Upload Error:', err);
    return new AppError('Error uploading file to S3', 500);
  }
};

exports.s3Delete = async (key) => {
  try {
    const params = {
      Bucket: process.env.MY_AWS_S3_BUCKET,
      Key: key,
    };

    const command = new DeleteObjectCommand(params);
    await s3Client.send(command);
    return { status: 204 };
  } catch (err) {
    console.error('S3 Delete Error:', err);
    return new AppError('Error deleteing file', 500);
  }
};
