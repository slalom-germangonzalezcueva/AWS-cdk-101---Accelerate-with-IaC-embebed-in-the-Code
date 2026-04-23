import type { APIGatewayProxyHandler } from 'aws-lambda';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { S3Client } from '@aws-sdk/client-s3';
import { jsonResponse, parseJsonBody } from '../shared/response';

interface UploadUrlRequest {
  contentType?: string;
  fileExtension?: string;
}

const s3 = new S3Client({});
const bucketName = process.env.IMAGE_BUCKET_NAME!;

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const input = parseJsonBody<UploadUrlRequest>(event.body);
    const contentType = input.contentType ?? 'image/png';
    if (!contentType.startsWith('image/')) {
      return jsonResponse(400, { message: 'Only image content types are allowed' });
    }

    const extension = (input.fileExtension ?? contentType.split('/')[1] ?? 'png').replace('.', '');
    const key = `profile-images/${randomUUID()}.${extension}`;
    const uploadUrl = await getSignedUrl(
      s3,
      new PutObjectCommand({ Bucket: bucketName, Key: key, ContentType: contentType }),
      { expiresIn: 300 },
    );

    return jsonResponse(200, { bucketName, key, uploadUrl, expiresInSeconds: 300 });
  } catch (error) {
    console.error(error);
    return jsonResponse(500, { message: 'Could not create upload URL' });
  }
};
