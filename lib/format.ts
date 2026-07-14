export function formatPrice(price?: number | null) {
  if (!price) return "Ár egyeztetés alapján";
  return new Intl.NumberFormat("hu-HU", { style: "currency", currency: "HUF", maximumFractionDigits: 0 }).format(price);
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("hu-HU", { year: "numeric", month: "long", day: "numeric" }).format(new Date(date));
}

export function percent(value: number) {
  return `${Math.round(value)}%`;
}

export function formatCurrency(amount: number, currency = "HUF") {
  return new Intl.NumberFormat("hu-HU", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}
