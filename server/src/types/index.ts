/**
 * MTF Analytics Core Type Definitions
 * Strict TypeScript types for Market Quotes, MTF Disclosures, and Regulatory Haircuts
 */

export interface MarketQuote {
  symbol: string;
  cmp: number;
  change: number;
  percentChange: number;
  dayHigh: number | null;
  dayLow: number | null;
  volume: number;
  timestamp: string;
  provider: "upstox" | "dhan" | "yahoo" | "cache" | "fallback";
  isLive: boolean;
}

export interface ScripHaircut {
  symbol: string;
  exchange: "NSE" | "BSE";
  isin: string;
  varMarginPct: number;
  elmMarginPct: number;
  totalHaircutPct: number;
  category: "Group 1" | "Group 2" | "Group 3";
  maxLeverage: number;
  updatedAt: string;
}

export interface MtfDailyRecord {
  date: string;
  symbol: string;
  exchange: "NSE" | "BSE";
  isin: string;
  companyName: string;
  financedQuantity: number;
  amountFinancedLakhs: number;
  amountFinancedCr: number;
  marketCapLakhs: number | null;
  freeFloatMcapLakhs: number | null;
  leveragePct: number | null;
  ffLeveragePct: number | null;
  daysToCover: number | null;
  change30dPct: number | null;
  isEtf: boolean;
}

export interface IngestionResult {
  date: string;
  success: boolean;
  nseRecordsCount: number;
  bseRecordsCount: number;
  durationMs: number;
  timestamp: string;
  errors?: string[];
}
