import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const steps = [
  { title: "1. Agency profil", body: "Logo, számlázási email, csomag és brand színek beállítása." },
  { title: "2. Első listing", body: "Ingatlanadatok, képek, alaprajz és Matterport/360 link feltöltése." },
  { title: "3. AI bundle", body: "Képelemzés, hirdetésszöveg, social poszt, Reels script és FAQ generálása." },
  { title: "4. Landing publikálás", body: "Public oldal ellenőrzése mobilon, GDPR checkbox, lead form és chat teszt." },
  { title: "5. Kampány és lead flow", body: "AI kampánycsomag, event tracking, lead scoring és follow-up taskok indítása." },
  { title: "6. Seller report", body: "Heti riport generálás, tulajdonosi megosztó link és email küldés tesztelése." }
];

export default function OnboardingPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">Onboarding playbook</h1>
          <p className="text-slate-500">Pontosan ez alapján lehet első ügyfél-demoig elvinni a rendszert.</p>
        </div>
        <Button href="/dashboard/listings/new">Első listing létrehozása</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {steps.map((step) => (
          <Card key={step.title}>
            <h2 className="text-lg font-black">{step.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{step.body}</p>
          </Card>
        ))}
      </div>

      <Card className="bg-slate-950 text-white">
        <h2 className="text-xl font-black">Éles demo kritérium</h2>
        <p className="mt-3 text-sm text-white/70">A demót akkor érdemes mutatni ingatlanosnak, ha egy mintaingatlanon végigmegy: feltöltés → AI elemzés → public landing → lead → scoring → follow-up task → seller report.</p>
      </Card>
    </div>
  );
}
