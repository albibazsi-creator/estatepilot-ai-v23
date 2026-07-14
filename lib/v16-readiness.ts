import { getV14Readiness } from "@/lib/v14-readiness";
import { getDigitalTwinReadiness, getSpatialPipelineSummary, getSpatialProviderMatrix } from "@/lib/spatial-3d";

export async function getV16Readiness(agencyId: string) {
  const [v14, digitalTwin, pipeline] = await Promise.all([
    getV14Readiness(agencyId),
    getDigitalTwinReadiness(agencyId),
    getSpatialPipelineSummary(agencyId)
  ]);
  const providers = getSpatialProviderMatrix();
  const reconstructionProviders = providers.filter((provider) => provider.area === "reconstruction");
  const liveReconstruction = reconstructionProviders.filter((provider) => provider.status === "live").length;
  const providerScore = Math.round((providers.filter((provider) => provider.status === "live").length / providers.length) * 100);
  const score = Math.round(v14.score * 0.34 + digitalTwin.score * 0.38 + pipeline.score * 0.18 + providerScore * 0.1);
  const blockers = [
    ...v14.blockers.slice(0, 5),
    ...digitalTwin.blockers,
    ...providers.filter((provider) => provider.status !== "live" && ["reconstruction", "storage"].includes(provider.area)).map((provider) => `${provider.providerName}: ${provider.nextAction}`)
  ];
  const status = liveReconstruction === 0
    ? "3d_mock_ready"
    : score >= 85
      ? "spatial_pilot_ready"
      : score >= 70
        ? "3d_dry_run_ready"
        : "needs_3d_capture_hardening";
  return { score, status, v14, digitalTwin, pipeline, providers, providerScore, liveReconstruction, blockers: Array.from(new Set(blockers)).slice(0, 12) };
}
