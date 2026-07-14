export type SpatialProviderOutput = {
  manifest: "scene.manifest.json";
  acceptedAssets: Array<".ksplat" | ".splat" | ".ply" | "preview.jpg" | "quality.json">;
  minimumScores: {
    coverage: number;
    geometry: number;
    texture: number;
    viewer: number;
  };
  requiredDisclosures: string[];
};

export const spatialProviderOutputContract: SpatialProviderOutput = {
  manifest: "scene.manifest.json",
  acceptedAssets: [".ksplat", ".splat", ".ply", "preview.jpg", "quality.json"],
  minimumScores: { coverage: 78, geometry: 72, texture: 74, viewer: 85 },
  requiredDisclosures: ["AI/digital twin reconstruction", "not a replacement for physical inspection", "staged visuals labeled separately"]
};
