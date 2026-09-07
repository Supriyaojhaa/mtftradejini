/**
 * MTF Analytics Backend API Server (Node.js / Express)
 * Provides:
 * - REST: GET /api/market/quotes?symbols=HDFCBANK,RELIANCE,BSE,INFY,BEL,TCS
 * - SSE Stream: GET /api/market/stream?symbols=HDFCBANK,RELIANCE (Real-Time Live Push every 5-8s)
 * - Regulatory Haircuts: GET /api/haircuts?symbols=HDFCBANK
 * - EOD Ingestion Trigger: POST /api/worker/run
 * - Health Diagnostic: GET /api/health
 */

import express from "express";
import cors from "cors";
import { getLiveQuotes, quoteCache } from "../services/marketData.js";
import { getScripHaircut, haircutMasterMap, runFullDailyIngestion } from "./workers/nseMtfIngestion.js";
import { initScheduler } from "./workers/scheduler.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({ origin: "*" }));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (!req.path.includes("health") && !req.path.includes("stream")) {
      console.log(`[API] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

/**
 * 1. REST Endpoint: GET /api/market/quotes
 * Serves cached or freshly fetched quotes in normalized JSON format
 */
app.get(["/api/market/quotes", "/api/quotes"], async (req, res) => {
  try {
    const rawSymbols = req.query.symbols;
    if (!rawSymbols) {
      return res.status(400).json({
        error: "Missing required 'symbols' query parameter (e.g. /api/market/quotes?symbols=HDFCBANK,RELIANCE)",
      });
    }

    const symbols = String(rawSymbols)
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);

    if (symbols.length === 0) {
      return res.status(400).json({ error: "No valid stock symbols provided" });
    }

    const quotes = await getLiveQuotes(symbols);
    res.json(quotes);
  } catch (err) {
    console.error("[API Error] /api/market/quotes failed:", err);
    res.status(500).json({
      error: "Failed to fetch market quotes",
      message: err.message,
    });
  }
});

/**
 * 2. Server-Sent Events (SSE) Live Stream: GET /api/market/stream
 * Continuously pushes updated market quotes every 5 to 8 seconds during market hours
 */
app.get("/api/market/stream", async (req, res) => {
  const rawSymbols = req.query.symbols || "HDFCBANK,RELIANCE,BSE,INFY,BEL,TCS,ITC,JIOFIN,SUZLON,NAZARA";
  const symbols = String(rawSymbols)
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);

  // Set SSE Headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.flushHeaders?.();

  console.log(`[SSE Stream] Client connected for symbols: ${symbols.join(", ")}`);

  // Send initial data immediately
  try {
    const initialQuotes = await getLiveQuotes(symbols);
    res.write(`data: ${JSON.stringify(initialQuotes)}\n\n`);
  } catch (err) {
    console.warn("[SSE Stream] Initial quotes push failed:", err.message);
  }

  // Periodic push interval (every 8 seconds)
  const intervalTimeMs = Math.max(5000, Number(process.env.STREAM_INTERVAL_MS) || 8000);
  const streamTimer = setInterval(async () => {
    try {
      const liveQuotes = await getLiveQuotes(symbols);
      res.write(`data: ${JSON.stringify(liveQuotes)}\n\n`);
    } catch (err) {
      console.warn("[SSE Stream] Periodic push failed:", err.message);
    }
  }, intervalTimeMs);

  // Handle client disconnection cleanly
  req.on("close", () => {
    clearInterval(streamTimer);
    console.log(`[SSE Stream] Client disconnected. Stream interval terminated.`);
    res.end();
  });
});

/**
 * 3. Regulatory Haircut Master Endpoint: GET /api/haircuts
 */
app.get("/api/haircuts", (req, res) => {
  try {
    const rawSymbols = req.query.symbols;
    if (!rawSymbols) {
      const all = Array.from(haircutMasterMap.values());
      return res.json(all);
    }

    const symbols = String(rawSymbols)
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);

    const haircuts = symbols.map((sym) => getScripHaircut(sym));
    res.json(haircuts);
  } catch (err) {
    console.error("[API Error] /api/haircuts failed:", err);
    res.status(500).json({
      error: "Failed to fetch regulatory haircuts",
      message: err.message,
    });
  }
});

/**
 * 4. Manual Ingestion Pipeline Trigger: POST /api/worker/run
 */
app.post("/api/worker/run", async (req, res) => {
  try {
    const dateStr = req.body?.date || null;
    const result = await runFullDailyIngestion(dateStr);
    res.json({
      message: "Daily statutory MTF ingestion completed",
      result,
    });
  } catch (err) {
    console.error("[API Error] /api/worker/run failed:", err);
    res.status(500).json({
      error: "Ingestion pipeline run failed",
      message: err.message,
    });
  }
});

/**
 * 5. Health & Diagnostics Endpoint: GET /api/health
 */
app.get("/api/health", (req, res) => {
  res.json({
    status: "HEALTHY",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    cacheSize: quoteCache.size ? quoteCache.size() : 0,
    haircutMasterCount: haircutMasterMap.size,
    provider: process.env.MARKET_DATA_PROVIDER || "auto (yahoo-fallback)",
    version: "2.0.0",
  });
});

// Start Server & Worker Scheduler
app.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(`🚀 MTF Analytics Live Market Server running on port ${PORT}`);
  console.log(`📡 REST Quotes: http://localhost:${PORT}/api/market/quotes?symbols=HDFCBANK,RELIANCE`);
  console.log(`⚡ SSE Stream:  http://localhost:${PORT}/api/market/stream?symbols=HDFCBANK,RELIANCE`);
  console.log(`🛡️ Haircut API: http://localhost:${PORT}/api/haircuts?symbols=HDFCBANK`);
  console.log(`⏰ Scheduler:   Active (19:00 IST Monday - Friday)`);
  console.log(`================================================================`);

  // Initialize EOD Cron Job
  initScheduler();
});

export default app;

