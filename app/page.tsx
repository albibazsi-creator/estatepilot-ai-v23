import { ArrowRight, BarChart3, Bot, Building2, Camera, Cuboid, FileText, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardText, CardTitle } from "@/components/ui/card";

const modules = [
  { icon: Camera, title: "Capture + AI képelemzés", text: "Fotók, videók, 360 képek, borítókép-javaslat, szobacímkék és minőségpontszám." },
  { icon: Cuboid, title: "3D / 360 landing élmény", text: "Matterport/iframe embed, panoráma támogatás, később hotspotos saját tour builder." },
  { icon: FileText, title: "AI listing generator", text: "Ingatlan.com, Facebook, Instagram, Reels és befektetői verziók egy kattintással." },
  { icon: Users, title: "Lead capture + scoring", text: "GDPR-os lead űrlap, eseménykövetés és 0–100 forrósági pontszám." },
  { icon: BarChart3, title: "Seller report", text: "Tulajdonosbarát heti riport megtekintésekkel, leadekkel és AI javaslatokkal." },
  { icon: Bot, title: "AI property chat", text: "Csak az adott ingatlan adataiból válaszol, bizonytalanság esetén továbbítást ajánl." }
];

export default function HomePage() {
  return (
    <main className="hero-grid min-h-screen">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3 font-black tracking-tight">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-brand-gold">EP</div>
          EstatePilot AI
        </div>
        <Button href="/dashboard">Dashboard</Button>
      </nav>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
        <div>
          <div className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm">AI Listing Conversion OS</div>
          <h1 className="mt-6 text-5xl font-black tracking-tight text-slate-950 md:text-7xl">
            Fotóból komplett digitális ingatlanértékesítési rendszer.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Prémium hirdetési oldal, 360/3D bejárás, AI marketinganyagok, lead scoring és tulajdonosi riport egy rendszerben.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/dashboard" size="lg">Demo dashboard <ArrowRight className="ml-2 h-4 w-4" /></Button>
            <Button href="/listing/budapest-13-kerulet-erkelyes-lakas-62m2" variant="secondary" size="lg">Public listing demo</Button>
          </div>
        </div>
        <div className="glass-card rounded-[2rem] p-5 shadow-soft">
          <div className="rounded-[1.5rem] bg-slate-950 p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-300">Mai prioritások</div>
                <div className="text-2xl font-black">Agent AI Manager</div>
              </div>
              <Building2 className="h-8 w-8 text-brand-gold" />
            </div>
            <div className="mt-6 space-y-3">
              {["Hívd fel Kovács Pétert — 92/100 lead", "Cseréld a cover képet a XIII. kerületi lakásnál", "Küldd el a heti riportot a tulajdonosnak"].map((item, i) => (
                <div key={item} className="rounded-2xl bg-white/10 p-4 text-sm"><span className="mr-2 text-brand-gold">0{i + 1}</span>{item}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-6 pb-20 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((m) => (
          <Card key={m.title}>
            <m.icon className="h-7 w-7 text-brand-gold" />
            <CardTitle className="mt-4">{m.title}</CardTitle>
            <CardText>{m.text}</CardText>
          </Card>
        ))}
      </section>
    </main>
  );
}
