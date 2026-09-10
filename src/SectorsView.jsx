import React, { useState, useMemo, useEffect } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import {
  Landmark,
  Building2,
  Building,
  Flame,
  Cpu,
  ShoppingBag,
  Car,
  HeartPulse,
  Radio,
  Layers,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  AlertTriangle,
  Search,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  X,
  ExternalLink,
  Zap,
  CheckCircle2,
  Grid3X3,
  LayoutGrid,
  BarChart3,
  RefreshCw,
  Info,
  ShieldCheck,
} from "lucide-react";
import { enrichStock } from "./stockDataEnricher";
import StockDrawer from "./StockDrawer";

// Sector visual mapping and metadata
const SECTOR_CONFIG = {
  "Banking & Financials": {
    shortName: "Banking",
    icon: Landmark,
    color: "#3b82f6",
    accentBg: "rgba(59, 130, 246, 0.12)",
    accentBorder: "rgba(59, 130, 246, 0.3)",
    desc: "Private & PSU banks, NBFCs, and financial exchanges",
  },
  "Industrials & Infra": {
    shortName: "Industrials",
    icon: Building,
    color: "#f59e0b",
    accentBg: "rgba(245, 158, 11, 0.12)",
    accentBorder: "rgba(245, 158, 11, 0.3)",
    desc: "Capital goods, defense electronics, and infrastructure",
  },
  "Energy & Utilities": {
    shortName: "Energy",
    icon: Flame,
    color: "#f97316",
    accentBg: "rgba(249, 115, 22, 0.12)",
    accentBorder: "rgba(249, 115, 22, 0.3)",
    desc: "Oil, gas, thermal, wind, and solar power generation",
  },
  "Information Tech": {
    shortName: "IT / Tech",
    icon: Cpu,
    color: "#06b6d4",
    accentBg: "rgba(6, 182, 212, 0.12)",
    accentBorder: "rgba(6, 182, 212, 0.3)",
    desc: "IT software, digital services, and electronics EMS",
  },
  "FMCG & Consumer": {
    shortName: "FMCG",
    icon: ShoppingBag,
    color: "#10b981",
    accentBg: "rgba(16, 185, 129, 0.12)",
    accentBorder: "rgba(16, 185, 129, 0.3)",
    desc: "Staples, quick commerce, food delivery, and retail chains",
  },
  "Automotive & EV": {
    shortName: "Auto",
    icon: Car,
    color: "#8b5cf6",
    accentBg: "rgba(139, 92, 246, 0.12)",
    accentBorder: "rgba(139, 92, 246, 0.3)",
    desc: "Passenger cars, commercial vehicles, and auto ancillaries",
  },
  "Healthcare & Pharma": {
    shortName: "Pharma",
    icon: HeartPulse,
    color: "#ec4899",
    accentBg: "rgba(236, 72, 153, 0.12)",
    accentBorder: "rgba(236, 72, 153, 0.3)",
    desc: "Active pharma ingredients, biotech, and diagnostics",
  },
  "Telecom & Media": {
    shortName: "Telecom",
    icon: Radio,
    color: "#0ea5e9",
    accentBg: "rgba(14, 165, 233, 0.12)",
    accentBorder: "rgba(14, 165, 233, 0.3)",
    desc: "Telecommunications network, broadband, and digital gaming",
  },
  "Metals & Mining": {
    shortName: "Metals",
    icon: Layers,
    color: "#a855f7",
    accentBg: "rgba(168, 85, 247, 0.12)",
    accentBorder: "rgba(168, 85, 247, 0.3)",
    desc: "Primary steel, aluminum, copper, and coal extraction",
  },
  "Real Estate & Construction": {
    shortName: "Realty",
    icon: Building2,
    color: "#eab308",
    accentBg: "rgba(234, 179, 8, 0.12)",
    accentBorder: "rgba(234, 179, 8, 0.3)",
    desc: "Commercial developers, residential realtors, and cement",
  },
  "Exchange Traded Funds": {
    shortName: "ETFs",
    icon: Activity,
    color: "#64748b",
    accentBg: "rgba(100, 116, 139, 0.12)",
    accentBorder: "rgba(100, 116, 139, 0.3)",
    desc: "Nifty, Gold, and Silver passive exchange traded products",
  },
};

const DEFAULT_CONFIG = {
  icon: Landmark,
  color: "#3b82f6",
  accentBg: "rgba(59, 130, 246, 0.12)",
  accentBorder: "rgba(59, 130, 246, 0.3)",
  desc: "Diversified industrial and commercial sectors",
};

// Fallback universe for offline / development resilience
const FALLBACK_RAW_STOCKS = [
  { symbol: "HDFCBANK", name: "HDFC BANK LTD", exchange: "NSE", isin: "INE040A01034", amount_financed: 389617.23, mcap_lakhs: 109456086, ffmc_lakhs: 108525709.27, leverage_pct: 0.36, ff_leverage_pct: 0.36, change_30d_pct: 43.26, adv: 30831531, days_to_cover: 1.6, is_etf: false, chg: { NSE: { "1": -1.42, "7": 2.68, "30": 43.26, "365": 102.4 } } },
  { symbol: "BSE", name: "BSE LIMITED", exchange: "NSE", isin: "INE118H01025", amount_financed: 335321.38, mcap_lakhs: 13485055.47, ffmc_lakhs: 13471570.41, leverage_pct: 2.49, ff_leverage_pct: 2.49, change_30d_pct: 82.4, adv: 3784868, days_to_cover: 2.5, is_etf: false, chg: { NSE: { "1": 2.85, "7": 8.4, "30": 82.4, "365": 164.2 } } },
  { symbol: "RELIANCE", name: "RELIANCE INDUSTRIES LTD", exchange: "NSE", isin: "INE002A01018", amount_financed: 222077.7, mcap_lakhs: 177776961, ffmc_lakhs: 88497371.19, leverage_pct: 0.12, ff_leverage_pct: 0.25, change_30d_pct: -3.58, adv: 12171016, days_to_cover: 1.4, is_etf: false, chg: { NSE: { "1": 0.49, "7": 0.62, "30": 11.36, "365": 99.1 } } },
  { symbol: "JIOFIN", name: "JIO FIN SERVICES LTD", exchange: "NSE", isin: "INE758E01017", amount_financed: 175936.98, mcap_lakhs: 15801318, ffmc_lakhs: 7829553.07, leverage_pct: 1.11, ff_leverage_pct: 2.25, change_30d_pct: 47.42, adv: 18752901, days_to_cover: 3.6, is_etf: false, chg: { NSE: { "1": 1.15, "7": 3.4, "30": 47.42, "365": 84.1 } } },
  { symbol: "ITC", name: "ITC LTD", exchange: "NSE", isin: "INE154A01025", amount_financed: 131014.19, mcap_lakhs: 33015976, ffmc_lakhs: 25329856.79, leverage_pct: 0.4, ff_leverage_pct: 0.52, change_30d_pct: 16.56, adv: 16103057, days_to_cover: 2.6, is_etf: false, chg: { NSE: { "1": -0.16, "7": 2.88, "30": 11.76, "365": 121.57 } } },
  { symbol: "BEL", name: "BHARAT ELECTRONICS LTD", exchange: "NSE", isin: "INE263A01024", amount_financed: 130005.69, mcap_lakhs: 30072430, ffmc_lakhs: 14693389.3, leverage_pct: 0.43, ff_leverage_pct: 0.88, change_30d_pct: -21.03, adv: 11910451, days_to_cover: 2.6, is_etf: false, chg: { NSE: { "1": 0.2, "7": 4.82, "30": 9.4, "365": 103.11 } } },
  { symbol: "INFY", name: "INFOSYS LIMITED", exchange: "NSE", isin: "INE009A01021", amount_financed: 111428.52, mcap_lakhs: 46336898, ffmc_lakhs: 39947039.77, leverage_pct: 0.24, ff_leverage_pct: 0.28, change_30d_pct: -21.43, adv: 12043730, days_to_cover: 0.8, is_etf: false, chg: { NSE: { "1": -1.12, "7": -0.26, "30": 4.14, "365": 107.89 } } },
  { symbol: "NAZARA", name: "NAZARA TECHNOLOGIES LTD", exchange: "NSE", isin: "INE418L01047", amount_financed: 110157.27, mcap_lakhs: 1354791, ffmc_lakhs: 829674.01, leverage_pct: 8.13, ff_leverage_pct: 13.28, change_30d_pct: -1.43, adv: 2874749, days_to_cover: 13.2, is_etf: false, chg: { NSE: { "1": 0.18, "7": 1.99, "30": 21.04, "365": 110.38 } } },
  { symbol: "SUZLON", name: "SUZLON ENERGY LIMITED", exchange: "NSE", isin: "INE040H01021", amount_financed: 106840.28, mcap_lakhs: 6343588, ffmc_lakhs: 5598850.77, leverage_pct: 1.68, ff_leverage_pct: 1.91, change_30d_pct: 7.26, adv: 60550580, days_to_cover: 3.3, is_etf: false, chg: { NSE: { "1": 1.45, "7": 5.12, "30": 28.5, "365": 140.2 } } },
  { symbol: "TCS", name: "TATA CONSULTANCY SERV LT", exchange: "NSE", isin: "INE467B01029", amount_financed: 101879.4, mcap_lakhs: 84458826, ffmc_lakhs: 23766713.64, leverage_pct: 0.12, ff_leverage_pct: 0.43, change_30d_pct: 8.41, adv: 3914000, days_to_cover: 1.0, is_etf: false, chg: { NSE: { "1": -0.84, "7": 0.15, "30": 8.41, "365": 92.5 } } },
  { symbol: "ADANIPOWER", name: "ADANI POWER LTD", exchange: "NSE", isin: "INE814H01029", amount_financed: 99918.73, mcap_lakhs: 40121807, ffmc_lakhs: 8610139.78, leverage_pct: 0.25, ff_leverage_pct: 1.16, change_30d_pct: 3.63, adv: 27337524, days_to_cover: 1.8, is_etf: false, chg: { NSE: { "1": 0.35, "7": 1.25, "30": 3.63, "365": 78.4 } } },
  { symbol: "SBIN", name: "STATE BANK OF INDIA", exchange: "NSE", isin: "INE062A01020", amount_financed: 96459.86, mcap_lakhs: 94572292, ffmc_lakhs: 42226528.38, leverage_pct: 0.1, ff_leverage_pct: 0.23, change_30d_pct: 32.32, adv: 10474770, days_to_cover: 0.9, is_etf: false, chg: { NSE: { "1": -0.32, "7": 1.1, "30": 32.32, "365": 115.4 } } },
  { symbol: "HINDCOPPER", name: "HINDUSTAN COPPER LTD", exchange: "NSE", isin: "INE531E01026", amount_financed: 92802.45, mcap_lakhs: 5032877, ffmc_lakhs: 1703125.58, leverage_pct: 1.84, ff_leverage_pct: 5.45, change_30d_pct: 65.36, adv: 12084860, days_to_cover: 1.5, is_etf: false, chg: { NSE: { "1": 0.72, "7": 2.42, "30": 23.34, "365": 91.5 } } },
  { symbol: "SILVERBEES", name: "NIPPONAMC - NETFSILVER", exchange: "NSE", isin: "INF204KC1402", amount_financed: 86223.12, mcap_lakhs: 2948504.37, ffmc_lakhs: null, leverage_pct: null, ff_leverage_pct: null, change_30d_pct: -21.67, adv: 24031262, days_to_cover: 1.5, is_etf: true, chg: { NSE: { "1": -0.43, "7": 0.27, "30": 6.6, "365": 191.49 } } },
];

// Exact Indian Currency Formatter (Cr to 2 decimal places)
function formatExactCr(crVal, decimals = 2) {
  if (crVal == null || isNaN(crVal)) return "₹0.00 Cr";
  const num = Number(crVal);
  const isNeg = num < 0;
  const absNum = Math.abs(num);
  return `${isNeg ? "-" : ""}₹${absNum.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })} Cr`;
}

// Squarified 2D Treemap layout calculator
function computeSquarifiedLayout(items, x = 0, y = 0, w = 100, h = 100) {
  if (!items || items.length === 0) return [];
  if (items.length === 1) {
    return [{ ...items[0], x, y, w, h }];
  }

  const totalWeight = items.reduce((sum, it) => sum + (it.weight || 0), 0);
  if (totalWeight <= 0) {
    return items.map((it, idx) => ({
      ...it,
      x: x + (idx * w) / items.length,
      y,
      w: w / items.length,
      h,
    }));
  }

  const sorted = [...items].sort((a, b) => (b.weight || 0) - (a.weight || 0));
  const result = [];

  function layout(list, curX, curY, curW, curH) {
    if (list.length === 0) return;
    if (list.length === 1) {
      result.push({ ...list[0], x: curX, y: curY, w: curW, h: curH });
      return;
    }

    const curTotal = list.reduce((s, it) => s + (it.weight || 0), 0);
    const isHorizontal = curW >= curH;

    let bestSplit = 1;
    let minAspectDiff = Infinity;
    let runningSum = 0;

    for (let i = 0; i < list.length - 1; i++) {
      runningSum += list[i].weight || 0;
      const ratio = runningSum / curTotal;
      const primaryDim = isHorizontal ? curW * ratio : curH * ratio;
      const otherDim = isHorizontal ? curH : curW;
      const firstWeightRatio = (list[0].weight || 0) / runningSum;
      const firstOther = otherDim * firstWeightRatio;
      const aspect = Math.max(primaryDim / firstOther, firstOther / primaryDim);

      if (aspect < minAspectDiff) {
        minAspectDiff = aspect;
        bestSplit = i + 1;
      }
    }

    const group1 = list.slice(0, bestSplit);
    const group2 = list.slice(bestSplit);
    const sum1 = group1.reduce((s, it) => s + (it.weight || 0), 0);
    const ratio1 = sum1 / curTotal;

    if (isHorizontal) {
      const splitW = curW * ratio1;
      let offY = curY;
      group1.forEach((it) => {
        const itemH = curH * ((it.weight || 0) / sum1);
        result.push({ ...it, x: curX, y: offY, w: splitW, h: itemH });
        offY += itemH;
      });
      layout(group2, curX + splitW, curY, curW - splitW, curH);
    } else {
      const splitH = curH * ratio1;
      let offX = curX;
      group1.forEach((it) => {
        const itemW = curW * ((it.weight || 0) / sum1);
        result.push({ ...it, x: offX, y: curY, w: itemW, h: splitH });
        offX += itemW;
      });
      layout(group2, curX, curY + splitH, curW, curH - splitH);
    }
  }

  layout(sorted, x, y, w, h);
  return result;
}

export default function SectorsView({ onBack }) {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [isLight, setIsLight] = useState(
    typeof document !== "undefined" && document.documentElement.dataset.theme === "light"
  );

  useEffect(() => {
    const updateTheme = () => {
      setIsLight(document.documentElement.dataset.theme === "light");
    };
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  // Interactive controls & filters
  const [timeHorizon, setTimeHorizon] = useState("1D"); // "1D" | "1W" | "1M" | "YTD"
  const [capTier, setCapTier] = useState("ALL"); // "ALL" | "Large-Cap" | "Mid-Cap" | "Small-Cap"
  const [viewMode, setViewMode] = useState("treemap"); // "treemap" | "quadrant"
  const [colorMetric, setColorMetric] = useState("pctChange"); // "pctChange" | "freeFloat"
  const [searchQuery, setSearchQuery] = useState("");

  // Table sorting
  const [sortCol, setSortCol] = useState("bookCr");
  const [sortDesc, setSortDesc] = useState(true);

  // Drill-down drawers
  const [selectedSector, setSelectedSector] = useState(null);
  const [deepDiveStock, setDeepDiveStock] = useState(null);

  // Fetch universe
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://mtf.trading/compressed_data/screener_data.json");
      if (!res.ok) throw new Error("Failed to load screener data");
      const json = await res.json();
      if (json.all_stocks && json.all_stocks.length > 0) {
        const enriched = json.all_stocks.map(enrichStock);
        setStocks(enriched);
        setLastRefreshed(new Date());
      }
    } catch (err) {
      console.warn("Using offline fallback sector universe:", err);
      const enriched = FALLBACK_RAW_STOCKS.map(enrichStock);
      setStocks(enriched);
      setLastRefreshed(new Date());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter stocks by cap tier
  const filteredStocks = useMemo(() => {
    if (capTier === "ALL") return stocks;
    return stocks.filter((s) => s.capTier === capTier);
  }, [stocks, capTier]);

  // Aggregate stocks into sector objects
  const sectors = useMemo(() => {
    if (!filteredStocks || filteredStocks.length === 0) return [];

    const sectorMap = {};
    let totalMarketBook = 0;

    const clampPct = (val) => Math.max(-95, Math.min(250, Number(val) || 0));

    filteredStocks.forEach((stock) => {
      const sec = stock.sector || "Diversified";
      if (!sectorMap[sec]) {
        sectorMap[sec] = {
          name: sec,
          bookCr: 0,
          mcapCr: 0,
          ffmcCr: 0,
          stocks: [],
          weighted1D: 0,
          weighted1W: 0,
          weighted1M: 0,
          weightedYTD: 0,
        };
      }

      const book = (stock.amount_financed || 0) / 100;
      const mcap = (stock.mcap_lakhs || 0) / 100;
      const ffmc = (stock.ffmc_lakhs || (stock.mcap_lakhs ? stock.mcap_lakhs * 0.45 : 0)) / 100;

      const chg1 = clampPct(stock.chg?.NSE?.["1"] ?? stock.chg?.BSE?.["1"] ?? stock.dayMove ?? 0);
      const chg7 = clampPct(stock.chg?.NSE?.["7"] ?? stock.chg?.BSE?.["7"] ?? chg1 * 1.6);
      const chg30 = clampPct(stock.chg?.NSE?.["30"] ?? stock.chg?.BSE?.["30"] ?? stock.change_30d_pct ?? 0);
      const chg365 = clampPct(stock.chg?.NSE?.["365"] ?? stock.chg?.BSE?.["365"] ?? chg30 * 1.4);

      sectorMap[sec].bookCr += book;
      sectorMap[sec].mcapCr += mcap;
      sectorMap[sec].ffmcCr += ffmc;
      sectorMap[sec].weighted1D += chg1 * book;
      sectorMap[sec].weighted1W += chg7 * book;
      sectorMap[sec].weighted1M += chg30 * book;
      sectorMap[sec].weightedYTD += chg365 * book;
      sectorMap[sec].stocks.push(stock);
      totalMarketBook += book;
    });

    const result = Object.values(sectorMap).map((s) => {
      const change1D = s.bookCr > 0 ? Number((s.weighted1D / s.bookCr).toFixed(2)) : 0;
      const change1W = s.bookCr > 0 ? Number((s.weighted1W / s.bookCr).toFixed(2)) : 0;
      const change1M = s.bookCr > 0 ? Number((s.weighted1M / s.bookCr).toFixed(2)) : 0;
      const changeYTD = s.bookCr > 0 ? Number((s.weightedYTD / s.bookCr).toFixed(2)) : 0;
      const ffLevPct = s.ffmcCr > 0 ? Number(((s.bookCr / s.ffmcCr) * 100).toFixed(2)) : 0;
      const sharePct = totalMarketBook > 0 ? Number(((s.bookCr / totalMarketBook) * 100).toFixed(2)) : 0;

      // Sort stocks by financed book
      s.stocks.sort((a, b) => (b.amount_financed || 0) - (a.amount_financed || 0));
      const topStock = s.stocks[0] || null;

      // Selected momentum change
      let change = change1D;
      if (timeHorizon === "1W") change = change1W;
      else if (timeHorizon === "1M") change = change1M;
      else if (timeHorizon === "YTD") change = changeYTD;

      // Institutional Crowding & Unwinding Risk Classification
      let riskStatus = "Moderate";
      let riskTag = "MODERATE";
      let riskColor = "#38bdf8";

      if (ffLevPct >= 0.85 && change >= 1.0) {
        riskStatus = "Overheating Risk";
        riskTag = "HIGH SQUEEZE";
        riskColor = "#f59e0b";
      } else if (ffLevPct >= 0.70 && change <= -0.5) {
        riskStatus = "Unwinding Risk";
        riskTag = "LIQUIDATION";
        riskColor = "#ef4444";
      } else if (ffLevPct >= 0.80) {
        riskStatus = "Elevated Crowding";
        riskTag = "ELEVATED";
        riskColor = "#eab308";
      } else if (ffLevPct < 0.55) {
        riskStatus = "Safe / Low Leverage";
        riskTag = "HEALTHY";
        riskColor = "#10b981";
      }

      return {
        name: s.name,
        bookCr: Number(s.bookCr.toFixed(2)),
        mcapCr: Number(s.mcapCr.toFixed(2)),
        ffmcCr: Number(s.ffmcCr.toFixed(2)),
        sharePct,
        change1D,
        change1W,
        change1M,
        changeYTD,
        change,
        ffLevPct,
        stockCount: s.stocks.length,
        stocks: s.stocks,
        topStock,
        riskStatus,
        riskTag,
        riskColor,
        config: SECTOR_CONFIG[s.name] || DEFAULT_CONFIG,
      };
    });

    result.sort((a, b) => b.bookCr - a.bookCr);
    return result;
  }, [filteredStocks, timeHorizon]);

  // Overall market stats for KPIs
  const totalMarketMTF = useMemo(() => {
    return sectors.reduce((sum, s) => sum + s.bookCr, 0);
  }, [sectors]);

  const topLeveragedSector = useMemo(() => {
    if (sectors.length === 0) return null;
    return sectors.reduce((max, s) => (s.bookCr > max.bookCr ? s : max), sectors[0]);
  }, [sectors]);

  const topAccumulatingSector = useMemo(() => {
    if (sectors.length === 0) return null;
    return sectors.reduce((max, s) => (s.change > max.change ? s : max), sectors[0]);
  }, [sectors]);

  const fastestUnwindingSector = useMemo(() => {
    if (sectors.length === 0) return null;
    return sectors.reduce((min, s) => (s.change < min.change ? s : min), sectors[0]);
  }, [sectors]);

  const crowdingWarningIndex = useMemo(() => {
    if (sectors.length === 0) return { label: "LOW RISK", color: "#10b981", desc: "Healthy market buffer", elevatedCount: 0 };
    const elevated = sectors.filter((s) => s.ffLevPct >= 0.80);
    const unwinding = sectors.filter((s) => s.ffLevPct >= 0.70 && s.change <= -0.5);

    if (unwinding.length >= 2 || elevated.length >= 5) {
      return {
        label: "HIGH RISK",
        color: "#ef4444",
        desc: `${unwinding.length} sectors facing margin liquidation pressure`,
        elevatedCount: elevated.length,
      };
    }
    if (elevated.length >= 2 || unwinding.length >= 1) {
      return {
        label: "MODERATE RISK",
        color: "#f59e0b",
        desc: `${elevated.length} sectors with elevated free-float crowding`,
        elevatedCount: elevated.length,
      };
    }
    return {
      label: "LOW RISK",
      color: "#10b981",
      desc: "Orderly leverage distribution across industries",
      elevatedCount: elevated.length,
    };
  }, [sectors]);

  // Squarified Treemap layout items with damped proportional weighting
  const treemapTiles = useMemo(() => {
    if (sectors.length === 0) return [];
    // Apply power dampening (exponent 0.35) so sector hierarchy is preserved,
    // large sectors don't have massive empty voids, and smaller sectors (like ETFs)
    // are guaranteed ample height (>=100px) and width (>=31%) to display all metrics cleanly without clipping.
    const items = sectors.map((s) => ({
      ...s,
      weight: Math.pow(Math.max(10, s.bookCr), 0.35),
    }));
    return computeSquarifiedLayout(items, 0, 0, 100, 100);
  }, [sectors]);

  // Average free-float leverage for quadrant chart reference line
  const avgFfLev = useMemo(() => {
    if (sectors.length === 0) return 0.75;
    const totalFF = sectors.reduce((acc, s) => acc + s.ffmcCr, 0);
    const totalBk = sectors.reduce((acc, s) => acc + s.bookCr, 0);
    return totalFF > 0 ? Number(((totalBk / totalFF) * 100).toFixed(2)) : 0.75;
  }, [sectors]);

  // Filtered and sorted table sectors
  const displayedSectors = useMemo(() => {
    let list = [...sectors];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.topStock && s.topStock.symbol.toLowerCase().includes(q)) ||
          s.stocks.some((st) => st.symbol.toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => {
      let valA = a[sortCol];
      let valB = b[sortCol];
      if (sortCol === "name") {
        return sortDesc ? valB.localeCompare(valA) : valA.localeCompare(valB);
      }
      valA = Number(valA) || 0;
      valB = Number(valB) || 0;
      return sortDesc ? valB - valA : valA - valB;
    });

    return list;
  }, [sectors, searchQuery, sortCol, sortDesc]);

  const handleSort = (col) => {
    if (sortCol === col) {
      setSortDesc(!sortDesc);
    } else {
      setSortCol(col);
      setSortDesc(true);
    }
  };

  // Color generator for treemap tiles (Theme-Aware High Contrast)
  const getTileBgStyle = (sector) => {
    if (colorMetric === "pctChange") {
      const chg = sector.change;
      if (chg > 0.1) {
        if (isLight) {
          return {
            background: "linear-gradient(145deg, #f0fdf4, #dcfce7)",
            borderColor: "#86efac",
            glowColor: "rgba(16, 185, 129, 0.25)",
            textColor: "#064e3b",
            subColor: "#047857",
            badgeBg: "rgba(16, 185, 129, 0.15)",
            badgeText: "#065f46",
            pillBg: "#bbf7d0",
            pillText: "#15803d",
            pillBorder: "#86efac",
            footerBorder: "rgba(16, 185, 129, 0.25)",
          };
        }
        const intensity = Math.min(1, Math.max(0.15, chg / 2.5));
        return {
          background: `linear-gradient(145deg, rgba(6, 78, 59, ${0.45 * intensity + 0.35}), rgba(5, 46, 38, 0.95))`,
          borderColor: `rgba(16, 185, 129, ${0.4 + 0.4 * intensity})`,
          glowColor: "rgba(16, 185, 129, 0.2)",
          textColor: "#ffffff",
          subColor: "#cbd5e1",
          badgeBg: "rgba(0, 0, 0, 0.4)",
          badgeText: "#e2e8f0",
          pillBg: "rgba(16, 185, 129, 0.25)",
          pillText: "#6ee7b7",
          pillBorder: "rgba(16, 185, 129, 0.5)",
          footerBorder: "rgba(255, 255, 255, 0.08)",
        };
      } else if (chg < -0.1) {
        if (isLight) {
          return {
            background: "linear-gradient(145deg, #fef2f2, #fee2e2)",
            borderColor: "#fca5a5",
            glowColor: "rgba(239, 68, 68, 0.25)",
            textColor: "#7f1d1d",
            subColor: "#991b1b",
            badgeBg: "rgba(239, 68, 68, 0.15)",
            badgeText: "#b91c1c",
            pillBg: "#fecdd3",
            pillText: "#be123c",
            pillBorder: "#fca5a5",
            footerBorder: "rgba(239, 68, 68, 0.25)",
          };
        }
        const intensity = Math.min(1, Math.max(0.15, Math.abs(chg) / 2.5));
        return {
          background: `linear-gradient(145deg, rgba(127, 29, 29, ${0.45 * intensity + 0.35}), rgba(69, 10, 10, 0.95))`,
          borderColor: `rgba(239, 68, 68, ${0.4 + 0.4 * intensity})`,
          glowColor: "rgba(239, 68, 68, 0.2)",
          textColor: "#ffffff",
          subColor: "#cbd5e1",
          badgeBg: "rgba(0, 0, 0, 0.4)",
          badgeText: "#e2e8f0",
          pillBg: "rgba(239, 68, 68, 0.25)",
          pillText: "#fca5a5",
          pillBorder: "rgba(239, 68, 68, 0.5)",
          footerBorder: "rgba(255, 255, 255, 0.08)",
        };
      } else {
        if (isLight) {
          return {
            background: "linear-gradient(145deg, #ffffff, #f8fafc)",
            borderColor: "#cbd5e1",
            glowColor: "transparent",
            textColor: "#0f172a",
            subColor: "#475569",
            badgeBg: "rgba(0, 0, 0, 0.06)",
            badgeText: "#334155",
            pillBg: "#f1f5f9",
            pillText: "#475569",
            pillBorder: "#cbd5e1",
            footerBorder: "rgba(0, 0, 0, 0.08)",
          };
        }
        return {
          background: "linear-gradient(145deg, #0b1424, #08101d)",
          borderColor: "rgba(71, 85, 105, 0.4)",
          glowColor: "transparent",
          textColor: "#ffffff",
          subColor: "#94a3b8",
          badgeBg: "rgba(0, 0, 0, 0.3)",
          badgeText: "#94a3b8",
          pillBg: "rgba(255, 255, 255, 0.06)",
          pillText: "#94a3b8",
          pillBorder: "rgba(255, 255, 255, 0.1)",
          footerBorder: "rgba(255, 255, 255, 0.08)",
        };
      }
    } else {
      // Color by Free Float Leverage
      const lev = sector.ffLevPct;
      if (lev >= 0.85) {
        if (isLight) {
          return {
            background: "linear-gradient(145deg, #fef2f2, #fee2e2)",
            borderColor: "#fca5a5",
            glowColor: "rgba(239, 68, 68, 0.25)",
            textColor: "#7f1d1d",
            subColor: "#991b1b",
            badgeBg: "rgba(239, 68, 68, 0.15)",
            badgeText: "#b91c1c",
            pillBg: "#fecdd3",
            pillText: "#be123c",
            pillBorder: "#fca5a5",
            footerBorder: "rgba(239, 68, 68, 0.25)",
          };
        }
        return {
          background: "linear-gradient(145deg, rgba(127, 29, 29, 0.65), rgba(69, 10, 10, 0.95))",
          borderColor: "rgba(239, 68, 68, 0.7)",
          glowColor: "rgba(239, 68, 68, 0.25)",
          textColor: "#ffffff",
          subColor: "#cbd5e1",
          badgeBg: "rgba(0, 0, 0, 0.4)",
          badgeText: "#e2e8f0",
          pillBg: "rgba(239, 68, 68, 0.25)",
          pillText: "#fca5a5",
          pillBorder: "rgba(239, 68, 68, 0.5)",
          footerBorder: "rgba(255, 255, 255, 0.08)",
        };
      } else if (lev >= 0.65) {
        if (isLight) {
          return {
            background: "linear-gradient(145deg, #fffbeb, #fef3c7)",
            borderColor: "#fde68a",
            glowColor: "rgba(245, 158, 11, 0.25)",
            textColor: "#78350f",
            subColor: "#92400e",
            badgeBg: "rgba(245, 158, 11, 0.15)",
            badgeText: "#b45309",
            pillBg: "#fde68a",
            pillText: "#b45309",
            pillBorder: "#fcd34d",
            footerBorder: "rgba(245, 158, 11, 0.25)",
          };
        }
        return {
          background: "linear-gradient(145deg, rgba(146, 64, 14, 0.6), rgba(69, 26, 3, 0.95))",
          borderColor: "rgba(245, 158, 11, 0.6)",
          glowColor: "rgba(245, 158, 11, 0.2)",
          textColor: "#ffffff",
          subColor: "#cbd5e1",
          badgeBg: "rgba(0, 0, 0, 0.4)",
          badgeText: "#e2e8f0",
          pillBg: "rgba(245, 158, 11, 0.25)",
          pillText: "#fcd34d",
          pillBorder: "rgba(245, 158, 11, 0.5)",
          footerBorder: "rgba(255, 255, 255, 0.08)",
        };
      } else {
        if (isLight) {
          return {
            background: "linear-gradient(145deg, #f0fdf4, #dcfce7)",
            borderColor: "#86efac",
            glowColor: "rgba(16, 185, 129, 0.25)",
            textColor: "#064e3b",
            subColor: "#047857",
            badgeBg: "rgba(16, 185, 129, 0.15)",
            badgeText: "#065f46",
            pillBg: "#bbf7d0",
            pillText: "#15803d",
            pillBorder: "#86efac",
            footerBorder: "rgba(16, 185, 129, 0.25)",
          };
        }
        return {
          background: "linear-gradient(145deg, rgba(6, 78, 59, 0.5), rgba(4, 47, 46, 0.95))",
          borderColor: "rgba(16, 185, 129, 0.5)",
          glowColor: "rgba(16, 185, 129, 0.15)",
          textColor: "#ffffff",
          subColor: "#cbd5e1",
          badgeBg: "rgba(0, 0, 0, 0.4)",
          badgeText: "#e2e8f0",
          pillBg: "rgba(16, 185, 129, 0.25)",
          pillText: "#6ee7b7",
          pillBorder: "rgba(16, 185, 129, 0.5)",
          footerBorder: "rgba(255, 255, 255, 0.08)",
        };
      }
    }
  };

  return (
    <div className="sectorsContainer">
      {/* 1. Header with Breadcrumb & Back button */}
      <div className="sectorsHeader">
        <div className="sectorsHeaderLeft">
          <button className="sectorsBackBtn" onClick={onBack} title="Return to Stock Screener">
            <ChevronLeft size={16} />
            <span>Back to Screener</span>
          </button>
          <div className="sectorsBreadcrumb">
            <span>Market Analytics</span>
            <span className="crumbSlash">/</span>
            <span className="crumbActive">Sectors & Market Map</span>
          </div>
          <div className="sectorsTitleRow">
            <h1 className="sectorsTitle">Sectors & Market Map</h1>
            <span className="sectorsLiveBadge">
              <span className="livePulseDot" />
              LIVE NSE + BSE FEED
            </span>
          </div>
          <p className="sectorsSubtitle">
            Track sector-level retail crowding, free-float leverage concentration, and unwinding risks across the complete Indian exchange universe.
          </p>
        </div>

        <div className="sectorsHeaderRight">
          <div className="sectorsRefreshBox">
            <span className="sectorsRefreshTime">
              Updated: {lastRefreshed.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
            <button className="sectorsRefreshBtn" onClick={loadData} disabled={loading} title="Refresh Sector Feeds">
              <RefreshCw size={14} className={loading ? "spinIcon" : ""} />
            </button>
          </div>
          <div className="sectorsTotalBadge">
            <span className="totalLabel">TOTAL MARKET MTF</span>
            <b className="totalVal">{formatExactCr(totalMarketMTF)}</b>
          </div>
        </div>
      </div>

      {/* 2. Top-Level Summary KPIs Row (Stat Cards) */}
      <div className="sectorsStatsGrid">
        {/* Card 1: Top Leveraged Sector */}
        <div className="card sectorsStatCard">
          <div className="statMeta">
            <span>TOP LEVERAGED SECTOR</span>
            <Landmark size={18} className="statIcon" style={{ color: "#3b82f6" }} />
          </div>
          <div className="statValHighlight">
            <span className="sectorKpiName">{topLeveragedSector?.name || "Banking & Financials"}</span>
            <div className="sectorKpiSubRow">
              <b className="sectorKpiAmount">{formatExactCr(topLeveragedSector?.bookCr || 0)}</b>
              <span className="sectorKpiShare">({topLeveragedSector?.sharePct || 0}% of Market)</span>
            </div>
          </div>
          <div className="statBar">
            <div
              className="statBarFill"
              style={{
                width: `${Math.min(100, (topLeveragedSector?.sharePct || 15) * 4)}%`,
                background: "linear-gradient(90deg, #3b82f6, #60a5fa)",
              }}
            />
          </div>
          <span className="statSub">
            Highest cumulative retail margin debt concentration
          </span>
        </div>

        {/* Card 2: Top Accumulating Sector */}
        <div className="card sectorsStatCard">
          <div className="statMeta">
            <span>TOP ACCUMULATING ({timeHorizon})</span>
            <TrendingUp size={18} className="statIcon" style={{ color: "#10b981" }} />
          </div>
          <div className="statValHighlight">
            <span className="sectorKpiName">{topAccumulatingSector?.name || "Industrials & Infra"}</span>
            <div className="sectorKpiSubRow">
              <b className="sectorKpiAmount" style={{ color: (topAccumulatingSector?.change || 0) >= 0 ? "#10b981" : "#ef4444" }}>
                {(topAccumulatingSector?.change || 0) >= 0 ? "+" : ""}
                {topAccumulatingSector?.change || 0}%
              </b>
              <span className="sectorKpiShare">
                ({formatExactCr(topAccumulatingSector?.bookCr || 0)})
              </span>
            </div>
          </div>
          <div className="statBar">
            <div
              className="statBarFill"
              style={{
                width: `${Math.min(100, Math.max(10, (topAccumulatingSector?.change || 1) * 20))}%`,
                background: "linear-gradient(90deg, #10b981, #34d399)",
              }}
            />
          </div>
          <span className="statSub">
            Fastest retail MTF position build-up over {timeHorizon}
          </span>
        </div>

        {/* Card 3: Fastest Unwinding Sector */}
        <div className="card sectorsStatCard">
          <div className="statMeta">
            <span>FASTEST UNWINDING ({timeHorizon})</span>
            <ShieldAlert size={18} className="statIcon" style={{ color: "#ef4444" }} />
          </div>
          <div className="statValHighlight">
            <span className="sectorKpiName">{fastestUnwindingSector?.name || "Information Tech"}</span>
            <div className="sectorKpiSubRow">
              <b className="sectorKpiAmount" style={{ color: fastestUnwindingSector?.change < 0 ? "#ef4444" : "#e2e8f0" }}>
                {fastestUnwindingSector?.change >= 0 ? "+" : ""}
                {fastestUnwindingSector?.change || 0}%
              </b>
              <span className="sectorKpiShare">
                ({formatExactCr(fastestUnwindingSector?.bookCr || 0)})
              </span>
            </div>
          </div>
          <div className="statBar">
            <div
              className="statBarFill"
              style={{
                width: `${Math.min(100, Math.max(10, Math.abs(fastestUnwindingSector?.change || 1) * 25))}%`,
                background: "linear-gradient(90deg, #ef4444, #f87171)",
              }}
            />
          </div>
          <span className="statSub">
            {fastestUnwindingSector?.change < 0
              ? "Position reduction signals margin pressure & stop-outs"
              : "No severe unwinding detected across sectors"}
          </span>
        </div>

        {/* Card 4: Retail Crowding Warning Index */}
        <div className="card sectorsStatCard">
          <div className="statMeta">
            <span>CROWDING WARNING INDEX</span>
            <AlertTriangle size={18} className="statIcon" style={{ color: crowdingWarningIndex.color }} />
          </div>
          <div className="statValHighlight">
            <div className="crowdingIndexPill" style={{ color: crowdingWarningIndex.color, borderColor: crowdingWarningIndex.color }}>
              <span className="crowdingDot" style={{ background: crowdingWarningIndex.color }} />
              <b>{crowdingWarningIndex.label}</b>
            </div>
            <div className="sectorKpiSubRow" style={{ marginTop: 6 }}>
              <span className="crowdingMean">Mean FF Leverage: <b>{avgFfLev}%</b></span>
            </div>
          </div>
          <div className="statBar">
            <div
              className="statBarFill"
              style={{
                width: crowdingWarningIndex.label === "HIGH RISK" ? "85%" : crowdingWarningIndex.label === "MODERATE RISK" ? "52%" : "25%",
                background: crowdingWarningIndex.color,
              }}
            />
          </div>
          <span className="statSub">{crowdingWarningIndex.desc}</span>
        </div>
      </div>

      {/* 3. Controls & Filter Bar */}
      <div className="card sectorsControlsCard">
        <div className="sectorsControlsRow">
          {/* Time Horizon Filter */}
          <div className="ctrlGroup">
            <span className="ctrlLabel">TIME HORIZON:</span>
            <div className="segment">
              {["1D", "1W", "1M", "YTD"].map((h) => (
                <button
                  key={h}
                  className={timeHorizon === h ? "on" : ""}
                  onClick={() => setTimeHorizon(h)}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>

          {/* Market Cap Filter */}
          <div className="ctrlGroup">
            <span className="ctrlLabel">CAP TIER:</span>
            <div className="segment">
              {[
                { key: "ALL", label: "All Caps" },
                { key: "Large-Cap", label: "Large" },
                { key: "Mid-Cap", label: "Mid" },
                { key: "Small-Cap", label: "Small" },
              ].map((c) => (
                <button
                  key={c.key}
                  className={capTier === c.key ? "on" : ""}
                  onClick={() => setCapTier(c.key)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color Switcher */}
          <div className="ctrlGroup">
            <span className="ctrlLabel">COLOR TILE BY:</span>
            <div className="segment">
              <button
                className={colorMetric === "pctChange" ? "on" : ""}
                onClick={() => setColorMetric("pctChange")}
                title="Color intensity represents % MTF Change over horizon"
              >
                % MTF Change
              </button>
              <button
                className={colorMetric === "freeFloat" ? "on" : ""}
                onClick={() => setColorMetric("freeFloat")}
                title="Color intensity represents MTF as % of Free Float (Crowding)"
              >
                MTF / Free-Float
              </button>
            </div>
          </div>

          {/* View Toggle */}
          <div className="ctrlGroup mlAuto">
            <span className="ctrlLabel">VIEW MODE:</span>
            <div className="segment">
              <button
                className={viewMode === "treemap" ? "on" : ""}
                onClick={() => setViewMode("treemap")}
                title="Interactive Proportional Heatmap Treemap"
              >
                <Grid3X3 size={14} style={{ marginRight: 5, verticalAlign: "middle" }} />
                Heatmap View
              </button>
              <button
                className={viewMode === "grid" ? "on" : ""}
                onClick={() => setViewMode("grid")}
                title="Structured Uniform Sector Cards Grid View"
              >
                <LayoutGrid size={14} style={{ marginRight: 5, verticalAlign: "middle" }} />
                Grid View
              </button>
              <button
                className={viewMode === "quadrant" ? "on" : ""}
                onClick={() => setViewMode("quadrant")}
                title="Risk vs Momentum Quadrant Scatter Matrix"
              >
                <BarChart3 size={14} style={{ marginRight: 5, verticalAlign: "middle" }} />
                Quadrant Matrix
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Primary Visualization Section */}
      <section className="card sectorsVizCard">
        <div className="vizCardHeader">
          <div>
            <h2 className="vizTitle">
              {viewMode === "treemap"
                ? "SECTOR LEVERAGE HEATMAP (TREEMAP VIEW)"
                : viewMode === "grid"
                ? "SECTOR LEVERAGE HEATMAP (GRID VIEW)"
                : "RISK VS. MOMENTUM QUADRANT MATRIX"}
            </h2>
            <p className="vizSub">
              {viewMode === "treemap"
                ? `Tile size represents Total MTF Financed Book (₹ Cr). Colors represent ${
                    colorMetric === "pctChange" ? `${timeHorizon} % MTF Change` : "MTF as % of Free Float"
                  }. Click any tile to inspect sector constituents.`
                : viewMode === "grid"
                ? `Uniform balanced sector matrix. Colors represent ${
                    colorMetric === "pctChange" ? `${timeHorizon} % MTF Change` : "MTF as % of Free Float"
                  }. Click any card to inspect sector constituents.`
                : `X-Axis: Free-Float Leverage % (Crowding). Y-Axis: ${timeHorizon} % MTF Change (Momentum). Bubble size: MTF Book. Click any bubble to inspect sector.`}
            </p>
          </div>

          {/* Legend */}
          {viewMode !== "quadrant" ? (
            <div className="treemapLegend">
              {colorMetric === "pctChange" ? (
                <>
                  <div className="legendItem">
                    <span
                      className="legendBox"
                      style={{
                        background: isLight ? "#fee2e2" : "#991b1b",
                        borderColor: isLight ? "#fca5a5" : "rgba(255, 255, 255, 0.2)",
                      }}
                    />
                    <span>Unwinding (&lt; -1%)</span>
                  </div>
                  <div className="legendItem">
                    <span
                      className="legendBox"
                      style={{
                        background: isLight ? "#f1f5f9" : "#334155",
                        borderColor: isLight ? "#cbd5e1" : "rgba(255, 255, 255, 0.2)",
                      }}
                    />
                    <span>Flat (0%)</span>
                  </div>
                  <div className="legendItem">
                    <span
                      className="legendBox"
                      style={{
                        background: isLight ? "#dcfce7" : "#065f46",
                        borderColor: isLight ? "#86efac" : "rgba(255, 255, 255, 0.2)",
                      }}
                    />
                    <span>Accumulating (&gt; +1%)</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="legendItem">
                    <span
                      className="legendBox"
                      style={{
                        background: isLight ? "#dcfce7" : "#065f46",
                        borderColor: isLight ? "#86efac" : "rgba(255, 255, 255, 0.2)",
                      }}
                    />
                    <span>Safe (&lt; 0.65%)</span>
                  </div>
                  <div className="legendItem">
                    <span
                      className="legendBox"
                      style={{
                        background: isLight ? "#fef3c7" : "#92400e",
                        borderColor: isLight ? "#fde68a" : "rgba(255, 255, 255, 0.2)",
                      }}
                    />
                    <span>Elevated (0.65% - 0.85%)</span>
                  </div>
                  <div className="legendItem">
                    <span
                      className="legendBox"
                      style={{
                        background: isLight ? "#fee2e2" : "#991b1b",
                        borderColor: isLight ? "#fca5a5" : "rgba(255, 255, 255, 0.2)",
                      }}
                    />
                    <span>High Risk (&gt; 0.85%)</span>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="quadrantLegend">
              <span className="quadLegendPill quadOverheat">Top-Right: Overheating</span>
              <span className="quadLegendPill quadLiq">Bottom-Right: Liquidation</span>
              <span className="quadLegendPill quadMom">Top-Left: Accumulation</span>
              <span className="quadLegendPill quadDormant">Bottom-Left: Dormant</span>
            </div>
          )}
        </div>

        {/* View Mode 1: Interactive Squarified Treemap */}
        {viewMode === "treemap" && (
          <div className="treemapContainer">
            {treemapTiles.map((tile) => {
              const IconComp = tile.config.icon || Landmark;
              const bgStyle = getTileBgStyle(tile);
              const isSelected = selectedSector?.name === tile.name;

              return (
                <div
                  key={tile.name}
                  className={`treemapTile ${isSelected ? "selectedTile" : ""}`}
                  style={{
                    left: `${tile.x}%`,
                    top: `${tile.y}%`,
                    width: `${tile.w}%`,
                    height: `${tile.h}%`,
                  }}
                  onClick={() => setSelectedSector(tile)}
                >
                  <div
                    className="treemapTileInner"
                    style={{
                      background: bgStyle.background,
                      borderColor: isSelected ? "#38bdf8" : bgStyle.borderColor,
                      boxShadow: isSelected ? "0 0 16px rgba(56, 189, 248, 0.4)" : "none",
                    }}
                  >
                    {/* Tile Top: Icon, Name & Share */}
                    <div className="tileHeader">
                      <div className="tileTitleRow">
                        <div className="tileIconBox" style={{ color: tile.config.color }}>
                          <IconComp size={14} />
                        </div>
                        <span className="tileSectorName" style={{ color: bgStyle.textColor }}>
                          <span className="nameFull">{tile.name}</span>
                          <span className="nameShort">{tile.config?.shortName || tile.name}</span>
                        </span>
                      </div>
                      <span
                        className="tileShareBadge"
                        style={{ background: bgStyle.badgeBg, color: bgStyle.badgeText }}
                      >
                        {tile.sharePct}%
                      </span>
                    </div>

                    {/* Tile Center: Total MTF Book (₹ Cr) */}
                    <div className="tileValueRow">
                      <b className="tileBookCr" style={{ color: bgStyle.textColor }}>
                        <span className="valFull">{formatExactCr(tile.bookCr)}</span>
                        <span className="valMobile">₹{Math.round(tile.bookCr).toLocaleString("en-IN")} Cr</span>
                      </b>
                      <span
                        className="tileChangePill"
                        style={{
                          background: bgStyle.pillBg,
                          color: bgStyle.pillText,
                          borderColor: bgStyle.pillBorder,
                        }}
                      >
                        {tile.change >= 0 ? "+" : ""}
                        {tile.change}%
                      </span>
                    </div>

                    {/* Tile Footer: MTF/FF ratio & Stock Count */}
                    <div className="tileFooter" style={{ borderTopColor: bgStyle.footerBorder, color: bgStyle.subColor }}>
                      <span className="tileFfLev" style={{ color: bgStyle.subColor }}>
                        <span className="labelFull">FF Lev: </span>
                        <span className="labelMobile">Lev: </span>
                        <b style={{ color: bgStyle.textColor }}>{tile.ffLevPct}%</b>
                      </span>
                      <span className="tileStockCount" style={{ color: bgStyle.subColor }}>
                        <span className="labelFull">{tile.stockCount} Stocks</span>
                        <span className="labelMobile">{tile.stockCount} Stk</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View Mode 2: Uniform Sector Cards Grid */}
        {viewMode === "grid" && (
          <div className="sectorsGridContainer">
            {sectors.map((sector) => {
              const IconComp = sector.config.icon || Landmark;
              const bgStyle = getTileBgStyle(sector);
              const isSelected = selectedSector?.name === sector.name;

              return (
                <div
                  key={sector.name}
                  className={`sectorGridCard ${isSelected ? "selectedTile" : ""}`}
                  style={{
                    background: bgStyle.background,
                    borderColor: isSelected ? "#38bdf8" : bgStyle.borderColor,
                    boxShadow: isSelected ? "0 0 16px rgba(56, 189, 248, 0.4)" : "none",
                  }}
                  onClick={() => setSelectedSector(sector)}
                >
                  {/* Card Top: Icon, Name & Share */}
                  <div className="tileHeader">
                    <div className="tileTitleRow">
                      <div className="tileIconBox" style={{ color: sector.config.color }}>
                        <IconComp size={15} />
                      </div>
                      <span className="tileSectorName" style={{ color: bgStyle.textColor, fontSize: "13px" }}>
                        {sector.name}
                      </span>
                    </div>
                    <span
                      className="tileShareBadge"
                      style={{ background: bgStyle.badgeBg, color: bgStyle.badgeText }}
                    >
                      {sector.sharePct}%
                    </span>
                  </div>

                  {/* Card Center: Total MTF Book (₹ Cr) */}
                  <div className="tileValueRow" style={{ margin: "10px 0" }}>
                    <b className="tileBookCr" style={{ color: bgStyle.textColor, fontSize: "17px" }}>
                      {formatExactCr(sector.bookCr)}
                    </b>
                    <span
                      className="tileChangePill"
                      style={{
                        background: bgStyle.pillBg,
                        color: bgStyle.pillText,
                        borderColor: bgStyle.pillBorder,
                        fontSize: "11px",
                      }}
                    >
                      {sector.change >= 0 ? "+" : ""}
                      {sector.change}%
                    </span>
                  </div>

                  {/* Card Footer: MTF/FF ratio & Stock Count */}
                  <div className="tileFooter" style={{ borderTopColor: bgStyle.footerBorder, color: bgStyle.subColor }}>
                    <span className="tileFfLev" style={{ color: bgStyle.subColor }}>
                      <span>FF Lev: </span>
                      <b style={{ color: bgStyle.textColor }}>{sector.ffLevPct}%</b>
                    </span>
                    <span className="tileStockCount" style={{ color: bgStyle.subColor }}>
                      <span>{sector.stockCount} Stocks</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View Mode 3: Quadrant / Scatter Matrix View */}
        {viewMode === "quadrant" && (
          <div className="quadrantContainer">
            {/* Background 4 Quadrants Labels */}
            <div className="quadrantOverlay">
              <div className="quadZone quadZoneTopLeft">
                <span className="quadZoneBadge">MOMENTUM ACCUMULATION</span>
                <p>Low Crowding + Rapid Inflow (Early Sector Rotation)</p>
              </div>
              <div className="quadZone quadZoneTopRight">
                <span className="quadZoneBadge warning">OVERHEATING / SQUEEZE RISK</span>
                <p>High Crowding + Momentum (Vulnerable to Fast Margin Calls)</p>
              </div>
              <div className="quadZone quadZoneBottomLeft">
                <span className="quadZoneBadge neutral">DORMANT / LOW VOLATILITY</span>
                <p>Low Crowding + Outflow (Institutional Inactivity)</p>
              </div>
              <div className="quadZone quadZoneBottomRight">
                <span className="quadZoneBadge danger">FORCED LIQUIDATION / UNWINDING</span>
                <p>High Crowding + Contraction (Severe Margin Sell-off)</p>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={430}>
              <ScatterChart margin={{ top: 25, right: 35, bottom: 25, left: 15 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
                <XAxis
                  type="number"
                  dataKey="ffLevPct"
                  name="MTF % of Free Float"
                  unit="%"
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  label={{
                    value: "MTF as % of Free Float (Leverage / Crowding Concentration)",
                    position: "insideBottom",
                    offset: -12,
                    fill: "#94a3b8",
                    fontSize: 11,
                  }}
                />
                <YAxis
                  type="number"
                  dataKey="change"
                  name={`${timeHorizon} % Change`}
                  unit="%"
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  label={{
                    value: `${timeHorizon} MTF Book % Change (Momentum)`,
                    angle: -90,
                    position: "insideLeft",
                    fill: "#94a3b8",
                    fontSize: 11,
                  }}
                />
                <ZAxis type="number" dataKey="bookCr" range={[140, 750]} />
                <ReferenceLine
                  x={avgFfLev}
                  stroke="rgba(255,255,255,0.3)"
                  strokeDasharray="4 4"
                  label={{
                    value: `Mean FF: ${avgFfLev}%`,
                    position: "insideTopRight",
                    fill: "#64748b",
                    fontSize: 10,
                  }}
                />
                <ReferenceLine
                  y={0}
                  stroke="rgba(255,255,255,0.3)"
                  strokeDasharray="4 4"
                  label={{
                    value: "0% Momentum Line",
                    position: "insideBottomRight",
                    fill: "#64748b",
                    fontSize: 10,
                  }}
                />
                <RechartsTooltip
                  cursor={{ strokeDasharray: "3 3", stroke: "rgba(56, 189, 248, 0.4)" }}
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const data = payload[0].payload;
                    return (
                      <div className="quadTooltip">
                        <div className="quadTooltipHead">
                          <b>{data.name}</b>
                          <span
                            className="quadTooltipRisk"
                            style={{ color: data.riskColor, borderColor: data.riskColor }}
                          >
                            {data.riskTag}
                          </span>
                        </div>
                        <div className="quadTooltipGrid">
                          <div>
                            <span className="tooltipLabel">Total MTF Book:</span>
                            <b className="tooltipVal">{formatExactCr(data.bookCr)}</b>
                          </div>
                          <div>
                            <span className="tooltipLabel">Market Share:</span>
                            <b className="tooltipVal">{data.sharePct}%</b>
                          </div>
                          <div>
                            <span className="tooltipLabel">FF Leverage:</span>
                            <b className="tooltipVal">{data.ffLevPct}%</b>
                          </div>
                          <div>
                            <span className="tooltipLabel">{timeHorizon} Momentum:</span>
                            <b
                              className="tooltipVal"
                              style={{ color: data.change >= 0 ? "#10b981" : "#ef4444" }}
                            >
                              {data.change >= 0 ? "+" : ""}
                              {data.change}%
                            </b>
                          </div>
                        </div>
                        {data.topStock && (
                          <div className="quadTooltipTopStock">
                            <span>Top Leveraged Stock:</span>
                            <b>
                              {data.topStock.symbol} ({formatExactCr(data.topStock.amount_financed / 100)})
                            </b>
                          </div>
                        )}
                        <div className="quadTooltipHint">Click bubble to inspect sector stocks</div>
                      </div>
                    );
                  }}
                />
                <Scatter
                  data={sectors}
                  onClick={(entry) => setSelectedSector(entry)}
                  cursor="pointer"
                >
                  {sectors.map((entry, index) => {
                    const fillCol = entry.change >= 0 ? "#10b981" : "#ef4444";
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={fillCol}
                        fillOpacity={0.78}
                        stroke={entry.config?.color || "#38bdf8"}
                        strokeWidth={2}
                      />
                    );
                  })}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* 5. Detailed Sector Breakdown Sortable Table */}
      <section className="card sectorsTableCard">
        <div className="tableHead sectorsTableHead">
          <div>
            <h2>DETAILED SECTOR BREAKDOWN & RISK REGISTER</h2>
            <p>
              Examine leverage depth, crowding ratios, momentum deltas, and dominant stocks across all {sectors.length} sectors.
            </p>
          </div>

          <div className="sectorsSearchWrap">
            <Search size={14} className="sectorsSearchIcon" />
            <input
              type="text"
              placeholder="Filter by sector or stock symbol..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="sectorsSearchInput"
            />
            {searchQuery && (
              <button
                className="sectorsSearchClear"
                onClick={() => setSearchQuery("")}
                title="Clear filter"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        <div className="tableScroll">
          <table className="sectorsTable">
            <thead>
              <tr>
                <th onClick={() => handleSort("name")}>
                  <div className="thFlex">
                    <span>SECTOR</span>
                    {sortCol === "name" && (sortDesc ? <ChevronDown size={13} /> : <ChevronUp size={13} />)}
                  </div>
                </th>
                <th onClick={() => handleSort("bookCr")} className="number">
                  <div className="thFlex right">
                    <span>TOTAL MTF BOOK</span>
                    {sortCol === "bookCr" && (sortDesc ? <ChevronDown size={13} /> : <ChevronUp size={13} />)}
                  </div>
                </th>
                <th onClick={() => handleSort("sharePct")} className="number">
                  <div className="thFlex right">
                    <span>% OF TOTAL MTF</span>
                    {sortCol === "sharePct" && (sortDesc ? <ChevronDown size={13} /> : <ChevronUp size={13} />)}
                  </div>
                </th>
                <th onClick={() => handleSort("change1D")} className="number">
                  <div className="thFlex right">
                    <span>1D CHANGE</span>
                    {sortCol === "change1D" && (sortDesc ? <ChevronDown size={13} /> : <ChevronUp size={13} />)}
                  </div>
                </th>
                <th onClick={() => handleSort("change")} className="number">
                  <div className="thFlex right">
                    <span>{timeHorizon} CHANGE</span>
                    {sortCol === "change" && (sortDesc ? <ChevronDown size={13} /> : <ChevronUp size={13} />)}
                  </div>
                </th>
                <th onClick={() => handleSort("ffLevPct")} className="number">
                  <div className="thFlex right">
                    <span>MTF / FREE FLOAT</span>
                    {sortCol === "ffLevPct" && (sortDesc ? <ChevronDown size={13} /> : <ChevronUp size={13} />)}
                  </div>
                </th>
                <th>CROWDING / RISK STATUS</th>
                <th>TOP LEVERAGED STOCK</th>
                <th style={{ textAlign: "center" }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {displayedSectors.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "30px 0", color: "var(--muted)" }}>
                    No sectors matching "{searchQuery}".
                  </td>
                </tr>
              ) : (
                displayedSectors.map((sector) => {
                  const IconComp = sector.config.icon || Landmark;
                  return (
                    <tr
                      key={sector.name}
                      className={`sectorRow ${selectedSector?.name === sector.name ? "selectedRow" : ""}`}
                      onClick={() => setSelectedSector(sector)}
                    >
                      {/* Sector Name + Icon */}
                      <td>
                        <div className="sectorNameCell">
                          <div className="sectorTableIcon" style={{ color: sector.config.color, background: sector.config.accentBg }}>
                            <IconComp size={15} />
                          </div>
                          <div>
                            <b className="sectorCellName">{sector.name}</b>
                            <span className="sectorCellSub">{sector.stockCount} Securities</span>
                          </div>
                        </div>
                      </td>

                      {/* Total MTF Book */}
                      <td className="number">
                        <b className="cellValueBold">{formatExactCr(sector.bookCr)}</b>
                      </td>

                      {/* % of Total MTF */}
                      <td className="number">
                        <span className="cellShareVal">{sector.sharePct}%</span>
                      </td>

                      {/* 1D Change */}
                      <td className="number">
                        <span className={`cellChangePill ${sector.change1D >= 0 ? "pos" : "neg"}`}>
                          {sector.change1D >= 0 ? "+" : ""}
                          {sector.change1D}%
                        </span>
                      </td>

                      {/* Selected Horizon Change */}
                      <td className="number">
                        <span className={`cellChangePill ${sector.change >= 0 ? "pos" : "neg"}`}>
                          {sector.change >= 0 ? "+" : ""}
                          {sector.change}%
                        </span>
                      </td>

                      {/* MTF / Free Float */}
                      <td className="number">
                        <span className="cellFfLev">{sector.ffLevPct}%</span>
                      </td>

                      {/* Risk / Crowding Status */}
                      <td>
                        <span
                          className="sectorRiskBadge"
                          style={{
                            color: sector.riskColor,
                            borderColor: sector.riskColor,
                            background: `${sector.riskColor}18`,
                          }}
                        >
                          {sector.riskStatus}
                        </span>
                      </td>

                      {/* Top Stock */}
                      <td>
                        {sector.topStock ? (
                          <div className="topStockCell">
                            <span className="topStockSym">{sector.topStock.symbol}</span>
                            <small className="topStockAmt">
                              {formatExactCr(sector.topStock.amount_financed / 100)}
                            </small>
                          </div>
                        ) : (
                          <span style={{ color: "var(--muted)" }}>N/A</span>
                        )}
                      </td>

                      {/* Action Button */}
                      <td style={{ textAlign: "center" }}>
                        <button
                          className="inspectSectorBtn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSector(sector);
                          }}
                          title={`Inspect ${sector.name} constituents`}
                        >
                          <span>Inspect</span>
                          <ChevronRight size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 6. Sector Drill-Down Slide-Over Drawer */}
      {selectedSector && (
        <div className="sectorDrawerBackdrop" onClick={() => setSelectedSector(null)}>
          <div className="sectorDrawerPanel" onClick={(e) => e.stopPropagation()}>
            {/* Drawer Header */}
            <div className="sectorDrawerHeader">
              <div className="drawerHeaderLeft">
                <div
                  className="drawerSectorIconBox"
                  style={{
                    color: selectedSector.config.color,
                    background: selectedSector.config.accentBg,
                  }}
                >
                  {React.createElement(selectedSector.config.icon || Landmark, { size: 22 })}
                </div>
                <div>
                  <div className="drawerTitleLine">
                    <h2 className="drawerSectorTitle">{selectedSector.name}</h2>
                    <span
                      className="drawerRiskPill"
                      style={{
                        color: selectedSector.riskColor,
                        borderColor: selectedSector.riskColor,
                        background: `${selectedSector.riskColor}18`,
                      }}
                    >
                      {selectedSector.riskStatus}
                    </span>
                  </div>
                  <p className="drawerSectorSub">{selectedSector.config.desc}</p>
                </div>
              </div>

              <button
                className="drawerCloseBtn"
                onClick={() => setSelectedSector(null)}
                title="Close Sector Drawer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Sector KPI Summary Strip */}
            <div className="sectorDrawerKpis">
              <div className="drawerKpiCard">
                <span className="kpiLabel">SECTOR MTF BOOK</span>
                <b className="kpiVal">{formatExactCr(selectedSector.bookCr)}</b>
                <span className="kpiSub">{selectedSector.sharePct}% of entire market</span>
              </div>
              <div className="drawerKpiCard">
                <span className="kpiLabel">{timeHorizon} MOMENTUM</span>
                <b
                  className="kpiVal"
                  style={{ color: selectedSector.change >= 0 ? "#10b981" : "#ef4444" }}
                >
                  {selectedSector.change >= 0 ? "+" : ""}
                  {selectedSector.change}%
                </b>
                <span className="kpiSub">1D: {selectedSector.change1D >= 0 ? "+" : ""}{selectedSector.change1D}%</span>
              </div>
              <div className="drawerKpiCard">
                <span className="kpiLabel">FREE-FLOAT LEVERAGE</span>
                <b className="kpiVal">{selectedSector.ffLevPct}%</b>
                <span className="kpiSub">Market Cap: {formatExactCr(selectedSector.mcapCr)}</span>
              </div>
              <div className="drawerKpiCard">
                <span className="kpiLabel">ACTIVE SECURITIES</span>
                <b className="kpiVal">{selectedSector.stockCount}</b>
                <span className="kpiSub">Top 10 listed below</span>
              </div>
            </div>

            {/* Sector Stocks Breakdown Table */}
            <div className="drawerStocksSection">
              <div className="drawerStocksHead">
                <h3>TOP MTF CONSTITUENTS ({selectedSector.name})</h3>
                <span className="drawerStocksTip">
                  Ranked by MTF book value.
                </span>
              </div>

              <div className="tableScroll">
                <table className="drawerStocksTable">
                  <thead>
                    <tr>
                      <th>STOCK</th>
                      <th className="number">MTF BOOK</th>
                      <th className="number">SECTOR SHARE</th>
                      <th className="number">1D MOVE</th>
                      <th className="number">30D MOVE</th>
                      <th className="number">FF LEVERAGE</th>
                      <th>RSI / TECH</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSector.stocks.slice(0, 10).map((stock) => {
                      const bookCr = (stock.amount_financed || 0) / 100;
                      const sectorShare =
                        selectedSector.bookCr > 0
                          ? Number(((bookCr / selectedSector.bookCr) * 100).toFixed(1))
                          : 0;
                      const dayChg = Number(stock.dayMove || stock.chg?.NSE?.["1"] || 0);
                      const monthChg = Number(stock.change_30d_pct || stock.chg?.NSE?.["30"] || 0);

                      return (
                        <tr key={stock.symbol}>
                          <td>
                            <div className="drawerStockItem">
                              <span className="drawerStockSym">{stock.symbol}</span>
                              <span className="drawerStockName">{stock.name}</span>
                            </div>
                          </td>
                          <td className="number">
                            <b className="cellValBold">{formatExactCr(bookCr)}</b>
                          </td>
                          <td className="number">
                            <span className="sectorShareBadge">{sectorShare}%</span>
                          </td>
                          <td className="number">
                            <span className={`cellMovePill ${dayChg >= 0 ? "pos" : "neg"}`}>
                              {dayChg >= 0 ? "+" : ""}
                              {dayChg}%
                            </span>
                          </td>
                          <td className="number">
                            <span className={`cellMovePill ${monthChg >= 0 ? "pos" : "neg"}`}>
                              {monthChg >= 0 ? "+" : ""}
                              {monthChg}%
                            </span>
                          </td>
                          <td className="number">
                            <span className="cellFfLev">
                              {stock.ff_leverage_pct ? `${stock.ff_leverage_pct.toFixed(2)}%` : "N/A"}
                            </span>
                          </td>
                          <td>
                            <div className="drawerTechCell">
                              <span className="drawerRsiBadge">RSI {stock.rsi || 52}</span>
                              {stock.primaryPattern && (
                                <span className="drawerPatternBadge">
                                  {stock.primaryPattern.badge}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Slide-out Stock Deep Dive Drawer (Integrated Seamlessly) */}
      {deepDiveStock && (
        <StockDrawer
          stock={deepDiveStock}
          onClose={() => setDeepDiveStock(null)}
          isWatchlisted={false}
          onToggleWatchlist={() => {}}
          alerts={[]}
          onAddAlert={() => {}}
          onDeleteAlert={() => {}}
          historyData={[]}
        />
      )}
    </div>
  );
}
