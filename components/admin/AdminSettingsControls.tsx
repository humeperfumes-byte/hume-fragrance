"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { defaultAdminControls, normalizeAdminControls, type AdminControls } from "@/lib/admin-settings";

type SettingRowProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

function SettingRow({ title, description, children }: SettingRowProps) {
  return (
    <div className="grid gap-4 border-b border-white/10 py-5 last:border-b-0 md:grid-cols-[minmax(0,1fr)_minmax(16rem,24rem)] md:items-center">
      <div>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-white/45">{description}</p>
      </div>
      {children}
    </div>
  );
}

function NumberInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <Input
      type="number"
      min={0}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="border-white/10 bg-white/[0.04] text-white"
    />
  );
}

export function AdminSettingsControls() {
  const [settings, setSettings] = useState<AdminControls>(defaultAdminControls);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/settings", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed to load settings");
        return normalizeAdminControls(await response.json());
      })
      .then((nextSettings) => {
        if (active) setSettings(nextSettings);
      })
      .catch(() => {
        toast({ title: "Failed to load settings", variant: "destructive" });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const update = <K extends keyof AdminControls>(key: K, value: AdminControls[K]) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error("Failed to save settings");
      setSettings(normalizeAdminControls(await response.json()));
      toast({ title: "Settings saved" });
    } catch (error) {
      console.error(error);
      toast({ title: "Failed to save settings", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-sm text-white/45">
        Loading settings...
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <div className="mb-2 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Storefront Controls</h2>
            <p className="mt-1 text-sm text-white/45">Change live copy and buyer-facing switches without editing code.</p>
          </div>
          <Button onClick={saveSettings} disabled={saving} className="bg-white text-black hover:bg-white/90">
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving" : "Save"}
          </Button>
        </div>

        <SettingRow title="Announcement bar" description="Show or hide the top promotion bar when it is mounted.">
          <Switch checked={settings.announcementEnabled} onCheckedChange={(value) => update("announcementEnabled", value)} />
        </SettingRow>
        <SettingRow title="Announcement text" description="Short message for the announcement bar.">
          <Textarea
            value={settings.announcementText}
            onChange={(event) => update("announcementText", event.target.value)}
            className="min-h-20 border-white/10 bg-white/[0.04] text-white"
          />
        </SettingRow>
        <SettingRow title="Hero offer text" description="Support line below the rotating homepage offer.">
          <Textarea
            value={settings.heroOfferText}
            onChange={(event) => update("heroOfferText", event.target.value)}
            className="min-h-20 border-white/10 bg-white/[0.04] text-white"
          />
        </SettingRow>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-lg font-semibold text-white">Cart And Checkout</h2>
        <p className="mt-1 text-sm text-white/45">Offer math and checkout switches used by cart and checkout surfaces.</p>

        <SettingRow title="Free delivery threshold" description="Cart and checkout show free delivery above this subtotal.">
          <NumberInput value={settings.freeDeliveryThreshold} onChange={(value) => update("freeDeliveryThreshold", value)} />
        </SettingRow>
        <SettingRow title="Shipping charge below threshold" description="Delivery fee when subtotal is below the free delivery threshold.">
          <NumberInput value={settings.shippingChargeBelowThreshold} onChange={(value) => update("shippingChargeBelowThreshold", value)} />
        </SettingRow>
        <SettingRow title="Gift 1 threshold" description="Subtotal required to unlock the first free gift.">
          <NumberInput value={settings.giftOneThreshold} onChange={(value) => update("giftOneThreshold", value)} />
        </SettingRow>
        <SettingRow title="Gift 2 threshold" description="Subtotal required to unlock the second free gift.">
          <NumberInput value={settings.giftTwoThreshold} onChange={(value) => update("giftTwoThreshold", value)} />
        </SettingRow>
        <SettingRow title="Welcome-back reward" description="Controls the return-visitor reward unlock in cart.">
          <Switch checked={settings.welcomeBackEnabled} onCheckedChange={(value) => update("welcomeBackEnabled", value)} />
        </SettingRow>
        <SettingRow title="Razorpay checkout" description="Hide online payment entry points without removing WhatsApp checkout.">
          <Switch checked={settings.razorpayEnabled} onCheckedChange={(value) => update("razorpayEnabled", value)} />
        </SettingRow>
        <SettingRow title="WhatsApp checkout" description="Show or hide WhatsApp checkout actions.">
          <Switch checked={settings.whatsappCheckoutEnabled} onCheckedChange={(value) => update("whatsappCheckoutEnabled", value)} />
        </SettingRow>
        <SettingRow title="WhatsApp number" description="Primary support/order WhatsApp number with country code.">
          <Input
            value={settings.whatsappNumber}
            onChange={(event) => update("whatsappNumber", event.target.value.replace(/\D/g, ""))}
            className="border-white/10 bg-white/[0.04] text-white"
          />
        </SettingRow>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-lg font-semibold text-white">Operations And Cost</h2>
        <p className="mt-1 text-sm text-white/45">Admin defaults and database-cost controls.</p>

        <SettingRow title="Behavioral Intelligence" description="Keep disabled unless you intentionally want heavy behavioral DB writes.">
          <Switch
            checked={settings.behavioralIntelligenceEnabled}
            onCheckedChange={(value) => update("behavioralIntelligenceEnabled", value)}
          />
        </SettingRow>
        <SettingRow title="Default admin window" description="Preferred dashboard window for future admin screens.">
          <select
            value={settings.defaultAdminWindowHours}
            onChange={(event) => update("defaultAdminWindowHours", Number(event.target.value))}
            className="h-10 rounded-md border border-white/10 bg-[#171717] px-3 text-sm text-white"
          >
            {[24, 48, 72, 120, 168, 240, 360, 720, 2160].map((hours) => (
              <option key={hours} value={hours}>
                {hours === 24 ? "Last 24 Hours" : `Last ${Math.round(hours / 24)} Days`}
              </option>
            ))}
          </select>
        </SettingRow>
      </section>
    </div>
  );
}
