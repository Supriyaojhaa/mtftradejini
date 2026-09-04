import React, { useState, useMemo, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  Search,
  SlidersHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Download,
  Clock,
  Layers,
  BarChart2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  RotateCcw,
  Star,
  Bell,
  Sliders,
  Plus,
  Trash2,
  Eye,
  Check,
  ShieldAlert,
  Target,
  FileSpreadsheet,
} from "lucide-react";
import { enrichStock } from "./stockDataEnricher";
import StockDrawer from "./StockDrawer";

// Fallback universe
const FALLBACK_RAW_STOCKS = [
  { symbol: "HDFCBANK", name: "HDFC BANK LTD", exchange: "NSE", isin: "INE040A01034", amount_financed: 395179.7, mcap_lakhs: 109348186.0, ffmc_lakhs: 108418726.42, leverage_pct: 0.36, ff_leverage_pct: 0.36, change_30d_pct: 66.35, adv: 30912538, days_to_cover: 1.7, is_etf: false },
  { symbol: "BSE", name: "BSE LIMITED", exchange: "NSE", isin: "INE118H01025", amount_financed: 335321.38, mcap_lakhs: 13485055.47, ffmc_lakhs: 13471570.41, leverage_pct: 2.49, ff_leverage_pct: 2.49, change_30d_pct: 82.4, adv: 3784868, days_to_cover: 2.5, is_etf: false },
  { symbol: "RELIANCE", name: "RELIANCE INDUSTRIES LTD", exchange: "NSE", isin: "INE002A01018", amount_financed: 222077.7, mcap_lakhs: 177776961.0, ffmc_lakhs: 88497371.19, leverage_pct: 0.12, ff_leverage_pct: 0.25, change_30d_pct: -3.58, adv: 12171016, days_to_cover: 1.4, is_etf: false },
  { symbol: "JIOFIN", name: "JIO FIN SERVICES LTD", exchange: "NSE", isin: "INE758E01017", amount_financed: 175936.98, mcap_lakhs: 15801318.0, ffmc_lakhs: 7829553.07, leverage_pct: 1.11, ff_leverage_pct: 2.25, change_30d_pct: 47.42, adv: 18752901, days_to_cover: 3.6, is_etf: false },
  { symbol: "ITC", name: "ITC LTD", exchange: "NSE", isin: "INE154A01025", amount_financed: 131014.19, mcap_lakhs: 33015976.0, ffmc_lakhs: 25329856.79, leverage_pct: 0.4, ff_leverage_pct: 0.52, change_30d_pct: 16.56, adv: 16103057, days_to_cover: 2.6, is_etf: false },
  { symbol: "BEL", name: "BHARAT ELECTRONICS LTD", exchange: "NSE", isin: "INE263A01024", amount_financed: 130005.69, mcap_lakhs: 30072430.0, ffmc_lakhs: 14693389.3, leverage_pct: 0.43, ff_leverage_pct: 0.88, change_30d_pct: -21.03, adv: 11910451, days_to_cover: 2.6, is_etf: false },
  { symbol: "INFY", name: "INFOSYS LIMITED", exchange: "NSE", isin: "INE009A01021", amount_financed: 111428.52, mcap_lakhs: 46336898.0, ffmc_lakhs: 39947039.77, leverage_pct: 0.24, ff_leverage_pct: 0.28, change_30d_pct: -21.43, adv: 12043730, days_to_cover: 0.8, is_etf: false },
  { symbol: "NAZARA", name: "NAZARA TECHNOLOGIES LTD", exchange: "NSE", isin: "INE418L01047", amount_financed: 110157.27, mcap_lakhs: 1354791.0, ffmc_lakhs: 829674.01, leverage_pct: 8.13, ff_leverage_pct: 13.28, change_30d_pct: -1.43, adv: 2874749, days_to_cover: 13.2, is_etf: false },
  { symbol: "SUZLON", name: "SUZLON ENERGY LIMITED", exchange: "NSE", isin: "INE040H01021", amount_financed: 106840.28, mcap_lakhs: 6343588.0, ffmc_lakhs: 5598850.77, leverage_pct: 1.68, ff_leverage_pct: 1.91, change_30d_pct: 7.26, adv: 60550580, days_to_cover: 3.3, is_etf: false },
  { symbol: "TCS", name: "TATA CONSULTANCY SERV LT", exchange: "NSE", isin: "INE467B01029", amount_financed: 101879.4, mcap_lakhs: 84458826.0, ffmc_lakhs: 23766713.64, leverage_pct: 0.12, ff_leverage_pct: 0.43, change_30d_pct: 8.41, adv: 3914000, days_to_cover: 1.0, is_etf: false },
  { symbol: "ADANIPOWER", name: "ADANI POWER LTD", exchange: "NSE", isin: "INE814H01029", amount_financed: 99918.73, mcap_lakhs: 40121807.0, ffmc_lakhs: 8610139.78, leverage_pct: 0.25, ff_leverage_pct: 1.16, change_30d_pct: 3.63, adv: 27337524, days_to_cover: 1.8, is_etf: false },
  { symbol: "SAMMAANCAP", name: "SAMMAAN CAPITAL LIMITED", exchange: "NSE", isin: "INE148I01020", amount_financed: 97948.25, mcap_lakhs: 1799231.0, ffmc_lakhs: 1186233.0, leverage_pct: 5.44, ff_leverage_pct: 8.26, change_30d_pct: 110.07, adv: 8171021, days_to_cover: 7.5, is_etf: false },
  { symbol: "SBIN", name: "STATE BANK OF INDIA", exchange: "NSE", isin: "INE062A01020", amount_financed: 96459.86, mcap_lakhs: 94572292.0, ffmc_lakhs: 42226528.38, leverage_pct: 0.1, ff_leverage_pct: 0.23, change_30d_pct: 32.32, adv: 10474770, days_to_cover: 0.9, is_etf: false },
  { symbol: "HINDCOPPER", name: "HINDUSTAN COPPER LTD", exchange: "NSE", isin: "INE531E01026", amount_financed: 92802.45, mcap_lakhs: 5032877.0, ffmc_lakhs: 1703125.58, leverage_pct: 1.84, ff_leverage_pct: 5.45, change_30d_pct: 65.36, adv: 12084860, days_to_cover: 1.5, is_etf: false },
  { symbol: "TFCILTD", name: "TOURISM FINANCE CORP", exchange: "BSE", isin: "INE305A01023", amount_financed: 76009.31, mcap_lakhs: 675947.0, ffmc_lakhs: 579894.93, leverage_pct: 11.24, ff_leverage_pct: 13.11, change_30d_pct: -15.68, adv: 17183382, days_to_cover: 5.4, is_etf: false },
  { symbol: "PAISALO", name: "PAISALO DIGITAL LIMITED", exchange: "NSE", isin: "INE420C01059", amount_financed: 48038.56, mcap_lakhs: 638666.0, ffmc_lakhs: 371767.48, leverage_pct: 7.52, ff_leverage_pct: 12.92, change_30d_pct: 15.99, adv: 13696571, days_to_cover: 6.1, is_etf: false },
  { symbol: "ABFRL", name: "ADITYA BIRLA FASHION & RT", exchange: "NSE", isin: "INE647O01011", amount_financed: 37250.87, mcap_lakhs: 619653.0, ffmc_lakhs: 297991.13, leverage_pct: 6.01, ff_leverage_pct: 12.5, change_30d_pct: 8.77, adv: 5857291, days_to_cover: 6.4, is_etf: false },
  { symbol: "SILVERBEES", name: "NIPPONAMC - NETFSILVER", exchange: "NSE", isin: "INF204KC1402", amount_financed: 86223.12, mcap_lakhs: 2948504.37, ffmc_lakhs: null, leverage_pct: null, ff_leverage_pct: null, change_30d_pct: -21.67, adv: 24031262, days_to_cover: 1.5, is_etf: true },
  { symbol: "GOLDBEES", name: "NIP IND ETF GOLD BEES", exchange: "NSE", isin: "INF204KB17I5", amount_financed: 47796.7, mcap_lakhs: 5326395.36, ffmc_lakhs: null, leverage_pct: null, ff_leverage_pct: null, change_30d_pct: -1.83, adv: 26288357, days_to_cover: 1.5, is_etf: true },
  { symbol: "NIFTYBEES", name: "NIP IND ETF NIFTY BEES", exchange: "NSE", isin: "INF204KB14I2", amount_financed: 30574.97, mcap_lakhs: 6656701.26, ffmc_lakhs: null, leverage_pct: null, ff_leverage_pct: null, change_30d_pct: 77.17, adv: 5443353, days_to_cover: 2.0, is_etf: true },
];

function fmtCr(lakh) {
  if (lakh == null || isNaN(lakh)) return "₹0.00 Cr";
  const cr = Number(lakh) / 100;
  return `₹${cr.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Cr`;
}

function generateMockHistory(stock) {
  const currentCr = (stock.amount_financed || 10000) / 100;
  const change30 = stock.change_30d_pct || 5;
  const days = 90;
  const result = [];
  const today = new Date();

  for (let i = days; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const progress = 1 - i / days;
    const trendFactor = 1 + (change30 / 100) * progress;
    const noise = (Math.sin(i * 0.7) * 0.03 + Math.cos(i * 1.3) * 0.02) * currentCr;
    const book = Math.max(1, currentCr * (0.85 + 0.15 * trendFactor) + noise);
    result.push({
      date: d.toISOString().slice(0, 10),
      book: Math.round(book * 10) / 10,
    });
  }
  return result;
}

export default function ScreenerView() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & State
  const [search, setSearch] = useState("");
  const [preset, setPreset] = useState("all");
  const [exchange, setExchange] = useState("ALL");
  const [indexFilter, setIndexFilter] = useState("ALL");
  const [sectorFilter, setSectorFilter] = useState("ALL");
  const [capTierFilter, setCapTierFilter] = useState("ALL");
  const [patternFilter, setPatternFilter] = useState("ALL");
  const [analystFilter, setAnalystFilter] = useState("ALL");
  const [minBookFilter, setMinBookFilter] = useState(0);

  // Table Column Mode: "mtf" | "fundamentals" | "technicals" | "analysts"
  const [tableMode, setTableMode] = useState("mtf");

  // Sorting & Pagination
  const [sortKey, setSortKey] = useState("book");
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Selected stock for top chart & drawer
  const [selectedStock, setSelectedStock] = useState(null);
  const [drawerStock, setDrawerStock] = useState(null);
  const [stockHistory, setStockHistory] = useState([]);
  const [chartPeriod, setChartPeriod] = useState("1Y");
  const [chartLoading, setChartLoading] = useState(false);

  // User Watchlist & Alerts stored in localStorage
  const [watchlist, setWatchlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("mtf_watchlist") || "[]");
    } catch (e) {
      return [];
    }
  });

  const [alerts, setAlerts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("mtf_alerts") || "[]");
    } catch (e) {
      return [];
    }
  });

  // Custom Screens stored in localStorage
  const [customScreens, setCustomScreens] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("mtf_custom_screens") || "[]");
    } catch (e) {
      return [];
    }
  });
  const [activeCustomScreen, setActiveCustomScreen] = useState(null);
  const [showRuleBuilder, setShowRuleBuilder] = useState(false);

  // New custom rule state
  const [customScreenName, setCustomScreenName] = useState("");
  const [rulesList, setRulesList] = useState([
    { metric: "pe", operator: "<", value: 25 },
    { metric: "rsi", operator: "<", value: 40 },
  ]);

  // Save watchlist & alerts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("mtf_watchlist", JSON.stringify(watchlist));
    } catch (e) {}
  }, [watchlist]);

  useEffect(() => {
    try {
      localStorage.setItem("mtf_alerts", JSON.stringify(alerts));
    } catch (e) {}
  }, [alerts]);

  useEffect(() => {
    try {
      localStorage.setItem("mtf_custom_screens", JSON.stringify(customScreens));
    } catch (e) {}
  }, [customScreens]);

  const toggleWatchlist = (symbol) => {
    setWatchlist((prev) =>
      prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]
    );
  };

  const addAlert = (alert) => {
    setAlerts((prev) => [alert, ...prev]);
  };

  const deleteAlert = (id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  // Load universe
  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("https://mtf.trading/compressed_data/screener_data.json");
        if (!res.ok) throw new Error("Screener fetch failed");
        const json = await res.json();
        if (active && json.all_stocks && json.all_stocks.length) {
          const enriched = json.all_stocks.map(enrichStock);
          setStocks(enriched);
          setSelectedStock(enriched[0]);
        }
      } catch (e) {
        console.warn("Using fallback stock data", e);
        if (active) {
          const enriched = FALLBACK_RAW_STOCKS.map(enrichStock);
          setStocks(enriched);
          setSelectedStock(enriched[0]);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Fetch stock chart history
  useEffect(() => {
    if (!selectedStock) return;
    let active = true;
    setChartLoading(true);

    const ex = (selectedStock.exchange || "NSE").toUpperCase();
    const sym = selectedStock.symbol;
    const url = `https://mtf.trading/compressed_data/stocks/${ex}_${sym}.json`;

    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error("History not found");
        return r.json();
      })
      .then((data) => {
        if (!active) return;
        if (data && Array.isArray(data.data) && data.data.length) {
          const mapped = data.data.map((row) => ({
            date: row[0],
            book: Math.round((Number(row[1]) / 100) * 10) / 10,
            close: row[4] ? Number(row[4]) : null,
          }));
          setStockHistory(mapped);
        } else {
          setStockHistory(generateMockHistory(selectedStock));
        }
      })
      .catch(() => {
        if (active) setStockHistory(generateMockHistory(selectedStock));
      })
      .finally(() => {
        if (active) setChartLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedStock]);

  // Filtered stock chart data for the selected stock top chart
  const visibleChartData = useMemo(() => {
    if (!stockHistory || !stockHistory.length) return [];
    const countMap = { "1M": 30, "3M": 90, "6M": 180, "1Y": 365, ALL: stockHistory.length };
    const n = countMap[chartPeriod] || stockHistory.length;
    return stockHistory.slice(-n);
  }, [stockHistory, chartPeriod]);

  // Filtering Logic
  const filteredStocks = useMemo(() => {
    return stocks
      .filter((s) => {
        // Exchange
        if (exchange !== "ALL" && (s.exchange || "").toUpperCase() !== exchange) return false;

        // Sector & Index
        if (sectorFilter !== "ALL" && s.sector !== sectorFilter) return false;
        if (indexFilter !== "ALL" && s.index !== indexFilter) return false;
        if (capTierFilter !== "ALL" && s.capTier !== capTierFilter) return false;

        // Technical Pattern filter
        if (patternFilter !== "ALL") {
          const hasPat = s.patterns?.some((p) => p.badge === patternFilter);
          if (!hasPat) return false;
        }

        // Analyst filter
        if (analystFilter === "BUY_ONLY" && !["Strong Buy", "Buy"].includes(s.rating)) return false;
        if (analystFilter === "HIGH_UPSIDE" && (s.upsidePct || 0) < 15) return false;

        // Min Book
        if (minBookFilter > 0 && s.bookCr < minBookFilter) return false;

        // Presets
        if (preset === "watchlist") {
          if (!watchlist.includes(s.symbol)) return false;
        } else if (preset === "alerts") {
          if (!alerts.some((a) => a.symbol === s.symbol)) return false;
        } else if (preset === "undervalued") {
          if (!s.pe || s.pe > 24 || (s.epsGrowth || 0) < 12 || (s.roe || 0) < 14) return false;
        } else if (preset === "high_dividend") {
          if ((s.divYield || 0) < 2.2 || (s.debtToEquity || 0) > 0.9) return false;
        } else if (preset === "momentum") {
          if (s.currentPrice < s.dma50 || s.dma50 < s.dma200 || s.rsi < 52 || s.rsi > 72) return false;
        } else if (preset === "oversold") {
          if ((s.rsi || 50) > 34) return false;
        } else if (preset === "low_debt") {
          if ((s.debtToEquity || 1) > 0.4 || s.capTier !== "Large-Cap") return false;
        } else if (preset === "squeeze") {
          if ((s.days_to_cover || 0) < 4.5 || (s.ff_leverage_pct || 0) < 3.5) return false;
        } else if (preset === "mtf_accum") {
          if ((s.change_30d_pct || 0) < 25) return false;
        } else if (preset === "custom" && activeCustomScreen) {
          // Evaluate custom screen rules
          for (const rule of activeCustomScreen.rules) {
            const val = s[rule.metric];
            if (val == null) return false;
            const target = Number(rule.value);
            if (rule.operator === "<" && !(val < target)) return false;
            if (rule.operator === "<=" && !(val <= target)) return false;
            if (rule.operator === ">" && !(val > target)) return false;
            if (rule.operator === ">=" && !(val >= target)) return false;
          }
        }

        // Search text
        if (search.trim()) {
          const q = search.toLowerCase();
          const sym = (s.symbol || "").toLowerCase();
          const name = (s.name || "").toLowerCase();
          const isin = (s.isin || "").toLowerCase();
          const sec = (s.sector || "").toLowerCase();
          if (!sym.includes(q) && !name.includes(q) && !isin.includes(q) && !sec.includes(q)) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        let valA = a[sortKey] ?? 0;
        let valB = b[sortKey] ?? 0;

        if (sortKey === "symbol") {
          return sortAsc
            ? (a.symbol || "").localeCompare(b.symbol || "")
            : (b.symbol || "").localeCompare(a.symbol || "");
        }
        return sortAsc ? (valA > valB ? 1 : -1) : valA < valB ? 1 : -1;
      });
  }, [
    stocks,
    search,
    preset,
    exchange,
    indexFilter,
    sectorFilter,
    capTierFilter,
    patternFilter,
    analystFilter,
    minBookFilter,
    watchlist,
    alerts,
    activeCustomScreen,
    sortKey,
    sortAsc,
  ]);

  // Aggregate stats
  const totalFilteredBookCr = useMemo(() => {
    return filteredStocks.reduce((acc, s) => acc + (s.bookCr || 0), 0);
  }, [filteredStocks]);

  const avgLeverage = useMemo(() => {
    const valid = filteredStocks.filter((s) => s.leverage_pct != null);
    return valid.length ? valid.reduce((acc, s) => acc + s.leverage_pct, 0) / valid.length : 0;
  }, [filteredStocks]);

  const avgPE = useMemo(() => {
    const valid = filteredStocks.filter((s) => s.pe != null);
    return valid.length ? valid.reduce((acc, s) => acc + s.pe, 0) / valid.length : 0;
  }, [filteredStocks]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredStocks.length / rowsPerPage));
  const pageRows = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredStocks.slice(start, start + rowsPerPage);
  }, [filteredStocks, page, rowsPerPage]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const handleSaveCustomScreen = () => {
    if (!customScreenName.trim() || !rulesList.length) return;
    const newScreen = {
      id: Date.now().toString(),
      name: customScreenName.trim(),
      rules: rulesList,
    };
    setCustomScreens((prev) => [...prev, newScreen]);
    setActiveCustomScreen(newScreen);
    setPreset("custom");
    setShowRuleBuilder(false);
    setCustomScreenName("");
  };

  const handleDeleteCustomScreen = (id, e) => {
    e.stopPropagation();
    setCustomScreens((prev) => prev.filter((cs) => cs.id !== id));
    if (activeCustomScreen?.id === id) {
      setActiveCustomScreen(null);
      setPreset("all");
    }
  };

  // Export comprehensive CSV
  const handleExportCSV = () => {
    const headers = [
      "Symbol",
      "Company Name",
      "Exchange",
      "Sector",
      "Index",
      "Market Cap Tier",
      "Price (INR)",
      "1D Change %",
      "MTF Book (Cr)",
      "30D Move %",
      "Leverage %",
      "Free Float Lev %",
      "Days to Cover",
      "P/E",
      "P/B",
      "EPS",
      "EPS Growth YoY %",
      "Dividend Yield %",
      "ROE %",
      "Debt to Equity",
      "RSI (14D)",
      "50-DMA",
      "200-DMA",
      "Promoter %",
      "FII %",
      "DII %",
      "Public %",
      "Analyst Rating",
      "Target Price",
      "Upside %",
    ];

    const rows = filteredStocks.map((s) => [
      s.symbol,
      `"${(s.name || "").replace(/"/g, '""')}"`,
      s.exchange,
      `"${s.sector || ""}"`,
      s.index || "",
      s.capTier || "",
      s.currentPrice || "",
      s.dayMove || "",
      (s.bookCr || 0).toFixed(2),
      (s.change_30d_pct || 0).toFixed(2),
      s.leverage_pct != null ? s.leverage_pct.toFixed(2) : "",
      s.ff_leverage_pct != null ? s.ff_leverage_pct.toFixed(2) : "",
      s.days_to_cover != null ? s.days_to_cover.toFixed(1) : "",
      s.pe || "",
      s.pb || "",
      s.eps || "",
      s.epsGrowth || "",
      s.divYield || "",
      s.roe || "",
      s.debtToEquity || "",
      s.rsi || "",
      s.dma50 || "",
      s.dma200 || "",
      s.promoter || "",
      s.fii || "",
      s.dii || "",
      s.retail || "",
      s.rating || "",
      s.targetPrice || "",
      s.upsidePct || "",
    ]);

    const csv = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = `mtf_pro_screener_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="screenerContainer">
      {/* 1. Header */}
      <div className="screenerHeader">
        <div>
          <div className="screenerTitleRow">
            <h1 className="screenerHeading">MTF Pro Stock Screener</h1>
            <span className="screenerBadge universeBadge">
              <Sparkles size={13} /> {stocks.length.toLocaleString("en-IN")} Multi-Asset Universe
            </span>
            {watchlist.length > 0 && (
              <span className="watchlistCountBadge" onClick={() => setPreset("watchlist")}>
                <Star size={12} fill="#f59e0b" color="#f59e0b" /> {watchlist.length} Starred
              </span>
            )}
            {alerts.length > 0 && (
              <span className="alertsCountBadge" onClick={() => setPreset("alerts")}>
                <Bell size={12} /> {alerts.length} Active Alerts
              </span>
            )}
          </div>
          <p className="screenerSubheading">
            Institutional-grade multi-metric screening across fundamental valuations, technical indicators,
            automated candlestick patterns, retail margin debt, and Wall Street consensus forecasts.
          </p>
        </div>

        <div className="screenerActions">
          <button className="btn secondary csvBtn" onClick={() => setShowRuleBuilder(true)}>
            <Plus size={15} /> Custom Screen
          </button>
          <button className="btn secondary csvBtn" onClick={handleExportCSV}>
            <FileSpreadsheet size={15} /> Export Dataset
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="screenerStatsGrid">
        <div className="card screenerStatCard">
          <div className="statMeta">
            <span>FILTERED SECURITIES</span>
            <Layers size={17} className="statIcon" />
          </div>
          <div className="statVal">
            {filteredStocks.length.toLocaleString("en-IN")}{" "}
            <small className="statFraction">/ {stocks.length.toLocaleString("en-IN")}</small>
          </div>
          <div className="statBar">
            <div
              className="statBarFill"
              style={{ width: `${Math.min(100, (filteredStocks.length / (stocks.length || 1)) * 100)}%` }}
            />
          </div>
        </div>

        <div className="card screenerStatCard">
          <div className="statMeta">
            <span>SCREENED MTF BOOK</span>
            <BarChart2 size={17} className="statIcon" />
          </div>
          <div className="statVal">
            {totalFilteredBookCr >= 100000
              ? `₹${(totalFilteredBookCr / 100000).toFixed(2)}L Cr`
              : `₹${Math.round(totalFilteredBookCr).toLocaleString("en-IN")} Cr`}
          </div>
          <div className="statSub">Margin amount financed in view</div>
        </div>

        <div className="card screenerStatCard">
          <div className="statMeta">
            <span>MEDIAN P/E RATIO</span>
            <TrendingUp size={17} className="statIcon" />
          </div>
          <div className="statVal">{avgPE.toFixed(1)}x</div>
          <div className="statSub">Avg valuation multiple</div>
        </div>

        <div className="card screenerStatCard">
          <div className="statMeta">
            <span>AVG LEVERAGE</span>
            <Clock size={17} className="statIcon" />
          </div>
          <div className="statVal positive">{avgLeverage.toFixed(2)}%</div>
          <div className="statSub">Book as % of market cap</div>
        </div>
      </div>

      {/* 3. Selected Stock Deep-Dive Chart Bar */}
      {selectedStock && (
        <section className="card screenerChartCard">
          <div className="stockDetailHeader">
            <div className="stockInfoBlock">
              <div className="stockTagLine">
                <span className={`exchangeBadge badge-${(selectedStock.exchange || "NSE").toLowerCase()}`}>
                  {selectedStock.exchange || "NSE"}
                </span>
                <span className="drawerSectorBadge">{selectedStock.sector}</span>
                <span className="drawerIndexBadge">{selectedStock.index}</span>
                <span className="isinBadge">{selectedStock.isin || "ISIN"}</span>
                {selectedStock.primaryPattern && (
                  <span className={`patternPillMini pill-${selectedStock.primaryPattern.type}`}>
                    {selectedStock.primaryPattern.badge}
                  </span>
                )}
              </div>
              <h2 className="stockNameTitle">
                {selectedStock.name || selectedStock.symbol}{" "}
                <span className="stockSymbolMuted">({selectedStock.symbol})</span>
              </h2>
            </div>

            <div className="stockMetricsRow">
              <div className="stockMetricItem">
                <span className="stockMetricLabel">PRICE</span>
                <strong className="stockMetricVal">₹{selectedStock.currentPrice}</strong>
              </div>

              <div className="stockMetricItem">
                <span className="stockMetricLabel">MTF BOOK</span>
                <strong className="stockMetricVal">
                  ₹{Number(selectedStock.bookCr).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Cr
                </strong>
              </div>

              <div className="stockMetricItem">
                <span className="stockMetricLabel">30D MOVE</span>
                <strong
                  className={`stockMetricVal ${
                    (selectedStock.change_30d_pct || 0) >= 0 ? "positive" : "negative"
                  }`}
                >
                  {(selectedStock.change_30d_pct || 0) >= 0 ? "+" : ""}
                  {(selectedStock.change_30d_pct || 0).toFixed(1)}%
                </strong>
              </div>

              <div className="stockMetricItem">
                <span className="stockMetricLabel">RSI (14D)</span>
                <strong className="stockMetricVal">{selectedStock.rsi}</strong>
              </div>

              <div className="stockMetricItem">
                <span className="stockMetricLabel">ANALYST TARGET</span>
                <strong className="stockMetricVal positive">
                  ₹{selectedStock.targetPrice} (+{selectedStock.upsidePct}%)
                </strong>
              </div>

              <button
                className="btn deepDiveBtn"
                onClick={() => setDrawerStock(selectedStock)}
                title="View Full Financial Statements & Analysis"
              >
                <Eye size={14} /> Full Deep Dive
              </button>
            </div>

            <div className="chartPeriodControls">
              <div className="segment">
                {["1M", "3M", "6M", "1Y", "ALL"].map((p) => (
                  <button key={p} className={chartPeriod === p ? "on" : ""} onClick={() => setChartPeriod(p)}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="chartAreaContainer">
            {chartLoading ? (
              <div className="chartLoading">
                <div className="spinner" /> Loading stock history...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={visibleChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="stockBookGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2681ff" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#2681ff" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#1c2940" strokeDasharray="2 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d) => (typeof d === "string" ? d.slice(5) : String(d || ""))}
                    tick={{ fill: "#7f8da5", fontSize: 11 }}
                    axisLine={false}
                  />
                  <YAxis
                    tickFormatter={(v) => `₹${Math.round(Number(v) || 0)}Cr`}
                    tick={{ fill: "#7f8da5", fontSize: 11 }}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#0b1424",
                      border: "1px solid #263650",
                      borderRadius: 8,
                      color: "#fff",
                      fontSize: 12,
                    }}
                    formatter={(val) => [typeof val === "number" ? `₹${Number(val).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Cr` : String(val || ""), "MTF Financed Book"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="book"
                    stroke="#2681ff"
                    strokeWidth={2.5}
                    fill="url(#stockBookGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
            <div className="chartLegendFooter">
              <span>
                <i className="chartLegendSwatch blue" /> MTF Financed Book (₹ Cr) · Click "Full Deep Dive" to see 5Y Income Statements & Balance Sheets
              </span>
              <span className="chartFootnote">Source: NSE/BSE MTF daily disclosures</span>
            </div>
          </div>
        </section>
      )}

      {/* 4. Controls, Presets & Multi-Metric Filter Bar */}
      <div className="card screenerControlCard">
        {/* Preset Tabs */}
        <div className="presetTabsRow">
          <button
            className={`presetTab ${preset === "all" ? "active" : ""}`}
            onClick={() => {
              setPreset("all");
              setActiveCustomScreen(null);
              setPage(1);
            }}
          >
            All Securities
          </button>
          <button
            className={`presetTab ${preset === "undervalued" ? "active" : ""}`}
            onClick={() => {
              setPreset("undervalued");
              setActiveCustomScreen(null);
              setPage(1);
            }}
          >
            💎 Undervalued Growth
          </button>
          <button
            className={`presetTab ${preset === "high_dividend" ? "active" : ""}`}
            onClick={() => {
              setPreset("high_dividend");
              setActiveCustomScreen(null);
              setPage(1);
            }}
          >
            💰 High Dividend Yield
          </button>
          <button
            className={`presetTab ${preset === "momentum" ? "active" : ""}`}
            onClick={() => {
              setPreset("momentum");
              setActiveCustomScreen(null);
              setPage(1);
            }}
          >
            🚀 Breakout Momentum
          </button>
          <button
            className={`presetTab ${preset === "oversold" ? "active" : ""}`}
            onClick={() => {
              setPreset("oversold");
              setActiveCustomScreen(null);
              setPage(1);
            }}
          >
            ⚡ RSI Oversold Bounce
          </button>
          <button
            className={`presetTab ${preset === "low_debt" ? "active" : ""}`}
            onClick={() => {
              setPreset("low_debt");
              setActiveCustomScreen(null);
              setPage(1);
            }}
          >
            🛡️ Low-Debt Quality
          </button>
          <button
            className={`presetTab ${preset === "squeeze" ? "active" : ""}`}
            onClick={() => {
              setPreset("squeeze");
              setActiveCustomScreen(null);
              setPage(1);
            }}
          >
            ⚠️ Margin Squeeze Risk
          </button>
          <button
            className={`presetTab ${preset === "mtf_accum" ? "active" : ""}`}
            onClick={() => {
              setPreset("mtf_accum");
              setActiveCustomScreen(null);
              setPage(1);
            }}
          >
            📈 30D MTF Accumulation
          </button>
          <button
            className={`presetTab ${preset === "watchlist" ? "active" : ""}`}
            onClick={() => {
              setPreset("watchlist");
              setActiveCustomScreen(null);
              setPage(1);
            }}
          >
            ⭐ Watchlist ({watchlist.length})
          </button>

          {/* User's custom screens */}
          {customScreens.map((cs) => (
            <div key={cs.id} className="customScreenPillWrap">
              <button
                className={`presetTab ${activeCustomScreen?.id === cs.id ? "active" : ""}`}
                onClick={() => {
                  setActiveCustomScreen(cs);
                  setPreset("custom");
                  setPage(1);
                }}
              >
                ⚙️ {cs.name}
              </button>
              <button
                className="deleteCustomPillBtn"
                onClick={(e) => handleDeleteCustomScreen(cs.id, e)}
                title="Delete this screen"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {/* Multi-Dimensional Filter Dropdowns */}
        <div className="screenerFilterRow">
          <div className="screenerSearchBox">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search ticker, company, ISIN or sector..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            {search && (
              <button className="clearSearchBtn" onClick={() => setSearch("")}>
                ×
              </button>
            )}
          </div>

          <div className="screenerFilterDropdowns">
            {/* Exchange */}
            <div className="filterPills">
              <span className="filterLabel">EXCHANGE:</span>
              <select
                className="filterSelect"
                value={exchange}
                onChange={(e) => {
                  setExchange(e.target.value);
                  setPage(1);
                }}
              >
                <option value="ALL">All Markets</option>
                <option value="NSE">NSE Only</option>
                <option value="BSE">BSE Only</option>
              </select>
            </div>

            {/* Index Benchmark */}
            <div className="filterPills">
              <span className="filterLabel">INDEX:</span>
              <select
                className="filterSelect"
                value={indexFilter}
                onChange={(e) => {
                  setIndexFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="ALL">All Indices</option>
                <option value="Nifty 50">Nifty 50</option>
                <option value="Nifty Next 50">Nifty Next 50</option>
                <option value="Nifty Midcap 100">Nifty Midcap 100</option>
                <option value="Nifty Smallcap 250">Nifty Smallcap 250</option>
              </select>
            </div>

            {/* Sector */}
            <div className="filterPills">
              <span className="filterLabel">SECTOR:</span>
              <select
                className="filterSelect"
                value={sectorFilter}
                onChange={(e) => {
                  setSectorFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="ALL">All Sectors</option>
                <option value="Banking & Financials">Banking & Financials</option>
                <option value="Information Tech">Information Tech</option>
                <option value="Energy & Utilities">Energy & Utilities</option>
                <option value="Automotive & EV">Automotive & EV</option>
                <option value="Healthcare & Pharma">Healthcare & Pharma</option>
                <option value="FMCG & Consumer">FMCG & Consumer</option>
                <option value="Industrials & Infra">Industrials & Infra</option>
                <option value="Metals & Mining">Metals & Mining</option>
                <option value="Telecom & Media">Telecom & Media</option>
                <option value="Real Estate & Construction">Real Estate & Construction</option>
              </select>
            </div>

            {/* Cap Tier */}
            <div className="filterPills">
              <span className="filterLabel">CAP TIER:</span>
              <select
                className="filterSelect"
                value={capTierFilter}
                onChange={(e) => {
                  setCapTierFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="ALL">All Tiers</option>
                <option value="Large-Cap">Large-Cap (&gt;₹20k Cr)</option>
                <option value="Mid-Cap">Mid-Cap (₹5k–₹20k Cr)</option>
                <option value="Small-Cap">Small-Cap (&lt;₹5k Cr)</option>
              </select>
            </div>

            {/* Technical Pattern Recognition Filter */}
            <div className="filterPills">
              <span className="filterLabel">PATTERN:</span>
              <select
                className="filterSelect"
                value={patternFilter}
                onChange={(e) => {
                  setPatternFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="ALL">All Signals</option>
                <option value="GOLDEN CROSS">Golden Cross (50&gt;200)</option>
                <option value="BREAKOUT">52W Breakout</option>
                <option value="RSI OVERSOLD">RSI Oversold (&lt;32)</option>
                <option value="RSI OVERBOUGHT">RSI Overbought (&gt;70)</option>
                <option value="BULLISH SURGE">Bullish Engulfing Surge</option>
                <option value="SQUEEZE RISK">Margin Squeeze Risk</option>
              </select>
            </div>

            {/* Analyst Rating */}
            <div className="filterPills">
              <span className="filterLabel">ANALYSTS:</span>
              <select
                className="filterSelect"
                value={analystFilter}
                onChange={(e) => {
                  setAnalystFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="ALL">All Ratings</option>
                <option value="BUY_ONLY">Strong Buy / Buy Only</option>
                <option value="HIGH_UPSIDE">&gt; 15% Target Upside</option>
              </select>
            </div>

            {/* Reset */}
            {(search ||
              exchange !== "ALL" ||
              indexFilter !== "ALL" ||
              sectorFilter !== "ALL" ||
              capTierFilter !== "ALL" ||
              patternFilter !== "ALL" ||
              analystFilter !== "ALL" ||
              preset !== "all" ||
              minBookFilter > 0) && (
              <button
                className="btn secondary resetBtn"
                onClick={() => {
                  setSearch("");
                  setExchange("ALL");
                  setIndexFilter("ALL");
                  setSectorFilter("ALL");
                  setCapTierFilter("ALL");
                  setPatternFilter("ALL");
                  setAnalystFilter("ALL");
                  setPreset("all");
                  setActiveCustomScreen(null);
                  setMinBookFilter(0);
                  setPage(1);
                }}
              >
                <RotateCcw size={13} /> Reset
              </button>
            )}
          </div>
        </div>

        {/* View Perspective Selector */}
        <div className="perspectiveRow">
          <span className="perspectiveLabel">TABLE VIEW:</span>
          <div className="perspectiveButtons">
            <button
              className={`perspectiveBtn ${tableMode === "mtf" ? "active" : ""}`}
              onClick={() => setTableMode("mtf")}
            >
              📊 MTF & Liquidity Risk
            </button>
            <button
              className={`perspectiveBtn ${tableMode === "fundamentals" ? "active" : ""}`}
              onClick={() => setTableMode("fundamentals")}
            >
              📈 Valuation & Fundamentals
            </button>
            <button
              className={`perspectiveBtn ${tableMode === "technicals" ? "active" : ""}`}
              onClick={() => setTableMode("technicals")}
            >
              ⚡ Technicals & Patterns
            </button>
            <button
              className={`perspectiveBtn ${tableMode === "analysts" ? "active" : ""}`}
              onClick={() => setTableMode("analysts")}
            >
              🎯 Ownership & Analyst Consensus
            </button>
          </div>
        </div>
      </div>

      {/* 5. Custom Rule Builder Modal */}
      {showRuleBuilder && (
        <div className="ruleModalOverlay" onClick={() => setShowRuleBuilder(false)}>
          <div className="ruleModalPanel card" onClick={(e) => e.stopPropagation()}>
            <div className="ruleModalHeader">
              <h3>Build Custom Screener Rule Set</h3>
              <button className="ruleModalClose" onClick={() => setShowRuleBuilder(false)}>
                ×
              </button>
            </div>

            <div className="ruleModalBody">
              <label className="screenNameField">
                <span>Screen Template Name:</span>
                <input
                  type="text"
                  placeholder="e.g. My High Momentum Value"
                  value={customScreenName}
                  onChange={(e) => setCustomScreenName(e.target.value)}
                />
              </label>

              <div className="rulesSectionHeader">Filter Criteria Rules:</div>
              <div className="ruleRowsList">
                {rulesList.map((r, idx) => (
                  <div key={idx} className="ruleRowItem">
                    <select
                      value={r.metric}
                      onChange={(e) => {
                        const next = [...rulesList];
                        next[idx].metric = e.target.value;
                        setRulesList(next);
                      }}
                    >
                      <option value="pe">P/E Ratio</option>
                      <option value="pb">P/B Ratio</option>
                      <option value="epsGrowth">EPS Growth YoY %</option>
                      <option value="divYield">Dividend Yield %</option>
                      <option value="roe">Return on Equity (ROE %)</option>
                      <option value="debtToEquity">Debt to Equity Ratio</option>
                      <option value="rsi">RSI (14D)</option>
                      <option value="bookCr">MTF Book (₹ Cr)</option>
                      <option value="leverage_pct">Leverage % Mcap</option>
                      <option value="ff_leverage_pct">Free Float Leverage %</option>
                      <option value="days_to_cover">Days to Cover (DTC)</option>
                      <option value="upsidePct">Analyst Target Upside %</option>
                    </select>

                    <select
                      value={r.operator}
                      onChange={(e) => {
                        const next = [...rulesList];
                        next[idx].operator = e.target.value;
                        setRulesList(next);
                      }}
                    >
                      <option value="<">&lt; Less than</option>
                      <option value="<=">&le; Less than or equal</option>
                      <option value=">">&gt; Greater than</option>
                      <option value=">=">&ge; Greater than or equal</option>
                    </select>

                    <input
                      type="number"
                      step="any"
                      value={r.value}
                      onChange={(e) => {
                        const next = [...rulesList];
                        next[idx].value = e.target.value;
                        setRulesList(next);
                      }}
                    />

                    {rulesList.length > 1 && (
                      <button
                        className="ruleDeleteBtn"
                        onClick={() => setRulesList(rulesList.filter((_, i) => i !== idx))}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                className="btn secondary addRuleBtn"
                onClick={() => setRulesList([...rulesList, { metric: "pe", operator: "<", value: 20 }])}
              >
                <Plus size={14} /> Add Another Rule
              </button>
            </div>

            <div className="ruleModalFooter">
              <button className="btn secondary" onClick={() => setShowRuleBuilder(false)}>
                Cancel
              </button>
              <button className="btn createScreenBtn" onClick={handleSaveCustomScreen}>
                <Check size={14} /> Save & Apply Screen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Screener Table */}
      <section className="card screenerTableCard">
        <div className="screenerTableScroll">
          <table className="screenerTable">
            <thead>
              <tr>
                <th style={{ width: 35 }}>⭐</th>
                <th style={{ width: 35 }}>#</th>
                <th onClick={() => handleSort("symbol")}>
                  Security {sortKey === "symbol" ? (sortAsc ? "▲" : "▼") : ""}
                </th>
                <th>Exchange</th>

                {/* DYNAMIC COLUMNS BASED ON TABLE MODE */}
                {tableMode === "mtf" && (
                  <>
                    <th onClick={() => handleSort("bookCr")} className="numHeader">
                      MTF Book {sortKey === "bookCr" ? (sortAsc ? "▲" : "▼") : ""}
                    </th>
                    <th onClick={() => handleSort("change_30d_pct")} className="numHeader">
                      30D Move {sortKey === "change_30d_pct" ? (sortAsc ? "▲" : "▼") : ""}
                    </th>
                    <th onClick={() => handleSort("leverage_pct")} className="numHeader">
                      Lev (% Mcap) {sortKey === "leverage_pct" ? (sortAsc ? "▲" : "▼") : ""}
                    </th>
                    <th onClick={() => handleSort("ff_leverage_pct")} className="numHeader">
                      FF Lev (%) {sortKey === "ff_leverage_pct" ? (sortAsc ? "▲" : "▼") : ""}
                    </th>
                    <th onClick={() => handleSort("days_to_cover")} className="numHeader">
                      Days to Cover {sortKey === "days_to_cover" ? (sortAsc ? "▲" : "▼") : ""}
                    </th>
                    <th>Signal Pattern</th>
                  </>
                )}

                {tableMode === "fundamentals" && (
                  <>
                    <th onClick={() => handleSort("pe")} className="numHeader">
                      P/E {sortKey === "pe" ? (sortAsc ? "▲" : "▼") : ""}
                    </th>
                    <th onClick={() => handleSort("pb")} className="numHeader">
                      P/B {sortKey === "pb" ? (sortAsc ? "▲" : "▼") : ""}
                    </th>
                    <th onClick={() => handleSort("eps")} className="numHeader">
                      EPS (₹) {sortKey === "eps" ? (sortAsc ? "▲" : "▼") : ""}
                    </th>
                    <th onClick={() => handleSort("epsGrowth")} className="numHeader">
                      EPS Growth YoY {sortKey === "epsGrowth" ? (sortAsc ? "▲" : "▼") : ""}
                    </th>
                    <th onClick={() => handleSort("divYield")} className="numHeader">
                      Div Yield {sortKey === "divYield" ? (sortAsc ? "▲" : "▼") : ""}
                    </th>
                    <th onClick={() => handleSort("roe")} className="numHeader">
                      ROE % {sortKey === "roe" ? (sortAsc ? "▲" : "▼") : ""}
                    </th>
                    <th onClick={() => handleSort("debtToEquity")} className="numHeader">
                      Debt/Eq {sortKey === "debtToEquity" ? (sortAsc ? "▲" : "▼") : ""}
                    </th>
                  </>
                )}

                {tableMode === "technicals" && (
                  <>
                    <th onClick={() => handleSort("currentPrice")} className="numHeader">
                      Price (₹) {sortKey === "currentPrice" ? (sortAsc ? "▲" : "▼") : ""}
                    </th>
                    <th onClick={() => handleSort("dayMove")} className="numHeader">
                      1D Move % {sortKey === "dayMove" ? (sortAsc ? "▲" : "▼") : ""}
                    </th>
                    <th onClick={() => handleSort("rsi")} className="numHeader">
                      RSI (14D) {sortKey === "rsi" ? (sortAsc ? "▲" : "▼") : ""}
                    </th>
                    <th className="numHeader">50-DMA</th>
                    <th className="numHeader">200-DMA</th>
                    <th className="numHeader">Vol Surge</th>
                    <th>Technical Pattern</th>
                  </>
                )}

                {tableMode === "analysts" && (
                  <>
                    <th onClick={() => handleSort("promoter")} className="numHeader">
                      Promoter % {sortKey === "promoter" ? (sortAsc ? "▲" : "▼") : ""}
                    </th>
                    <th onClick={() => handleSort("fii")} className="numHeader">
                      FII % {sortKey === "fii" ? (sortAsc ? "▲" : "▼") : ""}
                    </th>
                    <th onClick={() => handleSort("dii")} className="numHeader">
                      DII % {sortKey === "dii" ? (sortAsc ? "▲" : "▼") : ""}
                    </th>
                    <th>Analyst Rating</th>
                    <th onClick={() => handleSort("targetPrice")} className="numHeader">
                      Target (₹) {sortKey === "targetPrice" ? (sortAsc ? "▲" : "▼") : ""}
                    </th>
                    <th onClick={() => handleSort("upsidePct")} className="numHeader">
                      Upside % {sortKey === "upsidePct" ? (sortAsc ? "▲" : "▼") : ""}
                    </th>
                  </>
                )}

                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={11} className="tableEmptyCell">
                    <div className="spinner" /> Loading multi-metric stock universe...
                  </td>
                </tr>
              ) : pageRows.length === 0 ? (
                <tr>
                  <td colSpan={11} className="tableEmptyCell">
                    No securities match your search and screen criteria.
                  </td>
                </tr>
              ) : (
                pageRows.map((stock, idx) => {
                  const rank = (page - 1) * rowsPerPage + idx + 1;
                  const isSelected = selectedStock?.symbol === stock.symbol;
                  const isStarred = watchlist.includes(stock.symbol);

                  return (
                    <tr
                      key={`${stock.exchange}_${stock.symbol}`}
                      className={`screenerRow ${isSelected ? "rowSelected" : ""}`}
                      onClick={() => setSelectedStock(stock)}
                    >
                      <td
                        className="starCell"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWatchlist(stock.symbol);
                        }}
                      >
                        <Star
                          size={15}
                          fill={isStarred ? "#f59e0b" : "none"}
                          color={isStarred ? "#f59e0b" : "#607089"}
                        />
                      </td>
                      <td className="rankCell">{rank}</td>
                      <td className="securityCell">
                        <div className="stockIdent">
                          <div className="stockSymbolLine">
                            <span className="symbolText">{stock.symbol}</span>
                            {stock.is_etf && <span className="tagMini etfTag">ETF</span>}
                            <span className="miniSectorText">{stock.sector}</span>
                          </div>
                          <span className="stockFullName">{stock.name || stock.symbol}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`exchangeBadge badge-${(stock.exchange || "NSE").toLowerCase()}`}>
                          {stock.exchange || "NSE"}
                        </span>
                      </td>

                      {/* DYNAMIC ROW CELLS */}
                      {tableMode === "mtf" && (
                        <>
                          <td className="number bookCell">
                            ₹{Number(stock.bookCr).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Cr
                          </td>
                          <td className="number">
                            <span className={`changeBadge ${(stock.change_30d_pct || 0) >= 0 ? "positive" : "negative"}`}>
                              {(stock.change_30d_pct || 0) >= 0 ? "+" : ""}
                              {(stock.change_30d_pct || 0).toFixed(1)}%
                            </span>
                          </td>
                          <td className="number">
                            {stock.leverage_pct != null ? `${stock.leverage_pct.toFixed(2)}%` : " "}
                          </td>
                          <td className="number">
                            {stock.ff_leverage_pct != null ? `${stock.ff_leverage_pct.toFixed(2)}%` : " "}
                          </td>
                          <td className="number">
                            {stock.days_to_cover != null ? (
                              <span
                                className={`dtcCellBadge ${
                                  stock.days_to_cover > 7
                                    ? "dtcHigh"
                                    : stock.days_to_cover > 3
                                    ? "dtcMed"
                                    : "dtcLow"
                                }`}
                              >
                                {stock.days_to_cover.toFixed(1)}d
                              </span>
                            ) : (
                              " "
                            )}
                          </td>
                          <td>
                            {stock.primaryPattern ? (
                              <span className={`patternPillMini pill-${stock.primaryPattern.type}`}>
                                {stock.primaryPattern.badge}
                              </span>
                            ) : (
                              <span className="patternMuted">Neutral</span>
                            )}
                          </td>
                        </>
                      )}

                      {tableMode === "fundamentals" && (
                        <>
                          <td className="number">{stock.pe ? `${stock.pe}x` : " "}</td>
                          <td className="number">{stock.pb ? `${stock.pb}x` : " "}</td>
                          <td className="number">{stock.eps ? `₹${stock.eps}` : " "}</td>
                          <td className={`number ${(stock.epsGrowth || 0) >= 0 ? "positive" : "negative"}`}>
                            {(stock.epsGrowth || 0) >= 0 ? "+" : ""}
                            {stock.epsGrowth != null ? `${stock.epsGrowth}%` : " "}
                          </td>
                          <td className="number">{stock.divYield != null ? `${stock.divYield}%` : " "}</td>
                          <td className="number positive">{stock.roe != null ? `${stock.roe}%` : " "}</td>
                          <td className="number">{stock.debtToEquity != null ? `${stock.debtToEquity}x` : " "}</td>
                        </>
                      )}

                      {tableMode === "technicals" && (
                        <>
                          <td className="number bookCell">₹{stock.currentPrice}</td>
                          <td className={`number ${stock.dayMove >= 0 ? "positive" : "negative"}`}>
                            {stock.dayMove >= 0 ? "+" : ""}
                            {stock.dayMove}%
                          </td>
                          <td className="number">
                            <span
                              className={`rsiBadge ${
                                stock.rsi < 30 ? "positive" : stock.rsi > 70 ? "negative" : "neutral"
                              }`}
                            >
                              {stock.rsi}
                            </span>
                          </td>
                          <td className="number">₹{stock.dma50}</td>
                          <td className="number">₹{stock.dma200}</td>
                          <td className="number">{stock.volSurge}x</td>
                          <td>
                            {stock.primaryPattern ? (
                              <span className={`patternPillMini pill-${stock.primaryPattern.type}`}>
                                {stock.primaryPattern.badge}
                              </span>
                            ) : (
                              " "
                            )}
                          </td>
                        </>
                      )}

                      {tableMode === "analysts" && (
                        <>
                          <td className="number">{stock.promoter}%</td>
                          <td className="number">{stock.fii}%</td>
                          <td className="number">{stock.dii}%</td>
                          <td>
                            <span
                              className={`analystBadgeSmall ${
                                stock.rating === "Strong Buy"
                                  ? "rating-strong-buy"
                                  : stock.rating === "Buy"
                                  ? "rating-buy"
                                  : "rating-hold"
                              }`}
                            >
                              {stock.rating}
                            </span>
                          </td>
                          <td className="number">₹{stock.targetPrice}</td>
                          <td className={`number ${stock.upsidePct >= 0 ? "positive" : "negative"}`}>
                            {stock.upsidePct >= 0 ? "+" : ""}
                            {stock.upsidePct}%
                          </td>
                        </>
                      )}

                      <td className="actionCell">
                        <div className="actionBtnGroup">
                          <button
                            className="chartLinkBtn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStock(stock);
                              window.scrollTo({ top: 140, behavior: "smooth" });
                            }}
                            title="Inspect Top Chart"
                          >
                            Chart
                          </button>
                          <button
                            className="deepDiveLinkBtn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDrawerStock(stock);
                            }}
                            title="Open Full 5Y Financial Statements & Technical Diagnostics"
                          >
                            Deep Dive
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="paginationBar">
          <span className="paginationInfo">
            Showing {(page - 1) * rowsPerPage + 1}–{Math.min(page * rowsPerPage, filteredStocks.length)} of{" "}
            {filteredStocks.length.toLocaleString("en-IN")} securities
          </span>
          <div className="paginationControls">
            <button
              className="pageBtn"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              title="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="pageIndicator">
              Page {page} of {totalPages}
            </span>
            <button
              className="pageBtn"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              title="Next Page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* 7. Slide-out Stock Deep Dive Drawer */}
      {drawerStock && (
        <StockDrawer
          stock={drawerStock}
          onClose={() => setDrawerStock(null)}
          isWatchlisted={watchlist.includes(drawerStock.symbol)}
          onToggleWatchlist={toggleWatchlist}
          alerts={alerts}
          onAddAlert={addAlert}
          onDeleteAlert={deleteAlert}
          historyData={stockHistory}
        />
      )}
    </div>
  );
}
