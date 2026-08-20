import "server-only";

import { randomUUID } from "node:crypto";
import {
  v2 as cloudinary,
  type UploadApiErrorResponse,
  type UploadApiResponse,
} from "cloudinary";

import { getCloudinaryPublicIdFromUrl } from "@/lib/cloudinary";

const DEFAULT_UPLOAD_FOLDER = "hume-fragrance";

type CloudinaryUploadInput = {
  buffer: Buffer;
  fileName: string;
  label: string;
  usage: string;
  tags: string[];
};

type CloudinaryRemoteUploadInput = Omit<CloudinaryUploadInput, "buffer" | "fileName"> & {
  sourceUrl: string;
  fileName?: string;
};

export type CloudinaryUploadResult = {
  assetId: string;
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
};

function cleanSegment(value: string, fallback: string) {
  const cleaned = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return cleaned || fallback;
}

function configureCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  const cloudinaryUrl = process.env.CLOUDINARY_URL?.trim();

  if (cloudinaryUrl) {
    try {
      const parsedUrl = new URL(cloudinaryUrl);
      if (
        parsedUrl.protocol !== "cloudinary:" ||
        !parsedUrl.hostname ||
        !parsedUrl.username ||
        !parsedUrl.password
      ) {
        return false;
      }

      cloudinary.config({
        cloud_name: parsedUrl.hostname,
        api_key: decodeURIComponent(parsedUrl.username),
        api_secret: decodeURIComponent(parsedUrl.password),
        secure: true,
      });
      return true;
    } catch {
      return false;
    }
  }

  if (!cloudName || !apiKey || !apiSecret) return false;

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
  return true;
}

export function getCloudinaryConfiguration() {
  const configured = configureCloudinary();
  const config = cloudinary.config();

  return {
    configured,
    cloudName: configured ? String(config.cloud_name || "") : "",
    uploadFolder:
      process.env.CLOUDINARY_UPLOAD_FOLDER?.trim() || DEFAULT_UPLOAD_FOLDER,
  };
}

export async function uploadImageToCloudinary({
  buffer,
  fileName,
  label,
  usage,
  tags,
}: CloudinaryUploadInput): Promise<CloudinaryUploadResult> {
  const configuration = getCloudinaryConfiguration();
  if (!configuration.configured) {
    throw new Error("Cloudinary is not configured");
  }

  const usageFolder = cleanSegment(usage, "general");
  const publicId = `${cleanSegment(fileName.replace(/\.[^.]+$/, ""), "image")}-${randomUUID().slice(0, 8)}`;

  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder: `${configuration.uploadFolder}/${usageFolder}`,
        public_id: publicId,
        unique_filename: false,
        overwrite: false,
        use_filename: false,
        tags: Array.from(new Set(["hume-admin", usageFolder, ...tags])).slice(
          0,
          20,
        ),
        context: {
          caption: label.slice(0, 255),
          usage: usageFolder,
        },
      },
      (
        error: UploadApiErrorResponse | undefined,
        uploaded: UploadApiResponse | undefined,
      ) => {
        if (error || !uploaded) {
          reject(error || new Error("Cloudinary did not return an asset"));
          return;
        }
        resolve(uploaded);
      },
    );

    uploadStream.end(buffer);
  });

  return {
    assetId: result.asset_id,
    publicId: result.public_id,
    secureUrl: result.secure_url,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  };
}

export async function uploadRemoteImageToCloudinary({
  sourceUrl,
  fileName = "imported-image",
  label,
  usage,
  tags,
}: CloudinaryRemoteUploadInput): Promise<CloudinaryUploadResult> {
  const configuration = getCloudinaryConfiguration();
  if (!configuration.configured) {
    throw new Error("Cloudinary is not configured");
  }

  const parsed = new URL(sourceUrl);
  if (!new Set(["http:", "https:"]).has(parsed.protocol)) {
    throw new Error("Only HTTP image URLs can be imported");
  }

  const usageFolder = cleanSegment(usage, "general");
  const publicId = `${cleanSegment(fileName.replace(/\.[^.]+$/, ""), "image")}-${randomUUID().slice(0, 8)}`;
  const result = await cloudinary.uploader.upload(sourceUrl, {
    resource_type: "image",
    folder: `${configuration.uploadFolder}/${usageFolder}`,
    public_id: publicId,
    unique_filename: false,
    overwrite: false,
    use_filename: false,
    tags: Array.from(new Set(["hume-admin", "legacy-import", usageFolder, ...tags])).slice(0, 20),
    context: {
      caption: label.slice(0, 255),
      usage: usageFolder,
      imported_from: parsed.hostname.slice(0, 255),
    },
  });

  return {
    assetId: result.asset_id,
    publicId: result.public_id,
    secureUrl: result.secure_url,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  };
}

export async function destroyCloudinaryImageByUrl(imageUrl: string) {
  const publicId = getCloudinaryPublicIdFromUrl(imageUrl);
  if (!publicId) return { removed: false, reason: "not-cloudinary" as const };

  const configuration = getCloudinaryConfiguration();
  if (!configuration.configured) {
    return { removed: false, reason: "not-configured" as const };
  }

  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
    invalidate: true,
  });

  return {
    removed: result.result === "ok" || result.result === "not found",
    reason: result.result,
  };
}

export async function destroyCloudinaryImageByPublicId(publicId: string) {
  const configuration = getCloudinaryConfiguration();
  if (!configuration.configured) {
    return { removed: false, reason: "not-configured" as const };
  }

  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
    invalidate: true,
  });

  return {
    removed: result.result === "ok" || result.result === "not found",
    reason: result.result,
  };
}
