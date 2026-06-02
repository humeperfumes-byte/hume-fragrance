import { Bell, Mail, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { listStockNotifyRequests } from "@/lib/stock-notify";
import { displayPhoneNumber } from "@/lib/phone";

export const dynamic = "force-dynamic";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export default async function StockNotifyPage() {
  const requests = await listStockNotifyRequests(200);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Badge className="mb-3 border-emerald-400/20 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/10">
            <Bell className="mr-1 h-3.5 w-3.5" />
            Stock demand
          </Badge>
          <h1 className="text-2xl font-semibold text-white">Notify Requests</h1>
          <p className="mt-1 max-w-2xl text-sm text-white/45">
            Customers who asked to be notified when sold-out perfumes return.
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-5 py-4 text-right">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">Total requests</p>
          <p className="mt-1 text-2xl font-semibold text-white">{requests.length}</p>
        </div>
      </div>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03]">
        <div className="hidden grid-cols-[1.1fr_1fr_1fr_160px] border-b border-white/10 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35 lg:grid">
          <span>Product</span>
          <span>Contact</span>
          <span>Source</span>
          <span>Created</span>
        </div>
        {requests.length ? (
          <div className="divide-y divide-white/8">
            {requests.map((request) => (
              <div key={request.id} className="grid gap-4 p-5 lg:grid-cols-[1.1fr_1fr_1fr_160px] lg:items-center">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">{request.productName}</p>
                  <p className="mt-1 truncate text-xs text-white/35">{request.productId}</p>
                </div>
                <div className="space-y-1 text-sm text-white/70">
                  {request.email ? (
                    <a href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(request.email)}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white">
                      <Mail className="h-3.5 w-3.5" />
                      {request.email}
                    </a>
                  ) : null}
                  {request.phone ? (
                    <a href={`https://wa.me/${request.phone.replace(/\D/g, "").length === 10 ? `91${request.phone.replace(/\D/g, "")}` : request.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white">
                      <Phone className="h-3.5 w-3.5" />
                      {displayPhoneNumber(request.phone)}
                    </a>
                  ) : null}
                </div>
                <p className="min-w-0 truncate text-sm text-white/35">{request.sourcePath || "Unknown"}</p>
                <p className="text-sm text-white/45">{formatDate(request.createdAt)}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-14 text-center">
            <Bell className="mx-auto h-8 w-8 text-white/25" />
            <h3 className="mt-4 text-lg font-semibold text-white">No notify requests yet</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-white/40">
              When a sold-out product captures email or phone interest, it will appear here.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
