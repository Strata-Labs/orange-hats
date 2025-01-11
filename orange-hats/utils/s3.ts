import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const validateEnvVariables = () => {
  const required = [
    "AWS_REGION",
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "AWS_S3_BUCKET_NAME",
  ];

  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
};

const getS3Client = () => {
  validateEnvVariables();

  return new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
};

const s3Client = getS3Client();
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;

export interface SignedUrlResult {
  url: string;
  fields?: Record<string, string>;
}

export class S3Error extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = "S3Error";
    if (process.env.NODE_ENV === "development" && cause) {
      console.error("S3 Error Details:", cause);
    }
  }
}

export interface PdfOperationResult {
  success: boolean;
  url: string;
  key?: string;
  error?: string;
}

export const s3Utils = {
  async getSignedUploadUrl(
    key: string,
    contentType: string = "application/pdf",
    expiresIn: number = 3600
  ): Promise<SignedUrlResult> {
    try {
      validateEnvVariables();

      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: contentType,
      });

      const url = await getSignedUrl(s3Client, command, { expiresIn });

      return { url };
    } catch (error) {
      console.error("Failed to generate upload URL:", error);
      throw new S3Error(
        "Failed to generate signed upload URL: " +
          (error instanceof Error ? error.message : "Unknown error"),
        error
      );
    }
  },

  async getSignedDownloadUrl(
    key: string,
    expiresIn: number = 3600
  ): Promise<SignedUrlResult> {
    try {
      validateEnvVariables();

      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      const url = await getSignedUrl(s3Client, command, { expiresIn });

      return { url };
    } catch (error) {
      throw new S3Error(
        "Failed to generate signed download URL: " +
          (error instanceof Error ? error.message : "Unknown error"),
        error
      );
    }
  },

  generatePdfKey(auditId: string, fileName: string): string {
    if (!auditId || !fileName) {
      throw new Error("auditId and fileName are required to generate PDF key");
    }
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    if (auditId === "new") {
      return `temp/${sanitizedFileName}`;
    }
    return `audits/${auditId}/${sanitizedFileName}`;
  },
};
