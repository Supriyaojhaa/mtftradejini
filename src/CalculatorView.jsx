import React, { useState, useMemo, useEffect } from "react";
import {
  Calculator,
  Percent,
  Clock,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  AlertTriangle,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  SlidersHorizontal,
  Layers,
  CheckCircle2,
  Info,
  Activity,
  FileText,
  Building2,
  Search,
  RotateCcw,
} from "lucide-react";
import { useLiveQuotes } from "./hooks/useLiveQuotes.js";

// Popular Indian MTF Broker presets
const BROKER_PRESETS = [
  { id: "zerodha", name: "Zerodha", rate: 14.60, dailyPct: 0.0400, desc: "0.0400% per day" },
  { id: "groww", name: "Groww / Angel", rate: 14.95, dailyPct: 0.0410, desc: "0.0410% per day" },
  { id: "icici", name: "ICICI Direct", rate: 9.65, dailyPct: 0.0264, desc: "Prime Plan (0.0264%/day)" },
  { id: "dhan", name: "Dhan / Kotak", rate: 12.50, dailyPct: 0.0342, desc: "0.0342% per day" },
  { id: "custom", name: "Custom", rate: 12.00, dailyPct: 0.0329, desc: "User defined APR" },
];

// Pre-configured popular MTF stocks with typical exchange/broker haircuts
const POPULAR_STOCKS = [
  { symbol: "HDFCBANK", name: "HDFC Bank Ltd", price: 1680.45, haircut: 20, maxLev: 5.0 },
  { symbol: "RELIANCE", name: "Reliance Industries", price: 2984.60, haircut: 20, maxLev: 5.0 },
  { symbol: "BSE", name: "BSE Limited", price: 2624.10, haircut: 25, maxLev: 4.0 },
  { symbol: "INFY", name: "Infosys Limited", price: 1842.25, haircut: 20, maxLev: 5.0 },
  { symbol: "BEL", name: "Bharat Electronics", price: 312.40, haircut: 25, maxLev: 4.0 },
  { symbol: "TCS", name: "Tata Consultancy Services", price: 4215.80, haircut: 20, maxLev: 5.0 },
  { symbol: "ITC", name: "ITC Limited", price: 486.20, haircut: 20, maxLev: 5.0 },
  { symbol: "JIOFIN", name: "Jio Financial Services", price: 342.15, haircut: 30, maxLev: 3.33 },
  { symbol: "SUZLON", name: "Suzlon Energy", price: 74.85, haircut: 40, maxLev: 2.5 },
  { symbol: "NAZARA", name: "Nazara Technologies", price: 942.30, haircut: 45, maxLev: 2.22 },
];

// Indian currency formatter
function formatINR(val, decimals = 2) {
  if (val == null || isNaN(val)) return "₹0.00";
  const num = Number(val);
  const isNeg = num < 0;
  const absNum = Math.abs(num);
  return `${isNeg ? "-" : ""}₹${absNum.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

export default function CalculatorView({ onBack }) {
  // Input State
  const [selectedStockSym, setSelectedStockSym] = useState("HDFCBANK");
  const [stockSearch, setStockSearch] = useState("");
  const [customStockMode, setCustomStockMode] = useState(false);
  const [entryPrice, setEntryPrice] = useState(1680.45);
  const [haircutPct, setHaircutPct] = useState(20);

  // Sizing Mode: "capital" (client cash) vs "shares" (quantity)
  const [sizeMode, setSizeMode] = useState("capital");
  const [clientCapital, setClientCapital] = useState(100000);
  const [targetShares, setTargetShares] = useState(238);

  // Leverage & Broker State
  const [leverage, setLeverage] = useState(4.0);
  const [selectedBroker, setSelectedBroker] = useState("zerodha");
  const [annualRate, setAnnualRate] = useState(14.60);
  const [holdingDays, setHoldingDays] = useState(30);

  // Collapsible fee ledger
  const [showLedger, setShowLedger] = useState(false);

  // Live Market Quotes Hook with Server-Sent Events (SSE) stream
  const popularSymbols = useMemo(() => POPULAR_STOCKS.map((s) => s.symbol), []);
  const symbolsToWatch = useMemo(() => {
    const set = new Set(popularSymbols);
    if (selectedStockSym) set.add(selectedStockSym.toUpperCase().trim());
    return Array.from(set);
  }, [popularSymbols, selectedStockSym]);

  const {
    quotes,
    loading: quotesLoading,
    isLive: isQuoteLive,
    isStreaming,
    lastUpdated,
    priceTicks,
    getQuote,
    refetch: refetchQuotes,
  } = useLiveQuotes(symbolsToWatch, { enableSSE: true, pollIntervalMs: 15000 });

  // Quick select stock
  const handleSelectStock = (stk) => {
    setSelectedStockSym(stk.symbol);
    setCustomStockMode(false);
    const liveQ = getQuote(stk.symbol);
    const livePrice = liveQ?.cmp ?? stk.price;
    setEntryPrice(livePrice);
    setHaircutPct(stk.haircut);

    // Adjust leverage if higher than allowed by haircut
    const maxAllowed = Number((100 / stk.haircut).toFixed(1));
    if (leverage > maxAllowed) {
      setLeverage(maxAllowed);
    }
  };

  // Custom symbol entry
  const handleCustomSymbolChange = (sym) => {
    const upper = sym.toUpperCase().trim();
    setSelectedStockSym(upper);
    setCustomStockMode(true);

    const liveQ = getQuote(upper);
    if (liveQ && liveQ.cmp) {
      setEntryPrice(liveQ.cmp);
    }
  };

  // Switch broker preset
  const handleBrokerChange = (presetId) => {
    setSelectedBroker(presetId);
    const p = BROKER_PRESETS.find((x) => x.id === presetId);
    if (p && presetId !== "custom") {
      setAnnualRate(p.rate);
    }
  };

  // Reset to standard baseline
  const handleReset = () => {
    setSelectedStockSym("HDFCBANK");
    const hdfcQuote = getQuote("HDFCBANK");
    setEntryPrice(hdfcQuote?.cmp || 1680.45);
    setHaircutPct(20);
    setSizeMode("capital");
    setClientCapital(100000);
    setLeverage(4.0);
    setSelectedBroker("zerodha");
    setAnnualRate(14.60);
    setHoldingDays(30);
    setCustomStockMode(false);
  };

  // Maximum allowed leverage from haircut
  const maxAllowedLeverage = useMemo(() => {
    const h = Math.max(15, Math.min(80, Number(haircutPct) || 20));
    return Math.min(5.0, Number((100 / h).toFixed(1)));
  }, [haircutPct]);

  // Derived Trade Parameters
  const trade = useMemo(() => {
    const price = Math.max(0.5, Number(entryPrice) || 1);
    const lev = Math.max(1.1, Math.min(maxAllowedLeverage, Number(leverage) || 2));
    const days = Math.max(1, Math.min(365, Number(holdingDays) || 1));
    const rate = Math.max(1, Math.min(36, Number(annualRate) || 14.6));

    let shares = 0;
    let clientMargin = 0;
    let totalPosition = 0;

    if (sizeMode === "capital") {
      clientMargin = Math.max(1000, Number(clientCapital) || 1000);
      totalPosition = clientMargin * lev;
      shares = Math.max(1, Math.floor(totalPosition / price));
      // align exact position value with whole shares
      totalPosition = shares * price;
      clientMargin = totalPosition / lev;
    } else {
      shares = Math.max(1, Math.floor(Number(targetShares) || 1));
      totalPosition = shares * price;
      clientMargin = totalPosition / lev;
    }

    const borrowedDebt = totalPosition - clientMargin;
    const clientMarginPct = totalPosition > 0 ? (clientMargin / totalPosition) * 100 : 25;
    const borrowedPct = totalPosition > 0 ? (borrowedDebt / totalPosition) * 100 : 75;

    // Daily Interest and Total Carry
    const dailyInterest = (borrowedDebt * (rate / 100)) / 365;
    const totalInterest = dailyInterest * days;
    const gstOnInterest = totalInterest * 0.18;
    const totalCarryCost = totalInterest + gstOnInterest;

    // Statutory Charges & Transaction Taxes (Buy + Sell round-trip)
    const buyTurnover = totalPosition;
    // Brokerage (Discount broker standard: ₹20 buy + ₹20 sell = ₹40 cap)
    const brokerage = Math.min(40, Math.max(20, buyTurnover * 0.0005 * 2));
    // STT: 0.1% on buy delivery + 0.1% on sell delivery (assumed near entry price)
    const stt = buyTurnover * 0.001 * 2;
    // Exchange turnover charges: NSE ~0.00297% on buy + sell
    const exchangeCharges = buyTurnover * 0.0000297 * 2;
    // SEBI turnover fee: ₹10 per crore (0.0001%) on buy + sell
    const sebiCharges = buyTurnover * 0.000001 * 2;
    // Stamp duty: 0.015% on buy delivery
    const stampDuty = buyTurnover * 0.00015;
    // Depository Pledge / Unpledge fees (CDSL ₹20 + 18% GST = ₹23.60)
    const pledgeFees = 23.60;
    // GST on Brokerage + Exchange + SEBI (18%)
    const gstOnCharges = (brokerage + exchangeCharges + sebiCharges) * 0.18;

    const totalFriction =
      brokerage +
      stt +
      exchangeCharges +
      sebiCharges +
      stampDuty +
      pledgeFees +
      gstOnCharges;

    const totalAllCosts = totalCarryCost + totalFriction;

    // Break-Even Price and Return
    // Exit price where Net proceeds after debt and all costs equal initial client margin
    const breakEvenPrice = price + totalAllCosts / shares;
    const breakEvenReturnPct = ((breakEvenPrice - price) / price) * 100;
    const dailyDragRate = totalAllCosts / days;
    const dailyDragPct = clientMargin > 0 ? (dailyDragRate / clientMargin) * 100 : 0;

    // Margin Call & Liquidation Engine
    // Maintenance Margin required (typically SEBI haircut % or minimum 20%)
    const maintenanceMarginPct = Math.max(15, Number(haircutPct) || 20);
    const mmRatio = maintenanceMarginPct / 100;

    // Margin Call Trigger Price: Price where Client Equity / Position Value = mmRatio
    // (shares * P_mc - debt) / (shares * P_mc) = mmRatio => P_mc = debt / (shares * (1 - mmRatio))
    const marginCallPrice = mmRatio < 1 ? borrowedDebt / (shares * (1 - mmRatio)) : price * 0.85;

    // Forced Liquidation / Auto Square-off Price:
    // When equity falls to 12% or loss hits 80% of client margin
    const liquidationMarginPct = Math.max(8, maintenanceMarginPct * 0.6);
    const lmRatio = liquidationMarginPct / 100;
    const liquidationPrice = lmRatio < 1 ? borrowedDebt / (shares * (1 - lmRatio)) : price * 0.75;

    // Cushion / Buffers
    const cushionMcPct = price > 0 ? ((price - marginCallPrice) / price) * 100 : 0;
    const cushionMcAmt = price - marginCallPrice;
    const cushionLiqPct = price > 0 ? ((price - liquidationPrice) / price) * 100 : 0;
    const cushionLiqAmt = price - liquidationPrice;

    // Required Top-Up Cash for drops: 5%, 10%, 15%, 20%
    const dropScenarios = [5, 10, 15, 20].map((dropPct) => {
      const pDrop = price * (1 - dropPct / 100);
      const valDrop = shares * pDrop;
      const equityDrop = valDrop - borrowedDebt;
      const requiredEquity = valDrop * mmRatio;
      const topUpRequired = Math.max(0, requiredEquity - equityDrop);
      const isBreached = equityDrop < requiredEquity;
      const isLiquidated = pDrop <= liquidationPrice;

      return {
        dropPct,
        pDrop,
        equityDrop,
        topUpRequired,
        isBreached,
        isLiquidated,
      };
    });

    return {
      price,
      shares,
      totalPosition,
      clientMargin,
      borrowedDebt,
      clientMarginPct,
      borrowedPct,
      days,
      rate,
      dailyInterest,
      totalInterest,
      gstOnInterest,
      totalCarryCost,
      brokerage,
      stt,
      exchangeCharges,
      sebiCharges,
      stampDuty,
      pledgeFees,
      gstOnCharges,
      totalFriction,
      totalAllCosts,
      breakEvenPrice,
      breakEvenReturnPct,
      dailyDragRate,
      dailyDragPct,
      maintenanceMarginPct,
      marginCallPrice,
      liquidationMarginPct,
      liquidationPrice,
      cushionMcPct,
      cushionMcAmt,
      cushionLiqPct,
      cushionLiqAmt,
      dropScenarios,
    };
  }, [
    entryPrice,
    leverage,
    maxAllowedLeverage,
    holdingDays,
    annualRate,
    sizeMode,
    clientCapital,
    targetShares,
    haircutPct,
  ]);

  // Sensitivity Matrix: X-Axis Price Changes, Y-Axis Holding Horizons
  const sensitivityData = useMemo(() => {
    const priceDeltas = [-15, -10, -5, 0, 5, 10, 15];
    const horizons = [7, 15, 30, 60, 90, 180];

    return horizons.map((days) => {
      const dailyI = trade.dailyInterest;
      const carry = dailyI * days * 1.18; // interest + 18% GST

      const cells = priceDeltas.map((pct) => {
        const exitP = trade.price * (1 + pct / 100);
        const grossPnl = trade.shares * (exitP - trade.price);
        const netPnl = grossPnl - carry - trade.totalFriction;
        const roi = trade.clientMargin > 0 ? (netPnl / trade.clientMargin) * 100 : 0;
        return {
          pct,
          exitP,
          netPnl,
          roi,
        };
      });

      return {
        days,
        cells,
      };
    });
  }, [trade]);

  // Search filtered stocks
  const filteredStockList = useMemo(() => {
    if (!stockSearch.trim()) return POPULAR_STOCKS;
    const q = stockSearch.toLowerCase().trim();
    return POPULAR_STOCKS.filter(
      (s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
    );
  }, [stockSearch]);

  const currentQuote = getQuote(selectedStockSym);
  const currentTick = priceTicks[selectedStockSym];

  return (
    <div className="calcContainer">
      {/* Header & Breadcrumb */}
      <div className="calcHeader">
        <div className="calcHeaderLeft">
          <button className="calcBackBtn" onClick={onBack} title="Return to Stock Screener">
            <ChevronLeft size={16} />
            <span>Back to Screener</span>
          </button>
          <div className="calcBreadcrumb">
            <span>Market Analytics</span>
            <span className="crumbSlash">/</span>
            <span className="crumbActive">MTF Leverage & Carry Calculator</span>
          </div>
          <div className="calcTitleRow">
            <h1 className="calcTitle">MTF Leverage & Carry Calculator</h1>
            <span className="calcTagBadge">
              <Calculator size={13} />
              REAL-TIME MARGIN ENGINE
            </span>
            <span
              className={`calcFeedBadge ${isQuoteLive ? "live" : "offline"}`}
              title={isStreaming ? "Real-time SSE push stream active" : isQuoteLive ? "Polling live quotes" : "Local simulation mode"}
            >
              <span className={`livePulseDot ${isQuoteLive ? "" : "offlineDot"}`} />
              {isStreaming ? "• SSE LIVE STREAM" : isQuoteLive ? "• LIVE QUOTES" : "LOCAL CACHE"}
            </span>
          </div>
          <p className="calcSubtitle">
            Compute the exact daily carry drag, real break-even prices with Indian statutory charges, and monitor margin call liquidation risk levels.
          </p>
        </div>

        <div className="calcHeaderRight">
          <button
            className="calcResetBtn"
            onClick={refetchQuotes}
            disabled={quotesLoading}
            title="Refresh live quotes from market feed"
          >
            <RefreshCw size={13} className={quotesLoading ? "spinIcon" : ""} />
            <span>{quotesLoading ? "Updating..." : "Refresh Quotes"}</span>
          </button>
          <button className="calcResetBtn" onClick={handleReset} title="Reset to default trade parameters">
            <RotateCcw size={14} />
            <span>Reset Baseline</span>
          </button>
        </div>
      </div>

      {/* 2. Top-Level KPI & Break-Even Summary Cards */}
      <div className="calcKpisGrid">
        {/* Card 1: Total Position Value */}
        <div className="card calcKpiCard">
          <div className="kpiTop">
            <span className="kpiTitle">TOTAL POSITION VALUE</span>
            <Building2 size={17} className="kpiIcon blue" />
          </div>
          <b className="kpiValue">{formatINR(trade.totalPosition)}</b>
          <div className="kpiSplitBar">
            <div className="splitClient" style={{ width: `${trade.clientMarginPct}%` }} title={`Client Margin: ${trade.clientMarginPct.toFixed(1)}%`} />
            <div className="splitBroker" style={{ width: `${trade.borrowedPct}%` }} title={`Broker Funded: ${trade.borrowedPct.toFixed(1)}%`} />
          </div>
          <div className="kpiSubRow">
            <span className="subLeft">Margin: <b>{formatINR(trade.clientMargin, 0)}</b></span>
            <span className="subRight">Borrowed: <b>{formatINR(trade.borrowedDebt, 0)}</b></span>
          </div>
        </div>

        {/* Card 2: Accumulated Carry Cost */}
        <div className="card calcKpiCard">
          <div className="kpiTop">
            <span className="kpiTitle">ACCUMULATED CARRY COST</span>
            <Clock size={17} className="kpiIcon orange" />
          </div>
          <b className="kpiValue" style={{ color: "#f59e0b" }}>{formatINR(trade.totalCarryCost)}</b>
          <div className="kpiSubRow">
            <span className="subLeft">Interest: {formatINR(trade.totalInterest, 0)}</span>
            <span className="subRight">+ 18% GST: {formatINR(trade.gstOnInterest, 0)}</span>
          </div>
          <span className="kpiFootnote">
            Daily Carry Drag: <b>{formatINR(trade.dailyInterest * 1.18)}</b>/day ({trade.rate}% APR)
          </span>
        </div>

        {/* Card 3: Effective Break-Even Price */}
        <div className="card calcKpiCard">
          <div className="kpiTop">
            <span className="kpiTitle">EFFECTIVE BREAK-EVEN PRICE</span>
            <Percent size={17} className="kpiIcon cyan" />
          </div>
          <b className="kpiValue" style={{ color: "#38bdf8" }}>{formatINR(trade.breakEvenPrice)}</b>
          <div className="kpiSubRow">
            <span className="subLeft">Entry CMP: {formatINR(trade.price)}</span>
            <span className="subRight">Premium: +{formatINR(trade.breakEvenPrice - trade.price)}</span>
          </div>
          <span className="kpiFootnote">
            Includes ₹{trade.totalFriction.toFixed(2)} statutory taxes & {trade.days}D interest
          </span>
        </div>

        {/* Card 4: Required Break-Even Return (%) */}
        <div className="card calcKpiCard">
          <div className="kpiTop">
            <span className="kpiTitle">REQUIRED BREAK-EVEN RETURN</span>
            <TrendingUp size={17} className="kpiIcon green" />
          </div>
          <b className="kpiValue" style={{ color: trade.breakEvenReturnPct > 3 ? "#f59e0b" : "#10b981" }}>
            +{trade.breakEvenReturnPct.toFixed(2)}%
          </b>
          <div className="kpiSubRow">
            <span className="subLeft">Holding: <b>{trade.days} Days</b></span>
            <span className="subRight">Friction: <b>{trade.dailyDragPct.toFixed(2)}%</b>/day</span>
          </div>
          <span className="kpiFootnote">
            {trade.breakEvenReturnPct > 2.5
              ? "High carry friction: Sideways market results in loss"
              : "Moderate carry drag: Achievable hurdle rate"}
          </span>
        </div>
      </div>

      {/* Main Grid: Left Column (Inputs) & Right Column (Analysis & Matrix) */}
      <div className="calcMainGrid">
        {/* LEFT COLUMN: Input & Trade Parameters */}
        <div className="calcLeftCol">
          <div className="card calcInputCard">
            <div className="calcCardHead">
              <div className="cardHeadTitle">
                <SlidersHorizontal size={16} />
                <h2>TRADE & LEVERAGE SETUP</h2>
              </div>
              <span className="cardHeadBadge">{selectedStockSym}</span>
            </div>

            {/* 1. Stock Selector / Entry */}
            <div className="calcFormGroup">
              <label className="calcFieldLabel">
                <span>SELECT STOCK OR CUSTOM SYMBOL</span>
                <span className="labelHint">Haircut: {haircutPct}%</span>
              </label>

              {/* Popular Stock Quick Chips with Real-Time Prices */}
              <div className="stockPillsGrid">
                {POPULAR_STOCKS.slice(0, 6).map((stk) => {
                  const q = quotes[stk.symbol];
                  const displayPrice = q?.cmp ?? stk.price;
                  const tick = priceTicks[stk.symbol];
                  const isUp = (q?.change ?? 0) >= 0;
                  return (
                    <button
                      key={stk.symbol}
                      className={`stockPill ${selectedStockSym === stk.symbol && !customStockMode ? "active" : ""} ${tick ? `tick-${tick}` : ""}`}
                      onClick={() => handleSelectStock(stk)}
                    >
                      <b>{stk.symbol}</b>
                      <small style={{ color: q ? (isUp ? "#10b981" : "#ef4444") : undefined }}>
                        ₹{displayPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </small>
                    </button>
                  );
                })}
              </div>

              {/* Custom Input Toggle */}
              <div className="stockInputRow">
                <div className="inputWithPrefix">
                  <span className="inputPrefix">SYM</span>
                  <input
                    type="text"
                    value={selectedStockSym}
                    onChange={(e) => handleCustomSymbolChange(e.target.value)}
                    placeholder="e.g. RELIANCE"
                    className="calcInput"
                  />
                </div>
                <div className="inputWithPrefix">
                  <span className="inputPrefix">CMP ₹</span>
                  <input
                    type="number"
                    value={entryPrice}
                    onChange={(e) => setEntryPrice(Math.max(0.1, Number(e.target.value)))}
                    step="0.5"
                    className="calcInput bold"
                    title="Current Market Price. Fully editable for custom entry / target simulations."
                  />
                </div>
                <div className="inputWithPrefix">
                  <span className="inputPrefix">HAIRCUT %</span>
                  <input
                    type="number"
                    value={haircutPct}
                    onChange={(e) => {
                      const hc = Math.max(15, Math.min(80, Number(e.target.value)));
                      setHaircutPct(hc);
                      const maxAllowed = Number((100 / hc).toFixed(1));
                      if (leverage > maxAllowed) setLeverage(maxAllowed);
                    }}
                    min="15"
                    max="80"
                    step="5"
                    className="calcInput"
                    title="SEBI / Broker regulatory haircut (VaR + ELM)"
                  />
                </div>
              </div>

              {/* Real-Time Live Quote Bar & Sync Button */}
              {currentQuote && (
                <div className={`stockLiveQuoteBar ${currentTick ? `tick-${currentTick}` : ""}`}>
                  <div className="quoteBarLeft">
                    <span className="liveIndicatorDot" />
                    <span className="quoteSymbol">{currentQuote.symbol}</span>
                    <span className="quoteCmp">
                      ₹{currentQuote.cmp.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className={`quoteChange ${currentQuote.change >= 0 ? "pos" : "neg"}`}>
                      {currentQuote.change >= 0 ? "+" : ""}{currentQuote.change.toFixed(2)} ({currentQuote.percentChange >= 0 ? "+" : ""}{currentQuote.percentChange.toFixed(2)}%)
                    </span>
                    {currentQuote.dayHigh != null && currentQuote.dayLow != null && (
                      <span className="quoteRange">
                        H: ₹{currentQuote.dayHigh} | L: ₹{currentQuote.dayLow}
                      </span>
                    )}
                  </div>
                  {Math.abs(entryPrice - currentQuote.cmp) > 0.01 && (
                    <button
                      className="quoteSyncBtn"
                      onClick={() => setEntryPrice(currentQuote.cmp)}
                      title="Reset entry price to current live market quote"
                    >
                      <RotateCcw size={11} />
                      <span>Sync Live CMP (₹{currentQuote.cmp})</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* 2. Position Sizing Mode */}
            <div className="calcFormGroup">
              <div className="modeToggleHeader">
                <label className="calcFieldLabel">POSITION SIZING</label>
                <div className="segment mini">
                  <button
                    className={sizeMode === "capital" ? "on" : ""}
                    onClick={() => setSizeMode("capital")}
                  >
                    By Capital (Margin)
                  </button>
                  <button
                    className={sizeMode === "shares" ? "on" : ""}
                    onClick={() => setSizeMode("shares")}
                  >
                    By Shares (Quantity)
                  </button>
                </div>
              </div>

              {sizeMode === "capital" ? (
                <div>
                  <div className="inputWithPrefix large">
                    <span className="inputPrefix">CLIENT MARGIN ₹</span>
                    <input
                      type="number"
                      value={clientCapital}
                      onChange={(e) => setClientCapital(Math.max(1000, Number(e.target.value)))}
                      step="5000"
                      className="calcInput bold"
                    />
                  </div>
                  <div className="sizeQuickButtons">
                    {[25000, 50000, 100000, 250000, 500000, 1000000].map((amt) => (
                      <button
                        key={amt}
                        className={`sizeQuickBtn ${clientCapital === amt ? "active" : ""}`}
                        onClick={() => setClientCapital(amt)}
                      >
                        ₹{(amt / 100000).toFixed(amt >= 100000 ? 1 : 2)}L
                      </button>
                    ))}
                  </div>
                  <span className="calcHelperText">
                    Yields <b>{trade.shares.toLocaleString("en-IN")} Shares</b> at {leverage}x leverage
                  </span>
                </div>
              ) : (
                <div>
                  <div className="inputWithPrefix large">
                    <span className="inputPrefix">TARGET QUANTITY</span>
                    <input
                      type="number"
                      value={targetShares}
                      onChange={(e) => setTargetShares(Math.max(1, Number(e.target.value)))}
                      step="10"
                      className="calcInput bold"
                    />
                  </div>
                  <div className="sizeQuickButtons">
                    {[50, 100, 250, 500, 1000, 2500].map((qty) => (
                      <button
                        key={qty}
                        className={`sizeQuickBtn ${targetShares === qty ? "active" : ""}`}
                        onClick={() => setTargetShares(qty)}
                      >
                        {qty} Qty
                      </button>
                    ))}
                  </div>
                  <span className="calcHelperText">
                    Requires <b>{formatINR(trade.clientMargin, 0)}</b> margin deposit
                  </span>
                </div>
              )}
            </div>

            {/* 3. Interactive Leverage Slider */}
            <div className="calcFormGroup">
              <div className="sliderHeader">
                <label className="calcFieldLabel">MTF LEVERAGE MULTIPLIER</label>
                <div className="leverageValueBadge">
                  <b>{leverage.toFixed(1)}x</b>
                  <span>(Max {maxAllowedLeverage}x)</span>
                </div>
              </div>

              <input
                type="range"
                min="1.5"
                max={maxAllowedLeverage}
                step="0.1"
                value={leverage}
                onChange={(e) => setLeverage(Number(e.target.value))}
                className="calcSlider"
              />

              {/* Dual-tone Capital Split Bar */}
              <div className="calcDualFillBar">
                <div
                  className="dualFillClient"
                  style={{ width: `${trade.clientMarginPct}%` }}
                >
                  <span>Client {trade.clientMarginPct.toFixed(0)}%</span>
                </div>
                <div
                  className="dualFillBroker"
                  style={{ width: `${trade.borrowedPct}%` }}
                >
                  <span>Broker Funded {trade.borrowedPct.toFixed(0)}%</span>
                </div>
              </div>

              <div className="leveragePillsRow">
                {[2.0, 3.0, 4.0, 5.0].map((levVal) => (
                  <button
                    key={levVal}
                    disabled={levVal > maxAllowedLeverage}
                    className={`levQuickBtn ${leverage === levVal ? "active" : ""}`}
                    onClick={() => setLeverage(levVal)}
                  >
                    {levVal}x
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Broker Interest Rate Presets */}
            <div className="calcFormGroup">
              <label className="calcFieldLabel">
                <span>BROKER INTEREST RATE (P.A.)</span>
                <span className="labelHint">{trade.dailyInterest > 0 ? `${formatINR(trade.dailyInterest)}/day` : ""}</span>
              </label>

              <div className="brokerPresetsGrid">
                {BROKER_PRESETS.map((bp) => (
                  <button
                    key={bp.id}
                    className={`brokerPresetCard ${selectedBroker === bp.id ? "active" : ""}`}
                    onClick={() => handleBrokerChange(bp.id)}
                  >
                    <div className="brokerPresetTop">
                      <b>{bp.name}</b>
                      <span>{bp.rate}%</span>
                    </div>
                    <small>{bp.desc}</small>
                  </button>
                ))}
              </div>

              {selectedBroker === "custom" && (
                <div className="inputWithPrefix mt8">
                  <span className="inputPrefix">CUSTOM APR %</span>
                  <input
                    type="number"
                    value={annualRate}
                    onChange={(e) => setAnnualRate(Math.max(5, Math.min(36, Number(e.target.value))))}
                    step="0.25"
                    className="calcInput"
                  />
                </div>
              )}
            </div>

            {/* 5. Planned Holding Horizon */}
            <div className="calcFormGroup">
              <div className="sliderHeader">
                <label className="calcFieldLabel">PLANNED HOLDING PERIOD</label>
                <div className="horizonDaysBadge">
                  <b>{holdingDays} Days</b>
                  <span>({(holdingDays / 30).toFixed(1)} Months)</span>
                </div>
              </div>

              <input
                type="range"
                min="1"
                max="365"
                step="1"
                value={holdingDays}
                onChange={(e) => setHoldingDays(Number(e.target.value))}
                className="calcSlider"
              />

              <div className="horizonQuickRow">
                {[7, 15, 30, 60, 90, 180, 365].map((d) => (
                  <button
                    key={d}
                    className={`horizonBtn ${holdingDays === d ? "active" : ""}`}
                    onClick={() => setHoldingDays(d)}
                  >
                    {d < 30 ? `${d}D` : d === 365 ? "1Y" : `${d / 30}M`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Margin Call Gauge, Sensitivity Matrix & Fee Ledger */}
        <div className="calcRightCol">
          {/* Section 3: Margin Call & Liquidation Threshold Gauge */}
          <div className="card calcRiskCard">
            <div className="calcCardHead">
              <div className="cardHeadTitle">
                <ShieldAlert size={16} style={{ color: "#ef4444" }} />
                <h2>MARGIN CALL & LIQUIDATION THRESHOLD GAUGE</h2>
              </div>
              <span
                className="riskLevelPill"
                style={{
                  color: trade.cushionMcPct < 8 ? "#ef4444" : trade.cushionMcPct < 15 ? "#f59e0b" : "#10b981",
                  borderColor: trade.cushionMcPct < 8 ? "#ef4444" : trade.cushionMcPct < 15 ? "#f59e0b" : "#10b981",
                }}
              >
                {trade.cushionMcPct < 8 ? "DANGER ZONE" : trade.cushionMcPct < 15 ? "MODERATE BUFFER" : "HEALTHY CUSHION"}
              </span>
            </div>

            {/* Threshold Stats Row */}
            <div className="thresholdMetricsRow">
              <div className="thresholdBlock">
                <span className="threshLabel">CURRENT CMP</span>
                <b className="threshVal">{formatINR(trade.price)}</b>
                <small className="threshSub">Entry Price Baseline</small>
              </div>

              <div className="thresholdBlock warning">
                <span className="threshLabel">MARGIN CALL TRIGGER</span>
                <b className="threshVal" style={{ color: "#f59e0b" }}>{formatINR(trade.marginCallPrice)}</b>
                <small className="threshSub">
                  Buffer: <b>-{trade.cushionMcPct.toFixed(1)}%</b> (-{formatINR(trade.cushionMcAmt)})
                </small>
              </div>

              <div className="thresholdBlock danger">
                <span className="threshLabel">AUTO SQUARE-OFF (LIQ)</span>
                <b className="threshVal" style={{ color: "#ef4444" }}>{formatINR(trade.liquidationPrice)}</b>
                <small className="threshSub">
                  Buffer: <b>-{trade.cushionLiqPct.toFixed(1)}%</b> (-{formatINR(trade.cushionLiqAmt)})
                </small>
              </div>
            </div>

            {/* Visual Risk Gauge Bar */}
            <div className="gaugeVisualWrap">
              <div className="gaugeLabelsTop">
                <span style={{ color: "#ef4444" }}>Liquidation: {formatINR(trade.liquidationPrice)}</span>
                <span style={{ color: "#f59e0b" }}>Margin Call: {formatINR(trade.marginCallPrice)}</span>
                <span style={{ color: "#10b981" }}>Current: {formatINR(trade.price)}</span>
              </div>
              <div className="gaugeBar">
                <div className="gaugeZoneLiq" style={{ width: "25%" }} title="Liquidation Zone (Forced close)" />
                <div className="gaugeZoneCall" style={{ width: "35%" }} title="Margin Call Warning Zone" />
                <div className="gaugeZoneSafe" style={{ width: "40%" }} title="Safe Holding Buffer" />
                {/* Pointer indicator */}
                <div className="gaugePointer" style={{ left: "85%" }}>
                  <div className="pointerDot" />
                  <span className="pointerLabel">CMP</span>
                </div>
              </div>
              <div className="gaugeLegend">
                <span>0%</span>
                <span>Broker Auto Square-off Zone</span>
                <span>Margin Call Notice</span>
                <span>Healthy Cushion (+{trade.cushionMcPct.toFixed(1)}%)</span>
              </div>
            </div>

            {/* Required Top-Up Cash Table */}
            <div className="topUpSection">
              <div className="topUpTitleRow">
                <span className="topUpTitle">STRESS TEST: REQUIRED TOP-UP CASH ON DRAWDOWN</span>
                <span className="topUpTip">Maintenance margin requirement: {trade.maintenanceMarginPct}%</span>
              </div>
              <div className="topUpCardsGrid">
                {trade.dropScenarios.map((sc) => (
                  <div
                    key={sc.dropPct}
                    className={`topUpCard ${sc.isLiquidated ? "liquidated" : sc.isBreached ? "breached" : "safe"}`}
                  >
                    <div className="topUpCardHead">
                      <b>-{sc.dropPct}% Drop</b>
                      <span className="scenarioPrice">{formatINR(sc.pDrop, 1)}</span>
                    </div>
                    <div className="topUpCardBody">
                      <span className="topUpAmountLabel">Top-Up Needed:</span>
                      <b className="topUpAmountVal">
                        {sc.topUpRequired > 0 ? formatINR(sc.topUpRequired, 0) : "₹0 (Safe)"}
                      </b>
                    </div>
                    <div className="topUpStatus">
                      {sc.isLiquidated ? (
                        <span className="statusPill liq">SQUARE-OFF RISK</span>
                      ) : sc.isBreached ? (
                        <span className="statusPill marginCall">MARGIN CALL</span>
                      ) : (
                        <span className="statusPill buffer">WITHIN BUFFER</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Interactive P&L Sensitivity Matrix (Profit vs. Time Horizon) */}
          <div className="card calcMatrixCard">
            <div className="calcCardHead">
              <div className="cardHeadTitle">
                <Activity size={16} style={{ color: "#38bdf8" }} />
                <h2>INTERACTIVE P&L SENSITIVITY MATRIX</h2>
              </div>
              <span className="matrixLegendTip">
                Net P&L (₹) and Leveraged ROI (%) after full carry & statutory drag
              </span>
            </div>

            <p className="matrixExplainer">
              Notice the <b>0% (Sideways)</b> column: As holding duration extends from 7 days to 180 days, carrying cost drag converts sideways price action into deepening negative returns (the "time decay" of MTF).
            </p>

            <div className="tableScroll">
              <table className="matrixTable">
                <thead>
                  <tr>
                    <th className="stickyCol">HOLDING HORIZON</th>
                    <th>-15% MOVE</th>
                    <th>-10% MOVE</th>
                    <th>-5% MOVE</th>
                    <th className="sidewaysCol">0% (SIDEWAYS)</th>
                    <th>+5% MOVE</th>
                    <th>+10% MOVE</th>
                    <th>+15% MOVE</th>
                  </tr>
                </thead>
                <tbody>
                  {sensitivityData.map((row) => (
                    <tr key={row.days}>
                      <td className="stickyCol">
                        <b>{row.days} Days</b>
                        <small>{(row.days / 30).toFixed(1)} mo</small>
                      </td>
                      {row.cells.map((cell) => {
                        const isPos = cell.netPnl >= 0;
                        const isZeroCol = cell.pct === 0;

                        // Dynamic cell background shade
                        let cellBg = "rgba(16, 185, 129, 0.08)";
                        if (cell.roi >= 40) cellBg = "rgba(16, 185, 129, 0.28)";
                        else if (cell.roi >= 15) cellBg = "rgba(16, 185, 129, 0.18)";
                        else if (cell.roi >= 0) cellBg = "rgba(16, 185, 129, 0.09)";
                        else if (cell.roi <= -40) cellBg = "rgba(239, 68, 68, 0.28)";
                        else if (cell.roi <= -15) cellBg = "rgba(239, 68, 68, 0.18)";
                        else cellBg = "rgba(239, 68, 68, 0.09)";

                        if (isZeroCol) {
                          cellBg = "rgba(245, 158, 11, 0.12)";
                        }

                        return (
                          <td
                            key={cell.pct}
                            className={`matrixCell ${isZeroCol ? "zeroCell" : ""}`}
                            style={{ background: cellBg }}
                          >
                            <b className={`cellPnl ${isPos ? "pnlPos" : "pnlNeg"}`}>
                              {isPos ? "+" : ""}{formatINR(cell.netPnl, 0)}
                            </b>
                            <span className={`cellRoi ${isPos ? "roiPos" : "roiNeg"}`}>
                              {isPos ? "+" : ""}{cell.roi.toFixed(1)}% ROI
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 5: Complete Statutory Charges & Fee Breakdown Ledger */}
          <div className="card calcLedgerCard">
            <div
              className="ledgerHeaderClickable"
              onClick={() => setShowLedger(!showLedger)}
              title="Click to toggle full statutory charges ledger"
            >
              <div className="ledgerHeaderLeft">
                <FileText size={16} style={{ color: "#a855f7" }} />
                <div>
                  <h3>COMPLETE STATUTORY CHARGES & CARRY LEDGER</h3>
                  <p>Itemized regulatory fees, exchange turnover, STT, depository pledge, and GST</p>
                </div>
              </div>
              <div className="ledgerHeaderRight">
                <div className="ledgerTotalBadge">
                  <span>TOTAL FRICTION:</span>
                  <b>{formatINR(trade.totalAllCosts)}</b>
                </div>
                <button className="ledgerToggleBtn">
                  {showLedger ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
            </div>

            {showLedger && (
              <div className="ledgerContent">
                <div className="ledgerGrid">
                  {/* Daily Carry Interest Block */}
                  <div className="ledgerSubBlock">
                    <h4 className="subBlockTitle">MTF BORROWING & CARRY</h4>
                    <div className="ledgerItemRow">
                      <span>Funded Borrowing</span>
                      <b>{formatINR(trade.borrowedDebt)}</b>
                    </div>
                    <div className="ledgerItemRow">
                      <span>Interest Rate (APR)</span>
                      <b>{trade.rate}% p.a. ({(trade.rate / 365).toFixed(4)}%/day)</b>
                    </div>
                    <div className="ledgerItemRow">
                      <span>Daily Interest</span>
                      <b>{formatINR(trade.dailyInterest)}/day</b>
                    </div>
                    <div className="ledgerItemRow">
                      <span>Total Base Interest ({trade.days}D)</span>
                      <b>{formatINR(trade.totalInterest)}</b>
                    </div>
                    <div className="ledgerItemRow">
                      <span>18% GST on Interest</span>
                      <b>{formatINR(trade.gstOnInterest)}</b>
                    </div>
                    <div className="ledgerItemTotal">
                      <span>Accumulated Carry</span>
                      <b style={{ color: "#f59e0b" }}>{formatINR(trade.totalCarryCost)}</b>
                    </div>
                  </div>

                  {/* Statutory Taxes & Exchange Fees Block */}
                  <div className="ledgerSubBlock">
                    <h4 className="subBlockTitle">REGULATORY & TRANSACTION CHARGES</h4>
                    <div className="ledgerItemRow">
                      <span>Brokerage (Buy + Sell Cap)</span>
                      <b>{formatINR(trade.brokerage)}</b>
                    </div>
                    <div className="ledgerItemRow">
                      <span>Securities Transaction Tax (0.1% Buy+Sell)</span>
                      <b>{formatINR(trade.stt)}</b>
                    </div>
                    <div className="ledgerItemRow">
                      <span>Exchange Turnover Fees (NSE 0.00297%)</span>
                      <b>{formatINR(trade.exchangeCharges)}</b>
                    </div>
                    <div className="ledgerItemRow">
                      <span>SEBI Turnover Fees (₹10/Cr)</span>
                      <b>{formatINR(trade.sebiCharges)}</b>
                    </div>
                    <div className="ledgerItemRow">
                      <span>Stamp Duty (0.015% on Buy)</span>
                      <b>{formatINR(trade.stampDuty)}</b>
                    </div>
                    <div className="ledgerItemRow">
                      <span>CDSL/NSDL Pledge & Unpledge Fee</span>
                      <b>{formatINR(trade.pledgeFees)}</b>
                    </div>
                    <div className="ledgerItemRow">
                      <span>18% GST on Regulatory Charges</span>
                      <b>{formatINR(trade.gstOnCharges)}</b>
                    </div>
                    <div className="ledgerItemTotal">
                      <span>Total Transaction Taxes</span>
                      <b style={{ color: "#38bdf8" }}>{formatINR(trade.totalFriction)}</b>
                    </div>
                  </div>
                </div>

                <div className="ledgerSummaryBanner">
                  <div className="bannerCol">
                    <span>TOTAL POSITION EXPOSURE</span>
                    <b>{formatINR(trade.totalPosition)}</b>
                  </div>
                  <div className="bannerCol">
                    <span>NET CLIENT CAPITAL AT RISK</span>
                    <b>{formatINR(trade.clientMargin)}</b>
                  </div>
                  <div className="bannerCol">
                    <span>TOTAL TRANSACTION + CARRY DRAG</span>
                    <b style={{ color: "#ef4444" }}>{formatINR(trade.totalAllCosts)}</b>
                  </div>
                  <div className="bannerCol">
                    <span>EXIT BREAK-EVEN LEVEL</span>
                    <b style={{ color: "#10b981" }}>{formatINR(trade.breakEvenPrice)} (+{trade.breakEvenReturnPct.toFixed(2)}%)</b>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
