import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { getCurrentUser } from "@/lib/current-user";
import { buildRoomGraphDraft } from "@/lib/spatial-v18";

export default async function RoomGraphPage() {
  const { agency } = await getCurrentUser();
  const graph = await buildRoomGraphDraft(agency.id);
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">Room graph</p>
        <h1 className="text-3xl font-black">AI Room Graph Draft</h1>
        <p className="mt-2 text-slate-600">A 3D viewer és a floorplan-linking alapja: helyiségek és átjárások draftja média címkékből, tour hotspotokból és fallback szekvenciából.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Graph score" value={`${graph.score}%`} detail={graph.status} />
        <MetricCard label="Nodes" value={graph.nodes.length} detail="helyiség" />
        <MetricCard label="Edges" value={graph.edges.length} detail="kapcsolat" />
        <MetricCard label="Persisted" value={`${graph.persistedNodes}/${graph.persistedEdges}`} detail="node/edge" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-xl font-black">Room node-ok</h2>
          <div className="mt-4 space-y-2 text-sm">
            {graph.nodes.map((node) => <div key={node.nodeKey} className="flex items-center justify-between rounded-2xl border p-3"><span>{node.roomName}</span><StatusPill label={`${node.confidence}%`} tone={node.confidence >= 70 ? "green" : "amber"} /></div>)}
          </div>
        </Card>
        <Card>
          <h2 className="text-xl font-black">Kapcsolatok</h2>
          <div className="mt-4 space-y-2 text-sm">
            {graph.edges.map((edge, idx) => <div key={`${edge.fromRoom}-${edge.toRoom}-${idx}`} className="rounded-2xl border p-3"><b>{edge.fromRoom}</b> → <b>{edge.toRoom}</b><div className="text-xs text-slate-500">{edge.source} · {edge.confidence}%</div></div>)}
          </div>
        </Card>
      </div>
    </div>
  );
}
