// storageService.ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import consola from "consola";

// S3 Configuration
const bucketName = "litebite.cloud";
const s3 = new S3Client({ region: "eu-north-1" });

// Retry Function
async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 1000
): Promise<T> {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      consola.warn(`Attempt ${attempt} failed. Retrying in ${delayMs}ms...`);
      if (attempt === retries) {
        throw err;
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw new Error("Exceeded retry limit");
}

/**
 * Uploads a file to S3.
 * @param fileName - The key to use for the S3 object.
 * @param fileBuffer - The file data to upload.
 * @param contentType - The MIME type of the file.
 * @returns The S3 URL of the uploaded file.
 */
export async function uploadToS3(
  path: string,
  fileBuffer:  any,
  contentType: string
): Promise<string> {
  const fileName = `${process.env.ENV}/static/${path}`;
  consola.log(`Uploading ${fileName} to S3...`);
  await withRetry(
    () =>
      s3.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: fileName,
          Body: fileBuffer,
          ContentType: contentType,
        })
      ),
    3,
    2000
  );
  const fileUrl = `https://${bucketName}/${fileName}`;
  consola.log(`Uploaded ${fileName} successfully. S3 URL: ${fileUrl}`);
  return fileUrl;
}
