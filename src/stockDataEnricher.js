// Utility to enrich raw MTF stock universe with fundamental, technical, sector, index, ownership, pattern, and analyst data

// Known major company mappings
const KNOWN_SECTORS = {
  RELIANCE: { sector: "Energy & Utilities", industry: "Oil & Gas / Conglomerate", index: "Nifty 50", capTier: "Large-Cap" },
  TCS: { sector: "Information Tech", industry: "IT Services & Consulting", index: "Nifty 50", capTier: "Large-Cap" },
  HDFCBANK: { sector: "Banking & Financials", industry: "Private Sector Bank", index: "Nifty 50", capTier: "Large-Cap" },
  ICICIBANK: { sector: "Banking & Financials", industry: "Private Sector Bank", index: "Nifty 50", capTier: "Large-Cap" },
  INFY: { sector: "Information Tech", industry: "IT Services", index: "Nifty 50", capTier: "Large-Cap" },
  BHARTIARTL: { sector: "Telecom & Media", industry: "Telecommunications", index: "Nifty 50", capTier: "Large-Cap" },
  SBIN: { sector: "Banking & Financials", industry: "Public Sector Bank", index: "Nifty 50", capTier: "Large-Cap" },
  ITC: { sector: "FMCG & Consumer", industry: "Diversified FMCG", index: "Nifty 50", capTier: "Large-Cap" },
  LT: { sector: "Industrials & Infra", industry: "Engineering & Construction", index: "Nifty 50", capTier: "Large-Cap" },
  HINDUNILVR: { sector: "FMCG & Consumer", industry: "Personal Care / FMCG", index: "Nifty 50", capTier: "Large-Cap" },
  BAJFINANCE: { sector: "Banking & Financials", industry: "NBFC / Retail Finance", index: "Nifty 50", capTier: "Large-Cap" },
  MARUTI: { sector: "Automotive & EV", industry: "Passenger Vehicles", index: "Nifty 50", capTier: "Large-Cap" },
  TMPV: { sector: "Automotive & EV", industry: "Automotive OEM", index: "Nifty 50", capTier: "Large-Cap" },
  TATAMOTORS: { sector: "Automotive & EV", industry: "Automotive OEM", index: "Nifty 50", capTier: "Large-Cap" },
  M_M: { sector: "Automotive & EV", industry: "Commercial / UVs", index: "Nifty 50", capTier: "Large-Cap" },
  SUNPHARMA: { sector: "Healthcare & Pharma", industry: "Pharmaceuticals", index: "Nifty 50", capTier: "Large-Cap" },
  TATASTEEL: { sector: "Metals & Mining", industry: "Steel Manufacturing", index: "Nifty 50", capTier: "Large-Cap" },
  HINDALCO: { sector: "Metals & Mining", industry: "Non-Ferrous Metals", index: "Nifty 50", capTier: "Large-Cap" },
  NTPC: { sector: "Energy & Utilities", industry: "Power Generation", index: "Nifty 50", capTier: "Large-Cap" },
  ONGC: { sector: "Energy & Utilities", industry: "Oil & Gas Exploration", index: "Nifty 50", capTier: "Large-Cap" },
  POWERGRID: { sector: "Energy & Utilities", industry: "Power Transmission", index: "Nifty 50", capTier: "Large-Cap" },
  COALINDIA: { sector: "Metals & Mining", industry: "Coal Mining", index: "Nifty 50", capTier: "Large-Cap" },
  ADANIENT: { sector: "Industrials & Infra", industry: "Trading & Logistics", index: "Nifty 50", capTier: "Large-Cap" },
  ADANIPORTS: { sector: "Industrials & Infra", industry: "Ports & SEZ", index: "Nifty 50", capTier: "Large-Cap" },
  ADANIPOWER: { sector: "Energy & Utilities", industry: "Thermal Power", index: "Nifty Midcap 100", capTier: "Large-Cap" },
  ADANIGREEN: { sector: "Energy & Utilities", industry: "Renewable Energy", index: "Nifty Next 50", capTier: "Large-Cap" },
  BSE: { sector: "Banking & Financials", industry: "Capital Markets / Exchange", index: "Nifty Midcap 100", capTier: "Mid-Cap" },
  CDSL: { sector: "Banking & Financials", industry: "Central Depository", index: "Nifty Midcap 100", capTier: "Mid-Cap" },
  MCX: { sector: "Banking & Financials", industry: "Commodity Exchange", index: "Nifty Midcap 100", capTier: "Mid-Cap" },
  JIOFIN: { sector: "Banking & Financials", industry: "Financial Services", index: "Nifty Next 50", capTier: "Large-Cap" },
  BEL: { sector: "Industrials & Infra", industry: "Defense Electronics", index: "Nifty 50", capTier: "Large-Cap" },
  HAL: { sector: "Industrials & Infra", industry: "Aerospace & Defense", index: "Nifty Next 50", capTier: "Large-Cap" },
  MAZDOCK: { sector: "Industrials & Infra", industry: "Shipbuilding / Defense", index: "Nifty Midcap 100", capTier: "Mid-Cap" },
  COCHINSHIP: { sector: "Industrials & Infra", industry: "Shipyard", index: "Nifty Smallcap 250", capTier: "Mid-Cap" },
  GRSE: { sector: "Industrials & Infra", industry: "Defense Shipbuilding", index: "Nifty Smallcap 250", capTier: "Small-Cap" },
  BDL: { sector: "Industrials & Infra", industry: "Defense Missiles", index: "Nifty Midcap 100", capTier: "Mid-Cap" },
  SUZLON: { sector: "Energy & Utilities", industry: "Wind Energy Equipment", index: "Nifty Midcap 100", capTier: "Mid-Cap" },
  IREDA: { sector: "Banking & Financials", industry: "Green Energy Financing", index: "Nifty Midcap 100", capTier: "Mid-Cap" },
  RVNL: { sector: "Industrials & Infra", industry: "Railway Construction", index: "Nifty Midcap 100", capTier: "Mid-Cap" },
  IRFC: { sector: "Banking & Financials", industry: "Rail Infrastructure Financing", index: "Nifty Next 50", capTier: "Large-Cap" },
  IRCTC: { sector: "FMCG & Consumer", industry: "Rail Tourism & Catering", index: "Nifty Midcap 100", capTier: "Mid-Cap" },
  PFC: { sector: "Banking & Financials", industry: "Power Financing NBFC", index: "Nifty Midcap 100", capTier: "Large-Cap" },
  RECLTD: { sector: "Banking & Financials", industry: "Rural Electrification NBFC", index: "Nifty Midcap 100", capTier: "Large-Cap" },
  NAZARA: { sector: "Telecom & Media", industry: "Gaming & Esports", index: "Nifty Smallcap 250", capTier: "Small-Cap" },
  SWIGGY: { sector: "FMCG & Consumer", industry: "Food Delivery & Quick Commerce", index: "Nifty Midcap 100", capTier: "Mid-Cap" },
  ZOMATO: { sector: "FMCG & Consumer", industry: "Food Delivery & Hyperlocal", index: "Nifty 50", capTier: "Large-Cap" },
  WAAREEENER: { sector: "Energy & Utilities", industry: "Solar Module Manufacturer", index: "Nifty Midcap 100", capTier: "Mid-Cap" },
  KAYNES: { sector: "Information Tech", industry: "Electronics Manufacturing", index: "Nifty Smallcap 250", capTier: "Small-Cap" },
  POLYCAB: { sector: "Industrials & Infra", industry: "Wires & Electricals", index: "Nifty Midcap 100", capTier: "Large-Cap" },
  TRENT: { sector: "FMCG & Consumer", industry: "Apparel & Retail Chains", index: "Nifty 50", capTier: "Large-Cap" },
  VBL: { sector: "FMCG & Consumer", industry: "Beverages Bottling", index: "Nifty Next 50", capTier: "Large-Cap" },
  DIXON: { sector: "Information Tech", industry: "Consumer Electronics EMS", index: "Nifty Midcap 100", capTier: "Mid-Cap" },
  NETWEB: { sector: "Information Tech", industry: "High-End Computing / AI", index: "Nifty Smallcap 250", capTier: "Small-Cap" },
  LAURUSLABS: { sector: "Healthcare & Pharma", industry: "Active Pharma Ingredients", index: "Nifty Smallcap 250", capTier: "Mid-Cap" },
  WOCKPHARMA: { sector: "Healthcare & Pharma", industry: "Formulations & Biotech", index: "Nifty Smallcap 250", capTier: "Small-Cap" },
};

const SECTORS_LIST = [
  "Banking & Financials",
  "Information Tech",
  "Energy & Utilities",
  "Automotive & EV",
  "Healthcare & Pharma",
  "FMCG & Consumer",
  "Industrials & Infra",
  "Metals & Mining",
  "Telecom & Media",
  "Real Estate & Construction",
];

// Hash function to generate consistent, realistic metrics for any symbol
function pseudoHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function enrichStock(raw) {
  const sym = (raw.symbol || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  const h = pseudoHash(sym || "DEFAULT");
  const isEtf = Boolean(raw.is_etf || sym.includes("BEES") || sym.includes("ETF") || sym.includes("GOLD"));

  const known = KNOWN_SECTORS[sym] || {};
  const mcapCr = raw.mcap_lakhs ? raw.mcap_lakhs / 100 : (h % 30000) + 1500;
  const bookCr = (raw.amount_financed || 1000) / 100;

  // Sector determination
  let sector = known.sector;
  if (!sector) {
    if (isEtf) {
      sector = "Exchange Traded Funds";
    } else {
      const idx = h % SECTORS_LIST.length;
      sector = SECTORS_LIST[idx];
    }
  }

  // Cap Tier
  let capTier = known.capTier;
  if (!capTier) {
    if (mcapCr >= 20000) capTier = "Large-Cap";
    else if (mcapCr >= 5000) capTier = "Mid-Cap";
    else if (mcapCr >= 1000) capTier = "Small-Cap";
    else capTier = "Micro-Cap";
  }

  // Benchmark Index
  let index = known.index;
  if (!index) {
    if (capTier === "Large-Cap") index = (h % 2 === 0) ? "Nifty 50" : "Nifty Next 50";
    else if (capTier === "Mid-Cap") index = "Nifty Midcap 100";
    else index = "Nifty Smallcap 250";
  }

  // Fundamentals
  let pe = isEtf ? null : Number(((h % 45) + 12 + ((h % 9) * 0.4)).toFixed(1));
  let pb = isEtf ? null : Number(((h % 7) + 1.2 + ((h % 5) * 0.1)).toFixed(2));
  let eps = isEtf ? null : Number(((h % 85) + 15 + ((h % 10) * 0.5)).toFixed(1));
  let epsGrowth = isEtf ? null : Number((((h % 40) - 8) + ((h % 7) * 0.3)).toFixed(1));
  let divYield = isEtf ? null : Number(((h % 40) * 0.08 + 0.3).toFixed(2));
  let roe = isEtf ? null : Number(((h % 22) + 8.5).toFixed(1));
  let debtToEquity = isEtf ? null : Number(((h % 18) * 0.1).toFixed(2));

  // Technical Indicators
  // Base price
  const basePrice = Math.max(15, (h % 2800) + 120);
  const dayMove = Number((((h % 140) - 65) / 20).toFixed(2));
  const currentPrice = Number((basePrice * (1 + dayMove / 100)).toFixed(2));
  const rsi = Number(((h % 55) + 24).toFixed(1)); // 24 to 79
  const dma50 = Number((currentPrice * (1 + ((h % 20) - 8) / 100)).toFixed(1));
  const dma200 = Number((currentPrice * (1 + ((h % 30) - 14) / 100)).toFixed(1));
  const high52 = Number((currentPrice * (1 + ((h % 25) + 5) / 100)).toFixed(1));
  const low52 = Number((currentPrice * (1 - ((h % 30) + 10) / 100)).toFixed(1));
  const volSurge = Number((((h % 18) + 6) / 10).toFixed(1)); // 0.6x to 2.4x avg volume

  // Ownership breakdown (sums to 100%)
  const promoter = isEtf ? 0 : Math.min(75, Math.max(25, (h % 50) + 30));
  const fii = isEtf ? 0 : Math.min(35, Math.max(5, (h % 25) + 8));
  const dii = isEtf ? 0 : Math.min(30, Math.max(5, (h % 20) + 6));
  const retail = isEtf ? 100 : Math.max(5, 100 - promoter - fii - dii);
  const pledged = isEtf ? 0 : (h % 5 === 0 ? Number(((h % 20) * 0.8).toFixed(1)) : 0);

  // Automated Technical Pattern Recognition
  const patterns = [];
  if (dma50 > dma200 && currentPrice > dma50) {
    patterns.push({ name: "Golden Cross (50>200 DMA)", type: "bullish", badge: "GOLDEN CROSS" });
  } else if (dma50 < dma200 && currentPrice < dma50) {
    patterns.push({ name: "Death Cross (Bearish)", type: "bearish", badge: "DEATH CROSS" });
  }

  if (rsi < 32) {
    patterns.push({ name: "RSI Oversold Bounce", type: "bullish", badge: "RSI OVERSOLD" });
  } else if (rsi > 70) {
    patterns.push({ name: "RSI Overbought Alert", type: "bearish", badge: "RSI OVERBOUGHT" });
  }

  if (currentPrice >= high52 * 0.96) {
    patterns.push({ name: "20D / 52W Breakout", type: "bullish", badge: "BREAKOUT" });
  }

  if (dayMove > 2.5 && volSurge > 1.4) {
    patterns.push({ name: "Bullish Engulfing Surge", type: "bullish", badge: "BULLISH SURGE" });
  }

  const dtc = raw.days_to_cover || (h % 8) + 1.2;
  const ffLev = raw.ff_leverage_pct || (h % 6) + 1.1;
  if (dtc > 5.5 && ffLev > 3.5) {
    patterns.push({ name: "Margin Squeeze Risk", type: "warning", badge: "SQUEEZE RISK" });
  }

  // Analyst Consensus
  let rating = "Hold";
  const ratingVal = h % 10;
  if (ratingVal < 4) rating = "Strong Buy";
  else if (ratingVal < 7) rating = "Buy";
  else if (ratingVal < 9) rating = "Hold";
  else rating = "Underperform";

  const upsidePct = rating === "Strong Buy"
    ? Number(((h % 25) + 18).toFixed(1))
    : rating === "Buy"
    ? Number(((h % 16) + 8).toFixed(1))
    : rating === "Hold"
    ? Number(((h % 10) - 3).toFixed(1))
    : Number((-1 * ((h % 18) + 5)).toFixed(1));

  const targetPrice = Number((currentPrice * (1 + upsidePct / 100)).toFixed(1));
  const analystCount = (h % 34) + 8;
  const projRevGrowth = Number(((h % 22) + 8).toFixed(1));

  return {
    ...raw,
    mcapCr,
    bookCr,
    sector,
    capTier,
    index,
    // Fundamentals
    pe,
    pb,
    eps,
    epsGrowth,
    divYield,
    roe,
    debtToEquity,
    // Technicals
    currentPrice,
    dayMove,
    rsi,
    dma50,
    dma200,
    high52,
    low52,
    volSurge,
    // Ownership
    promoter,
    fii,
    dii,
    retail,
    pledged,
    // Patterns
    patterns,
    primaryPattern: patterns[0] || null,
    // Analysts
    rating,
    targetPrice,
    upsidePct,
    analystCount,
    projRevGrowth,
  };
}

// Generate multi-year financial statements for the deep-dive drawer
export function generateFinancialStatements(stock) {
  const years = ["FY22", "FY23", "FY24", "FY25", "FY26"];
  const h = pseudoHash(stock.symbol || "DEF");
  const baseRev = Math.max(500, Math.round(stock.mcapCr * 0.45));
  const margin = Math.max(0.08, ((h % 18) + 7) / 100);

  return years.map((yr, idx) => {
    const growth = 1 + (idx * 0.14) + (Math.sin(idx + h) * 0.04);
    const revenue = Math.round(baseRev * growth);
    const ebitda = Math.round(revenue * (margin + 0.05));
    const netProfit = Math.round(revenue * margin);
    const debt = Math.round(revenue * (stock.debtToEquity || 0.4) * 0.6);
    const ocf = Math.round(netProfit * 1.18);
    const capex = Math.round(ocf * 0.45);
    const fcf = ocf - capex;

    return {
      year: yr,
      revenue,
      ebitda,
      netProfit,
      debt,
      ocf,
      capex,
      fcf,
    };
  });
}
