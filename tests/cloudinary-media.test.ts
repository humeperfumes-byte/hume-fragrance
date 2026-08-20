import assert from "node:assert/strict";
import test from "node:test";

import {
  getCloudinaryPublicIdFromUrl,
  withCloudinaryTransforms,
} from "../lib/cloudinary";
import {
  MAX_IMAGE_UPLOAD_BYTES,
  validateImageUpload,
} from "../lib/image-upload-policy";
import { persistCloudinaryAsset } from "../lib/cloudinary-persistence";

test("accepts supported images at the 10 MB boundary", () => {
  assert.equal(
    validateImageUpload({ type: "image/webp", size: MAX_IMAGE_UPLOAD_BYTES }),
    null,
  );
});

test("rejects unsupported media and images over 10 MB", () => {
  assert.match(
    validateImageUpload({ type: "video/mp4", size: 100 }) || "",
    /Only PNG/,
  );
  assert.match(
    validateImageUpload({ type: "image/png", size: MAX_IMAGE_UPLOAD_BYTES + 1 }) || "",
    /10 MB/,
  );
});

test("adds optimized delivery transformations and component width once", () => {
  const source =
    "https://res.cloudinary.com/demo/image/upload/v1774278594/products/perfume.png";
  const transformed = withCloudinaryTransforms(source, { width: 480 });
  assert.equal(
    transformed,
    "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,dpr_auto,w_480/v1774278594/products/perfume.png",
  );
  assert.equal(withCloudinaryTransforms(transformed, { width: 480 }), transformed);
});

test("leaves external image URLs unchanged", () => {
  const external = "https://example.com/perfume.png";
  assert.equal(withCloudinaryTransforms(external, { width: 480 }), external);
});

test("extracts versioned Cloudinary public IDs safely", () => {
  assert.equal(
    getCloudinaryPublicIdFromUrl(
      "https://res.cloudinary.com/demo/image/upload/v1774278594/hume-fragrance/products/perfume.png",
    ),
    "hume-fragrance/products/perfume",
  );
  assert.equal(getCloudinaryPublicIdFromUrl("https://example.com/perfume.png"), null);
});

test("rolls back a new Cloudinary asset when database persistence fails", async () => {
  let rollbackCalls = 0;
  await assert.rejects(
    persistCloudinaryAsset({
      persist: async () => {
        throw new Error("database unavailable");
      },
      rollback: async () => {
        rollbackCalls += 1;
      },
    }),
    /database unavailable/,
  );
  assert.equal(rollbackCalls, 1);
});
