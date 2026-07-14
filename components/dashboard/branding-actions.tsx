import { Button } from "@/components/ui/button";

export function BrandingQuickActions({ profileId }: { profileId?: string }) {
  return (
    <div className="flex flex-wrap gap-3">
      <Button href="/dashboard/branding" variant="secondary">Brand profil</Button>
      {profileId ? <Button href={`/api/branding/${profileId}/css`} variant="secondary">CSS letöltés</Button> : null}
      <Button href="/dashboard/translations" variant="secondary">Fordítások</Button>
    </div>
  );
}
