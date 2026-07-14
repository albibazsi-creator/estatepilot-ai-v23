export function defaultOnboardingItems() {
  return [
    { key: "brand_profile", title: "White-label brand profil beállítása", description: "Logo, színek, domain és tone of voice.", sortOrder: 10 },
    { key: "first_listing", title: "Első prémium listing felvitele", description: "Ár, méret, képek, tour és lead form.", sortOrder: 20 },
    { key: "ai_translation", title: "HU/EN/DE fordítás generálása", description: "Külföldi vevőknek is használható listing csomag.", sortOrder: 30 },
    { key: "seller_report", title: "Első tulajdonosi riport megosztása", description: "Mutasd meg, hogy az ingatlanos aktívan dolgozik.", sortOrder: 40 },
    { key: "partner_api", title: "Partner API kulcs létrehozása", description: "Portál vagy külső landing integráció előkészítése.", sortOrder: 50 }
  ];
}

export function onboardingProgress(items: Array<{ status: string }>) {
  if (!items.length) return { done: 0, total: 0, percent: 0 };
  const done = items.filter((i) => i.status === "done").length;
  return { done, total: items.length, percent: Math.round((done / items.length) * 100) };
}
