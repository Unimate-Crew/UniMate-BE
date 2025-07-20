import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;

  private readonly bucket: string;

  private readonly configService: ConfigService;

  constructor(configService: ConfigService) {
    this.configService = configService;
    this.s3Client = new S3Client({
      region: configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      },
    });
    this.bucket = configService.get<string>('AWS_S3_BUCKET');
  }

  async generatePutPresignedUrl(params: {
    fileName: string;
    path: string;
    expiresIn?: number;
  }): Promise<{ presignedUrl: string; key: string }> {
    const { fileName, path, expiresIn = 3000 } = params;

    const env = this.configService.get<string>('NODE_ENV', 'dev');
    const key = `${path}/${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: `${env}/${key}`,
    });

    const presignedUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn,
    });

    return { presignedUrl, key };
  }

  async generateGetPresignedUrl(
    key: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }
}
