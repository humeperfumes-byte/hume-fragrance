"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import qrcode from "qrcode-generator";
import { 
  QrCode, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  MapPin, 
  Image as ImageIcon,
  Sliders,
  Type,
  Save,
  Trash2,
  ExternalLink,
  Eye,
  Pencil,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { HUME_HF_LOGO_BASE64 } from "@/lib/hume-logo-base64";
import CustomStarQRCode from "@/components/CustomStarQRCode";

interface SavedQRCampaign {
  id: string;
  name: string;
  city: string;
  targetPage: string;
  targetUrl: string;
  bodyType: string;
  eyeStyle: string;
  logoType: string;
  qrCodeSvg?: string | null;
  scanCount: number;
  lastScannedAt?: string;
  createdAt: string;
}

const CITIES = [
  { slug: "ahmedabad", name: "Ahmedabad" },
  { slug: "mumbai", name: "Mumbai" },
  { slug: "delhi", name: "Delhi NCR" },
  { slug: "bengaluru", name: "Bengaluru" },
  { slug: "surat", name: "Surat" },
  { slug: "vadodara", name: "Vadodara" },
  { slug: "jaipur", name: "Jaipur" },
];

export default function QRGeneratorStudio() {
  const [city, setCity] = useState("ahmedabad");
  const [targetType, setTargetType] = useState<"perfumes" | "discovery-set">("perfumes");
  const [campaignName, setCampaignName] = useState("Ahmedabad Blinkit Flyer Batch 1");
  const [customUrl, setCustomUrl] = useState("");
  const [bodyType, setBodyType] = useState<"stars" | "squares" | "dots" | "diamonds" | "hearts">("stars");
  const [eyeStyle, setEyeStyle] = useState<"rounded" | "square" | "circle">("rounded");
  const [logoType, setLogoType] = useState<"hf-cursive" | "custom-image" | "none">("hf-cursive");
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(null);
  const [logoScale, setLogoScale] = useState(0.16); // 16% size
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [saving, setSaving] = useState(false);

  const [savedCampaigns, setSavedCampaigns] = useState<SavedQRCampaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);

  const svgRef = useRef<SVGSVGElement | null>(null);

  const fetchSavedCampaigns = async () => {
    setLoadingCampaigns(true);
    try {
      const res = await fetch("/api/admin/qr-campaigns");
      const data = await res.json();
      if (data.success) {
        setSavedCampaigns(data.campaigns || []);
      }
    } catch (err) {
      console.error("Failed to load saved QR campaigns:", err);
    } finally {
      setLoadingCampaigns(false);
    }
  };

  useEffect(() => {
    fetchSavedCampaigns();
  }, []);

  // Compute final URL for rendering
  const activeUrl = customUrl.trim() || `https://www.humefragrance.com/flyers/${city}/${targetType}`;

  // SVG Matrix Generator logic
  const svgData = useMemo(() => {
    const qr = qrcode(0, "H");
    qr.addData(activeUrl);
    qr.make();

    const moduleCount = qr.getModuleCount();
    const cellSize = 10;
    const padding = 24;
    const viewSize = moduleCount * cellSize + padding * 2;

    const isFinderPattern = (r: number, c: number) => {
      if (r < 7 && c < 7) return true;
      if (r < 7 && c >= moduleCount - 7) return true;
      if (r >= moduleCount - 7 && c < 7) return true;
      return false;
    };

    const centerMatrixIndex = moduleCount / 2;
    const maskRadiusMatrix = logoType === "none" ? 0 : moduleCount * (logoScale * 1.05);

    const isCenterMask = (r: number, c: number) => {
      if (logoType === "none") return false;
      const dist = Math.hypot(r + 0.5 - centerMatrixIndex, c + 0.5 - centerMatrixIndex);
      return dist < maskRadiusMatrix;
    };

    const getStarPath = (cx: number, cy: number, outerR: number, innerR: number) => {
      const points = [];
      const numPoints = 5;
      for (let i = 0; i < numPoints * 2; i++) {
        const radius = i % 2 === 0 ? outerR : innerR;
        const angle = (i * Math.PI) / numPoints - Math.PI / 2;
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);
        points.push(`${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`);
      }
      points.push("Z");
      return points.join(" ");
    };

    const getHeartPath = (cx: number, cy: number, size: number) => {
      const s = size * 0.5;
      return `M ${cx} ${cy + s * 0.5} 
              C ${cx - s} ${cy - s * 0.5}, ${cx - s * 1.2} ${cy - s * 1.3}, ${cx} ${cy - s * 0.6}
              C ${cx + s * 1.2} ${cy - s * 1.3}, ${cx + s} ${cy - s * 0.5}, ${cx} ${cy + s * 0.5} Z`;
    };

    const paths: string[] = [];
    const circles: { cx: number; cy: number; r: number }[] = [];
    const rects: { x: number; y: number; width: number; height: number }[] = [];

    for (let r = 0; r < moduleCount; r++) {
      for (let c = 0; c < moduleCount; c++) {
        if (qr.isDark(r, c) && !isFinderPattern(r, c) && !isCenterMask(r, c)) {
          const cx = padding + c * cellSize + cellSize / 2;
          const cy = padding + r * cellSize + cellSize / 2;

          if (bodyType === "stars") {
            const outerR = cellSize * 0.58;
            paths.push(getStarPath(cx, cy, outerR, outerR * 0.42));
          } else if (bodyType === "dots") {
            circles.push({ cx, cy, r: cellSize * 0.38 });
          } else if (bodyType === "squares") {
            rects.push({
              x: padding + c * cellSize + cellSize * 0.1,
              y: padding + r * cellSize + cellSize * 0.1,
              width: cellSize * 0.8,
              height: cellSize * 0.8,
            });
          } else if (bodyType === "diamonds") {
            const rVal = cellSize * 0.48;
            paths.push(`M ${cx} ${cy - rVal} L ${cx + rVal} ${cy} L ${cx} ${cy + rVal} L ${cx - rVal} ${cy} Z`);
          } else if (bodyType === "hearts") {
            paths.push(getHeartPath(cx, cy, cellSize));
          }
        }
      }
    }

    const eyes = [
      { r: 0, c: 0 },
      { r: 0, c: moduleCount - 7 },
      { r: moduleCount - 7, c: 0 },
    ];

    return {
      viewSize,
      cellSize,
      padding,
      moduleCount,
      paths,
      circles,
      rects,
      eyes,
      centerCx: viewSize / 2,
      centerCy: viewSize / 2,
      centerRadius: (moduleCount * cellSize) * logoScale,
    };
  }, [activeUrl, bodyType, logoType, logoScale]);

  const [selectedCampaignDetails, setSelectedCampaignDetails] = useState<SavedQRCampaign | null>(null);
  const [copiedDetailsUrl, setCopiedDetailsUrl] = useState(false);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(activeUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {}
  };

  const handleCopyDetailsUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedDetailsUrl(true);
      setTimeout(() => setCopiedDetailsUrl(false), 2000);
    } catch {}
  };

  const handleDownloadSavedPng = (campaign: SavedQRCampaign) => {
    if (!campaign.qrCodeSvg) return;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = 1200;
      canvas.height = 1200;
      if (ctx) {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, 1200, 1200);

        const pngUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `HUME-QR-${campaign.city.toUpperCase()}-${campaign.targetPage}-${campaign.id}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    };

    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(campaign.qrCodeSvg)))}`;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomLogoUrl(event.target?.result as string);
        setLogoType("custom-image");
      };
      reader.readAsDataURL(file);
    }
  };

  // Register & Save QR Campaign in System
  const handleSaveCampaign = async () => {
    setSaving(true);
    try {
      const qrCodeSvg = svgRef.current
        ? new XMLSerializer().serializeToString(svgRef.current)
        : undefined;

      const res = await fetch("/api/admin/qr-campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: campaignName,
          city,
          targetPage: targetType,
          customUrl: customUrl.trim() || undefined,
          bodyType,
          eyeStyle,
          logoType,
          qrCodeSvg,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast({
          title: "QR Campaign Registered! 🎉",
          description: `Saved "${campaignName}" in system with unique tracking ID.`,
        });
        fetchSavedCampaigns();
      } else {
        toast({ title: "Failed to save QR campaign", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error saving QR campaign", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleRenameCampaign = async (id: string, currentName: string) => {
    const newName = prompt("Enter new campaign name:", currentName);
    if (!newName || newName.trim() === "" || newName.trim() === currentName) return;

    try {
      const res = await fetch("/api/admin/qr-campaigns", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name: newName.trim() }),
      });

      if (res.ok) {
        toast({ title: "Campaign Renamed! ✏️", description: `Updated name to "${newName.trim()}". QR code remains unchanged.` });
        fetchSavedCampaigns();
      } else {
        toast({ title: "Failed to rename campaign", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error renaming campaign", variant: "destructive" });
    }
  };

  const handleDeleteCampaign = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}" and all associated scan/funnel data from database?`)) return;
    try {
      const res = await fetch(`/api/admin/qr-campaigns?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast({ title: "Campaign & Scan Data Deleted", description: `Removed "${name}" and cleared scan metrics.` });
        fetchSavedCampaigns();
      }
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  const handleClearAllTestCampaigns = async () => {
    if (!confirm("CAUTION: This will delete ALL test QR campaigns and clear ALL scan/funnel events from the database. Proceed?")) return;
    try {
      const res = await fetch("/api/admin/qr-campaigns?clearAll=true", { method: "DELETE" });
      if (res.ok) {
        toast({ title: "Database Cleared! 🧹", description: "Wiped all test campaigns and funnel scan events." });
        fetchSavedCampaigns();
      }
    } catch {
      toast({ title: "Failed to clear test data", variant: "destructive" });
    }
  };

  const handleDownloadPng = () => {
    if (!svgRef.current) return;

    const svgElement = svgRef.current;
    const svgString = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    canvas.width = 1200;
    canvas.height = 1200;

    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const pngUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `HUME-QR-${city.toUpperCase()}-${targetType.toUpperCase()}-${bodyType}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const handleDownloadSvg = () => {
    if (!svgRef.current) return;
    const svgElement = svgRef.current;
    const svgString = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = `HUME-QR-${city.toUpperCase()}-${targetType.toUpperCase()}-${bodyType}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 text-white max-w-7xl mx-auto">
      {/* Studio Header */}
      <div className="flex flex-col gap-2 border-b border-white/10 pb-6">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
          <QrCode className="h-4 w-4" />
          <span>Brand QR Generator Studio</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-white">
          Custom Star QR Code Designer & Campaign Register
        </h1>
        <p className="text-sm text-stone-400">
          Design high-resolution custom vector QR codes, register them in your database, and track exact real-life pamphlet scans.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Controls Column (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Campaign Batch Name */}
          <div className="rounded-2xl border border-stone-800 bg-stone-900/80 p-5 space-y-3 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
              <Type className="h-4 w-4" />
              <span>Campaign Batch / Pamphlet Name</span>
            </div>
            <input
              type="text"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="e.g. Ahmedabad Blinkit Flyer Batch 1"
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white placeholder-stone-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Section 1: Campaign Target Link */}
          <div className="rounded-2xl border border-stone-800 bg-stone-900/80 p-5 space-y-4 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
              <MapPin className="h-4 w-4" />
              <span>1. Target Campaign Destination</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-stone-300 block mb-1">Select City</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
                >
                  {CITIES.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-stone-300 block mb-1">Destination Page Path or Custom URL</label>
                <input
                  type="text"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="e.g. /diwali-gifts, /offers/50-off, /perfumes, /discovery-set"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-stone-600 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Active URL Copy Box */}
            <div className="flex items-center justify-between gap-3 bg-stone-950 border border-stone-800 rounded-xl p-3">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-semibold uppercase text-stone-500 block">Encoded Destination URL</span>
                <p className="text-xs font-mono text-stone-300 truncate">{activeUrl}</p>
              </div>
              <button
                type="button"
                onClick={handleCopyUrl}
                className="inline-flex items-center gap-1 text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-white px-3 py-1.5 rounded-lg transition-colors shrink-0"
              >
                {copiedUrl ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedUrl ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>

          {/* Section 2: Body Type Pattern Selector */}
          <div className="rounded-2xl border border-stone-800 bg-stone-900/80 p-5 space-y-3 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
              <Sparkles className="h-4 w-4" />
              <span>2. Body Module Pattern</span>
            </div>

            <div className="grid grid-cols-5 gap-3">
              <button
                type="button"
                onClick={() => setBodyType("stars")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                  bodyType === "stars"
                    ? "border-amber-500 bg-amber-500/10 text-white ring-2 ring-amber-500/40"
                    : "border-stone-800 bg-stone-950 text-stone-400 hover:border-stone-700"
                }`}
              >
                <span className="text-xl">★</span>
                <span className="text-[10px] font-bold mt-1">Stars</span>
              </button>

              <button
                type="button"
                onClick={() => setBodyType("squares")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                  bodyType === "squares"
                    ? "border-amber-500 bg-amber-500/10 text-white ring-2 ring-amber-500/40"
                    : "border-stone-800 bg-stone-950 text-stone-400 hover:border-stone-700"
                }`}
              >
                <span className="text-xl">■</span>
                <span className="text-[10px] font-bold mt-1">Squares</span>
              </button>

              <button
                type="button"
                onClick={() => setBodyType("dots")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                  bodyType === "dots"
                    ? "border-amber-500 bg-amber-500/10 text-white ring-2 ring-amber-500/40"
                    : "border-stone-800 bg-stone-950 text-stone-400 hover:border-stone-700"
                }`}
              >
                <span className="text-xl">●</span>
                <span className="text-[10px] font-bold mt-1">Dots</span>
              </button>

              <button
                type="button"
                onClick={() => setBodyType("diamonds")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                  bodyType === "diamonds"
                    ? "border-amber-500 bg-amber-500/10 text-white ring-2 ring-amber-500/40"
                    : "border-stone-800 bg-stone-950 text-stone-400 hover:border-stone-700"
                }`}
              >
                <span className="text-xl">◆</span>
                <span className="text-[10px] font-bold mt-1">Diamonds</span>
              </button>

              <button
                type="button"
                onClick={() => setBodyType("hearts")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                  bodyType === "hearts"
                    ? "border-amber-500 bg-amber-500/10 text-white ring-2 ring-amber-500/40"
                    : "border-stone-800 bg-stone-950 text-stone-400 hover:border-stone-700"
                }`}
              >
                <span className="text-xl">♥</span>
                <span className="text-[10px] font-bold mt-1">Hearts</span>
              </button>
            </div>
          </div>

          {/* Section 3: Corner Eye / Edges Style */}
          <div className="rounded-2xl border border-stone-800 bg-stone-900/80 p-5 space-y-3 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
              <Sliders className="h-4 w-4" />
              <span>3. Corner Eyes / Edges</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setEyeStyle("rounded")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                  eyeStyle === "rounded"
                    ? "border-amber-500 bg-amber-500/10 text-white ring-2 ring-amber-500/40"
                    : "border-stone-800 bg-stone-950 text-stone-400 hover:border-stone-700"
                }`}
              >
                <span className="text-xl">🔲</span>
                <span className="text-[10px] font-bold mt-1">Rounded Square</span>
              </button>

              <button
                type="button"
                onClick={() => setEyeStyle("square")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                  eyeStyle === "square"
                    ? "border-amber-500 bg-amber-500/10 text-white ring-2 ring-amber-500/40"
                    : "border-stone-800 bg-stone-950 text-stone-400 hover:border-stone-700"
                }`}
              >
                <span className="text-xl">⬛</span>
                <span className="text-[10px] font-bold mt-1">Sharp Square</span>
              </button>

              <button
                type="button"
                onClick={() => setEyeStyle("circle")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                  eyeStyle === "circle"
                    ? "border-amber-500 bg-amber-500/10 text-white ring-2 ring-amber-500/40"
                    : "border-stone-800 bg-stone-950 text-stone-400 hover:border-stone-700"
                }`}
              >
                <span className="text-xl">⭕</span>
                <span className="text-[10px] font-bold mt-1">Concentric Circle</span>
              </button>
            </div>
          </div>

          {/* Section 4: Logo & Emblem Customization */}
          <div className="rounded-2xl border border-stone-800 bg-stone-900/80 p-5 space-y-4 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
              <Type className="h-4 w-4" />
              <span>4. Center Emblem & Logo</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setLogoType("hf-cursive")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                  logoType === "hf-cursive"
                    ? "border-amber-500 bg-amber-500/10 text-white ring-2 ring-amber-500/40"
                    : "border-stone-800 bg-stone-950 text-stone-400 hover:border-stone-700"
                }`}
              >
                <span className="font-serif italic text-lg text-amber-300">hf</span>
                <span className="text-[10px] font-bold mt-1">Cursive Signature</span>
              </button>

              <button
                type="button"
                onClick={() => setLogoType("custom-image")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                  logoType === "custom-image"
                    ? "border-amber-500 bg-amber-500/10 text-white ring-2 ring-amber-500/40"
                    : "border-stone-800 bg-stone-950 text-stone-400 hover:border-stone-700"
                }`}
              >
                <ImageIcon className="h-5 w-5 text-amber-400" />
                <span className="text-[10px] font-bold mt-1">Upload Custom Image</span>
              </button>

              <button
                type="button"
                onClick={() => setLogoType("none")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                  logoType === "none"
                    ? "border-amber-500 bg-amber-500/10 text-white ring-2 ring-amber-500/40"
                    : "border-stone-800 bg-stone-950 text-stone-400 hover:border-stone-700"
                }`}
              >
                <span className="text-base text-stone-500">🚫</span>
                <span className="text-[10px] font-bold mt-1">No Emblem</span>
              </button>
            </div>

            {logoType === "custom-image" && (
              <div className="space-y-2 pt-2 border-t border-stone-800">
                <label className="text-xs font-semibold text-stone-300 block">Upload Logo PNG/JPG</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="block w-full text-xs text-stone-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-stone-800 file:text-white hover:file:bg-stone-700"
                />
              </div>
            )}

            {logoType !== "none" && (
              <div className="space-y-1 pt-2">
                <div className="flex justify-between text-xs text-stone-400 font-semibold">
                  <span>Emblem Scale Size</span>
                  <span>{Math.round(logoScale * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="0.28"
                  step="0.01"
                  value={logoScale}
                  onChange={(e) => setLogoScale(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>

        {/* Live Vector Preview Column (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-stone-800 bg-stone-900/90 p-6 backdrop-blur-xl flex flex-col items-center justify-center space-y-6">
            <div className="flex items-center justify-between w-full border-b border-stone-800 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Live Vector Canvas</span>
              <span className="text-[10px] font-mono bg-stone-950 border border-stone-800 px-2.5 py-1 rounded-md text-stone-300">
                Error Correction: HIGH (30%)
              </span>
            </div>

            {/* Rendered SVG Preview */}
            <div className="p-4 bg-white rounded-2xl shadow-2xl border border-stone-800 flex items-center justify-center">
              <svg
                ref={svgRef}
                viewBox={`0 0 ${svgData.viewSize} ${svgData.viewSize}`}
                className="w-full max-w-[340px] aspect-square"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="0" y="0" width={svgData.viewSize} height={svgData.viewSize} fill="#FFFFFF" rx="16" />

                {/* Finder Pattern Eyes */}
                {svgData.eyes.map((eye, idx) => {
                  const x = svgData.padding + eye.c * svgData.cellSize;
                  const y = svgData.padding + eye.r * svgData.cellSize;
                  const eyeSize = 7 * svgData.cellSize;

                  let outerRx = 0;
                  let innerRx = 0;
                  let pupilRx = 0;

                  if (eyeStyle === "rounded") {
                    outerRx = eyeSize * 0.28;
                    innerRx = (eyeSize - 2 * svgData.cellSize) * 0.22;
                    pupilRx = (eyeSize - 4 * svgData.cellSize) * 0.26;
                  } else if (eyeStyle === "circle") {
                    outerRx = eyeSize / 2;
                    innerRx = (eyeSize - 2 * svgData.cellSize) / 2;
                    pupilRx = (eyeSize - 4 * svgData.cellSize) / 2;
                  }

                  return (
                    <g key={idx}>
                      <rect x={x} y={y} width={eyeSize} height={eyeSize} rx={outerRx} ry={outerRx} fill="#000000" />
                      <rect
                        x={x + svgData.cellSize}
                        y={y + svgData.cellSize}
                        width={eyeSize - 2 * svgData.cellSize}
                        height={eyeSize - 2 * svgData.cellSize}
                        rx={innerRx}
                        ry={innerRx}
                        fill="#FFFFFF"
                      />
                      <rect
                        x={x + 2 * svgData.cellSize}
                        y={y + 2 * svgData.cellSize}
                        width={eyeSize - 4 * svgData.cellSize}
                        height={eyeSize - 4 * svgData.cellSize}
                        rx={pupilRx}
                        ry={pupilRx}
                        fill="#000000"
                      />
                    </g>
                  );
                })}

                {/* Render Body Modules */}
                {bodyType === "dots" ? (
                  svgData.circles.map((c, idx) => <circle key={idx} cx={c.cx} cy={c.cy} r={c.r} fill="#000000" />)
                ) : bodyType === "squares" ? (
                  svgData.rects.map((r, idx) => (
                    <rect key={idx} x={r.x} y={r.y} width={r.width} height={r.height} fill="#000000" />
                  ))
                ) : (
                  <path d={svgData.paths.join(" ")} fill="#000000" />
                )}

                {/* Center Mask & Logo Overlay */}
                {logoType !== "none" && (
                  <>
                    <circle cx={svgData.centerCx} cy={svgData.centerCy} r={svgData.centerRadius} fill="#FFFFFF" />

                    {logoType === "hf-cursive" && (
                      <image
                        href={HUME_HF_LOGO_BASE64}
                        x={svgData.centerCx - svgData.centerRadius * 0.88}
                        y={svgData.centerCy - svgData.centerRadius * 0.88}
                        width={svgData.centerRadius * 1.76}
                        height={svgData.centerRadius * 1.76}
                        preserveAspectRatio="xMidYMid meet"
                      />
                    )}

                    {logoType === "custom-image" && customLogoUrl && (
                      <image
                        href={customLogoUrl}
                        x={svgData.centerCx - svgData.centerRadius * 0.75}
                        y={svgData.centerCy - svgData.centerRadius * 0.75}
                        width={svgData.centerRadius * 1.5}
                        height={svgData.centerRadius * 1.5}
                        preserveAspectRatio="xMidYMid meet"
                      />
                    )}
                  </>
                )}
              </svg>
            </div>

            {/* Action Buttons: Save & Register Campaign + Downloads */}
            <div className="flex flex-col gap-3 w-full">
              <Button
                onClick={handleSaveCampaign}
                disabled={saving}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-extrabold gap-2 py-3.5 shadow-lg"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? "Registering Campaign..." : "Save & Register QR Campaign"}</span>
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={handleDownloadPng}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs gap-1.5 py-2.5"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download PNG</span>
                </Button>

                <Button
                  onClick={handleDownloadSvg}
                  variant="outline"
                  className="w-full border-stone-800 bg-stone-950 text-white hover:bg-stone-800 font-bold text-xs gap-1.5 py-2.5"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download SVG</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registered Saved QR Campaigns & Real-Time Scan Tracker Table */}
      <div className="rounded-2xl border border-stone-800 bg-stone-900/80 p-6 backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <QrCode className="h-5 w-5 text-amber-400" />
              <span>Registered Active QR Campaigns & Pamphlet Scans</span>
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Every printed flyer QR code saved here tracks individual scan counts and timestamps in real-life.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAllTestCampaigns}
              className="border-red-900/50 bg-red-950/40 text-red-300 hover:bg-red-900 hover:text-white text-xs gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Wipe Test DB</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchSavedCampaigns}
              className="border-stone-800 bg-stone-950 text-stone-300 hover:text-white"
            >
              Refresh List
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-800 text-stone-400 font-semibold uppercase tracking-wider">
                <th className="pb-3">Campaign Name</th>
                <th className="pb-3">City</th>
                <th className="pb-3 text-right">Real-Time Scans</th>
                <th className="pb-3 text-right">Last Scanned</th>
                <th className="pb-3 text-right">Created Date</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {loadingCampaigns ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-stone-400">Loading registered QR campaigns...</td>
                </tr>
              ) : savedCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-stone-400">
                    No registered QR codes yet. Design a QR code above and click &quot;Save & Register QR Campaign&quot;.
                  </td>
                </tr>
              ) : (
                savedCampaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-stone-800/40 cursor-pointer group">
                    <td className="py-3 font-bold text-white" onClick={() => setSelectedCampaignDetails(c)}>
                      <div>
                        <p className="group-hover:text-amber-400 transition-colors flex items-center gap-1.5">
                          <span>{c.name}</span>
                          <span className="text-[10px] text-stone-500 font-normal underline">Tap details</span>
                        </p>
                        <p className="text-[10px] font-mono text-stone-500">{c.id}</p>
                      </div>
                    </td>
                    <td className="py-3 font-semibold text-amber-400 capitalize" onClick={() => setSelectedCampaignDetails(c)}>{c.city}</td>
                    <td className="py-3 text-right font-mono font-extrabold text-emerald-400 text-sm" onClick={() => setSelectedCampaignDetails(c)}>
                      <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                        <Eye className="h-3 w-3 text-emerald-400" />
                        <span>{c.scanCount} scans</span>
                      </div>
                    </td>
                    <td className="py-3 text-right font-mono text-stone-400" onClick={() => setSelectedCampaignDetails(c)}>
                      {c.lastScannedAt ? new Date(c.lastScannedAt).toLocaleString() : "Not scanned yet"}
                    </td>
                    <td className="py-3 text-right font-mono text-stone-400" onClick={() => setSelectedCampaignDetails(c)}>
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedCampaignDetails(c)}
                          className="p-1.5 rounded-lg bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700 flex items-center gap-1 px-2.5 text-[11px] font-semibold"
                          title="Inspect Details & Destination URL"
                        >
                          <Eye className="h-3.5 w-3.5 text-amber-400" />
                          <span>Details</span>
                        </button>
                        <a
                          href={c.targetUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700"
                          title="Open Campaign Target URL"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleRenameCampaign(c.id, c.name)}
                          className="p-1.5 rounded-lg bg-stone-800 text-amber-400 hover:text-amber-300 hover:bg-stone-700"
                          title="Rename Campaign"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCampaign(c.id, c.name)}
                          className="p-1.5 rounded-lg bg-stone-800 text-red-400 hover:text-red-300 hover:bg-stone-700"
                          title="Delete Campaign & Clear Scan Data"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CAMPAIGN DETAILS INSPECTOR MODAL */}
      {selectedCampaignDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-stone-950 border border-stone-800 rounded-2xl p-6 shadow-2xl space-y-6 text-white">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-stone-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                    {selectedCampaignDetails.city.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-1.5">
                  <h2 className="text-xl font-bold text-white font-serif">{selectedCampaignDetails.name}</h2>
                  <button
                    type="button"
                    onClick={() => {
                      const oldId = selectedCampaignDetails.id;
                      const oldName = selectedCampaignDetails.name;
                      handleRenameCampaign(oldId, oldName).then(() => {
                        fetchSavedCampaigns();
                      });
                    }}
                    className="p-1.5 rounded-lg bg-stone-900 border border-stone-800 text-amber-400 hover:text-amber-300 hover:bg-stone-800"
                    title="Rename Campaign"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="text-[11px] font-mono text-stone-400 mt-1">ID: {selectedCampaignDetails.id}</p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCampaignDetails(null)}
                className="rounded-lg p-2 text-stone-400 hover:bg-stone-900 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body: QR Code Vector Preview & Destination URL Details */}
            <div className="grid gap-6 md:grid-cols-12 items-center">
              {/* QR Vector Preview */}
              <div className="md:col-span-5 bg-white p-4 rounded-xl shadow-inner border border-stone-800 flex items-center justify-center">
                {selectedCampaignDetails.qrCodeSvg ? (
                  <div
                    className="w-48 h-48 [&>svg]:w-full [&>svg]:h-full"
                    dangerouslySetInnerHTML={{ __html: selectedCampaignDetails.qrCodeSvg }}
                  />
                ) : (
                  <CustomStarQRCode value={selectedCampaignDetails.targetUrl} size={190} />
                )}
              </div>

              {/* Destination URL & Metadata */}
              <div className="md:col-span-7 space-y-4">
                <div className="rounded-xl border border-stone-800 bg-stone-900 p-4 space-y-2">
                  <span className="text-[11px] text-stone-400 font-bold uppercase tracking-wider block">
                    Exact Redirect Destination URL
                  </span>
                  <div className="p-2.5 bg-stone-950 rounded-lg border border-stone-800/80 font-mono text-xs text-amber-300 break-all select-all">
                    {selectedCampaignDetails.targetUrl}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button
                      onClick={() => handleCopyDetailsUrl(selectedCampaignDetails.targetUrl)}
                      variant="outline"
                      className="flex-1 border-stone-800 bg-stone-950 text-stone-300 hover:text-white text-xs gap-1.5"
                    >
                      {copiedDetailsUrl ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedDetailsUrl ? "Copied!" : "Copy Redirect URL"}</span>
                    </Button>
                    <a
                      href={selectedCampaignDetails.targetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 rounded-lg bg-stone-800 text-stone-200 hover:text-white hover:bg-stone-700 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Test Redirect</span>
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl border border-stone-800 bg-stone-900 p-3">
                    <span className="text-stone-400 block text-[10px] uppercase font-semibold">Real-Time Scans</span>
                    <span className="text-lg font-bold text-emerald-400 font-mono mt-0.5 block">
                      {selectedCampaignDetails.scanCount} scans
                    </span>
                  </div>
                  <div className="rounded-xl border border-stone-800 bg-stone-900 p-3">
                    <span className="text-stone-400 block text-[10px] uppercase font-semibold">Last Scanned</span>
                    <span className="text-xs font-mono text-white mt-1 block">
                      {selectedCampaignDetails.lastScannedAt
                        ? new Date(selectedCampaignDetails.lastScannedAt).toLocaleString()
                        : "Not scanned yet"}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => handleDownloadSavedPng(selectedCampaignDetails)}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold gap-2 text-xs py-2"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download HD Print PNG</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
