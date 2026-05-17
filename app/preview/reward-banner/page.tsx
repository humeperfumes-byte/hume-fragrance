import { WelcomeBackRewardBannerCard } from "@/components/WelcomeBackRewardBanner";

export default function RewardBannerPreviewPage() {
  return (
    <main className="min-h-screen bg-[#080706] px-4 py-12 text-white">
      <div className="mx-auto flex max-w-4xl flex-col gap-10">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/35">
            Preview
          </p>
          <h1 className="mt-3 font-serif text-4xl font-light">
            Welcome Reward Banners
          </h1>
        </div>

        <section className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-200/70">
            5% Green Banner
          </p>
          <div className="flex justify-center rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.16),transparent_38%),#0c0c0a] px-3 py-10">
            <WelcomeBackRewardBannerCard percent={5} />
          </div>
        </section>

        <section className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-200/70">
            10% Red Banner
          </p>
          <div className="flex justify-center rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.16),transparent_38%),#0c0c0a] px-3 py-10">
            <WelcomeBackRewardBannerCard percent={10} />
          </div>
        </section>
      </div>
    </main>
  );
}
