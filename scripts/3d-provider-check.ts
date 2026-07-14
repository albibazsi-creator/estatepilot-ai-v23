import { getSpatialProviderMatrix } from "../lib/spatial-3d";

async function main() {
  const providers = getSpatialProviderMatrix();
  const live = providers.filter((provider) => provider.status === "live").length;
  console.log(JSON.stringify({ check: "3d-providers", live, total: providers.length, providers: providers.map((provider) => ({ key: provider.providerKey, status: provider.status, missingEnv: provider.missingEnv })) }, null, 2));
}

main();
