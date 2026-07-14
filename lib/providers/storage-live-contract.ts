export const storageLiveContract = {
  requiredEnv: ["STORAGE_DRIVER", "R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET", "STORAGE_PUBLIC_BASE_URL"],
  requiredControls: ["presigned_upload", "file_size_limit", "mime_type_allowlist", "public_cdn_base_url", "tenant_key_prefix", "original_asset_retention"],
  smokeTests: ["create_upload_intent", "reject_invalid_mime", "serve_public_thumbnail", "deny_cross_tenant_asset"]
} as const;
