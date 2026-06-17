import { TemplateMessagesPanel } from "@/components/admin/TemplateMessagesPanel";

export const dynamic = "force-dynamic";

export default function TemplatesPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <p className="text-xs font-medium text-white/45">Copy Desk</p>
        <h1 className="mt-2 text-2xl font-semibold text-white">Template Messages</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/45">
          Edit placeholders, copy the final message, and paste it into WhatsApp or email.
        </p>
      </div>

      <TemplateMessagesPanel />
    </div>
  );
}
