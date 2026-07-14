import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { plans } from "@/lib/billing";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function BillingPage() {
  const { agency } = await getCurrentUser();
  const [payments, invoices] = await Promise.all([
    prisma.paymentRecord.findMany({ where: { agencyId: agency.id }, orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.invoiceRecord.findMany({ where: { agencyId: agency.id }, orderBy: { createdAt: "desc" }, take: 10 })
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">Billing / csomagok</h1>
        <p className="mt-2 text-slate-500">Stripe / Barion / manuális értékesítés előkészített helye. Éles kulcs nélkül manual checkout módban működik.</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.code} className="flex flex-col justify-between">
            <div>
              <div className="text-sm font-bold text-slate-500">{plan.interval === "month" ? "Havidíj" : "Pay-per-listing"}</div>
              <h2 className="mt-2 text-xl font-black">{plan.name}</h2>
              <div className="mt-3 text-3xl font-black">{formatCurrency(plan.priceHuf, "HUF")}</div>
              <p className="mt-2 text-sm text-slate-500">Aktív listing limit: {plan.activeListings}</p>
            </div>
            <Button className="mt-5" href={`/api/billing/plans?selected=${plan.code}`}>Csomag API</Button>
          </Card>
        ))}
      </div>
      <Card>
        <h2 className="text-xl font-black">Legutóbbi fizetési rekordok</h2>
        <div className="mt-4 divide-y divide-slate-100">
          {payments.map((payment) => <div key={payment.id} className="flex justify-between py-3 text-sm"><span>{payment.plan} • {payment.provider}</span><b>{payment.status} • {formatCurrency(payment.amount, payment.currency)}</b></div>)}
          {!payments.length && <p className="text-sm text-slate-500">Még nincs fizetési rekord.</p>}
        </div>
      </Card>
      <Card>
        <h2 className="text-xl font-black">Számlák</h2>
        <div className="mt-4 divide-y divide-slate-100">
          {invoices.map((invoice) => <div key={invoice.id} className="flex justify-between py-3 text-sm"><span>{invoice.invoiceNumber ?? invoice.provider} • {formatDate(invoice.createdAt)}</span><b>{invoice.status}</b></div>)}
          {!invoices.length && <p className="text-sm text-slate-500">Számlázz.hu adapter még nincs éles kulccsal használva.</p>}
        </div>
      </Card>
    </div>
  );
}
