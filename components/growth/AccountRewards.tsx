"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Coins, Copy, RefreshCw, Gift } from "lucide-react";
import { getStoredAccountLoginToken } from "@/lib/customer-account";
import { growthHeaders } from "@/lib/growth/client";
import type { Wallet } from "@/lib/growth/rules";
export default function AccountRewards({
  refreshKey,
  onVerify,
}: {
  refreshKey?: string;
  onVerify: () => void;
}) {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [offers, setOffers] = useState<
    { title: string; body: string; link: string }[]
  >([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const load = useCallback(async (marketingOptIn?: boolean) => {
    setBusy(true);
    setError("");
    try {
      const token = getStoredAccountLoginToken(localStorage);
      if (!token)
        throw new Error("Verify your account to unlock your coin wallet.");
      const res = await fetch("/api/growth/account", {
        method: "POST",
        headers: growthHeaders(),
        body: JSON.stringify({ accountToken: token, marketingOptIn }),
      });
      const data = await res.json();
      if (!res.ok) throw Error(data.error);
      setWallet(data.wallet);
      setOffers(data.offers);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load, refreshKey]);
  return (
    <section className="mb-6 min-w-0 overflow-hidden rounded-[2rem] border border-[#d1b683]/30 bg-[linear-gradient(135deg,#422b1c,#1b120d)] p-6 text-[#f7e7ca] shadow-xl">
      <header className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.2em]">
          <Coins size={17} />
          HUME Coins
        </p>
        <button
          type="button"
          aria-label="Refresh coin wallet"
          disabled={busy}
          onClick={() => void load()}
        >
          <RefreshCw size={14} className={busy ? "animate-spin" : ""} />
        </button>
      </header>
      <p className="mt-5 text-5xl font-semibold">{wallet?.available ?? "—"}</p>
      <p className="mt-2 text-xs text-[#c9ae85]">
        Available coins · 1 coin = ₹1
      </p>
      {wallet && (
        <>
          <div className="mt-5 grid grid-cols-2 gap-2 border-t border-white/10 pt-4 text-xs">
            <div>
              <span className="block text-[#bfa17b]">Pending</span>
              <strong className="mt-1 block text-lg">{wallet.pending}</strong>
            </div>
            <div>
              <span className="block text-[#bfa17b]">Reserved</span>
              <strong className="mt-1 block text-lg">{wallet.reserved}</strong>
            </div>
          </div>
          <Link
            href="/shop"
            className="mt-5 block rounded-full bg-[#e4c78f] py-3 text-center text-xs font-semibold text-[#322014]"
          >
            Shop · choose whether to use coins
          </Link>
          <button
            type="button"
            className="mt-4 text-xs underline underline-offset-4"
            onClick={() => setShowHistory((v) => !v)}
          >
            {showHistory ? "Hide history" : "Coin history"}
          </button>
          {showHistory && (
            <div className="mt-3 max-h-52 space-y-3 overflow-y-auto text-xs">
              {wallet.history.length ? (
                wallet.history.map((item) => (
                  <div key={item.id} className="border-t border-white/10 pt-2">
                    <div className="flex justify-between gap-2">
                      <span>{item.note}</span>
                      <strong className="shrink-0">
                        {item.delta > 0 ? "+" : ""}
                        {item.delta}
                      </strong>
                    </div>
                    <p className="mt-1 text-[10px] text-[#bfa17b]">
                      {new Date(item.created_at).toLocaleDateString("en-IN")} ·{" "}
                      {item.voided ? "Reversed" : new Date(item.available_at) > new Date()
                        ? "Pending"
                        : "Available / used"}
                    </p>
                  </div>
                ))
              ) : (
                <p>Your coin history will appear here.</p>
              )}
            </div>
          )}
          <div className="mt-5 border-t border-white/10 pt-4">
            <p className="flex items-center gap-2 text-xs font-semibold">
              <Gift size={14} />
              Refer a friend
            </p>
            {wallet.settings.referralsEnabled ? (
              <>
                <p className="mt-2 text-xs leading-relaxed text-[#c9ae85]">
                  Earn {wallet.settings.referralCoins} coins after a friend’s
                  first qualifying order is delivered and its reward hold ends.
                </p>
                <button
                  type="button"
                  className="mt-3 flex items-center gap-2 text-xs underline"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(
                        "https://www.humefragrance.com/r/" +
                          wallet.referralCode,
                      );
                      setCopied(true);
                    } catch {
                      setError("Clipboard is unavailable.");
                    }
                  }}
                >
                  <Copy size={13} />
                  {copied
                    ? "Link copied"
                    : wallet.referralCode + " · copy link"}
                </button>
                {wallet.referrals?.length ? (
                  <p className="mt-2 text-[10px] text-[#bfa17b]">
                    {wallet.referrals.length} referrals ·{" "}
                    {
                      wallet.referrals.filter((r) => r.status === "earned")
                        .length
                    }{" "}
                    earned
                  </p>
                ) : null}
              </>
            ) : (
              <p className="mt-2 text-xs text-[#bfa17b]">
                Referral rewards are not enabled yet.
              </p>
            )}
          </div>
          <label className="mt-5 flex cursor-pointer items-start gap-2 border-t border-white/10 pt-4 text-xs leading-relaxed">
            <input
              className="mt-0.5 shrink-0 accent-[#e4c78f]"
              type="checkbox"
              disabled={busy}
              checked={wallet.marketingOptIn}
              onChange={(e) => void load(e.target.checked)}
            />
            <span>
              Send me HUME offers, festive sales and new launches on WhatsApp. I
              can turn this off anytime or reply STOP.
            </span>
          </label>
          {offers.length > 0 && (
            <div className="mt-5 border-t border-white/10 pt-4">
              <p className="text-xs font-semibold">Your offers</p>
              {offers.slice(0, 3).map((offer, index) => (
                <a
                  key={index}
                  href={offer.link}
                  className="mt-3 block text-xs underline"
                >
                  {offer.title}
                </a>
              ))}
            </div>
          )}
        </>
      )}
      {error && (
        <div
          role="alert"
          className="mt-4 text-xs leading-relaxed text-amber-100"
        >
          <p>{error}</p>
          <button
            type="button"
            className="mt-2 font-semibold underline"
            onClick={onVerify}
          >
            Verify account
          </button>
        </div>
      )}
    </section>
  );
}
