import { useState, useEffect, useCallback, useRef } from "react";

// Standard fallback reference prices for Indian equities
const SEED_FALLBACK_PRICES = {
  HDFCBANK: { cmp: 1680.45, change: 12.30, percentChange: 0.74, dayHigh: 1692.00, dayLow: 1672.10, volume: 18450200 },
  RELIANCE: { cmp: 2984.60, change: -18.25, percentChange: -0.61, dayHigh: 3012.00, dayLow: 2975.00, volume: 8320400 },
  BSE: { cmp: 2624.10, change: 48.70, percentChange: 1.89, dayHigh: 2660.00, dayLow: 2590.00, volume: 3410200 },
  INFY: { cmp: 1842.25, change: 6.80, percentChange: 0.37, dayHigh: 1855.00, dayLow: 1834.00, volume: 5920100 },
  BEL: { cmp: 312.40, change: 4.15, percentChange: 1.35, dayHigh: 316.50, dayLow: 309.00, volume: 14200300 },
  TCS: { cmp: 4215.80, change: -14.50, percentChange: -0.34, dayHigh: 4245.00, dayLow: 4198.00, volume: 2100400 },
  ITC: { cmp: 486.20, change: 1.10, percentChange: 0.23, dayHigh: 490.00, dayLow: 484.00, volume: 12100400 },
  JIOFIN: { cmp: 342.15, change: 3.45, percentChange: 1.02, dayHigh: 346.00, dayLow: 338.50, volume: 24500100 },
  SUZLON: { cmp: 74.85, change: 1.45, percentChange: 1.98, dayHigh: 76.20, dayLow: 73.10, volume: 84100200 },
  NAZARA: { cmp: 942.30, change: -8.70, percentChange: -0.91, dayHigh: 958.00, dayLow: 935.00, volume: 1250400 },
  TATAMOTORS: { cmp: 1045.20, change: 15.30, percentChange: 1.49, dayHigh: 1056.00, dayLow: 1032.00, volume: 11200400 },
  SBIN: { cmp: 818.50, change: 4.20, percentChange: 0.52, dayHigh: 824.00, dayLow: 812.00, volume: 16400300 },
  ICICIBANK: { cmp: 1214.30, change: 8.90, percentChange: 0.74, dayHigh: 1222.00, dayLow: 1205.00, volume: 14300200 },
  AXISBANK: { cmp: 1178.60, change: -5.40, percentChange: -0.46, dayHigh: 1189.00, dayLow: 1170.00, volume: 9200400 },
  LT: { cmp: 3620.00, change: 32.50, percentChange: 0.91, dayHigh: 3645.00, dayLow: 3590.00, volume: 2400100 },
};

/**
 * useLiveQuotes Hook
 * Fetches and streams real-time market data with Server-Sent Events (SSE) and HTTP polling fallback.
 *
 * @param {string[]} symbols - Array of stock tickers (e.g. ['HDFCBANK', 'RELIANCE', 'BSE'])
 * @param {object} options - Options { enableSSE: true, pollIntervalMs: 15000 }
 */
export function useLiveQuotes(symbols = [], options = {}) {
  const { enableSSE = true, pollIntervalMs = 15000 } = options;

  const [quotes, setQuotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [priceTicks, setPriceTicks] = useState({}); // { SYMBOL: 'up' | 'down' }

  const symbolsList = Array.isArray(symbols) ? symbols : [symbols];
  const sortedKey = symbolsList.map((s) => s.trim().toUpperCase()).sort().join(",");
  const eventSourceRef = useRef(null);
  const prevQuotesRef = useRef({});

  // Process incoming quote batch and detect price ticks for animations
  const handleIncomingQuotes = useCallback((data) => {
    if (!Array.isArray(data)) return;

    const newMap = {};
    const newTicks = {};

    for (const item of data) {
      if (!item || !item.symbol) continue;
      const sym = item.symbol.toUpperCase();
      newMap[sym] = item;

      // Detect price tick direction
      const prev = prevQuotesRef.current[sym];
      if (prev && prev.cmp !== item.cmp) {
        newTicks[sym] = item.cmp > prev.cmp ? "up" : "down";
      }
    }

    prevQuotesRef.current = { ...prevQuotesRef.current, ...newMap };
    setQuotes((prev) => ({ ...prev, ...newMap }));
    if (Object.keys(newTicks).length > 0) {
      setPriceTicks((prev) => ({ ...prev, ...newTicks }));
      // Clear ticks after 1.2s for subtle animation reset
      setTimeout(() => {
        setPriceTicks((prev) => {
          const updated = { ...prev };
          for (const k of Object.keys(newTicks)) {
            delete updated[k];
          }
          return updated;
        });
      }, 1200);
    }

    setLastUpdated(new Date());
    setIsLive(true);
    setLoading(false);
    setError(null);
  }, []);

  // REST polling fallback
  const fetchQuotesRest = useCallback(async () => {
    if (!sortedKey) return;
    try {
      const res = await fetch(`/api/market/quotes?symbols=${encodeURIComponent(sortedKey)}`, {
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        const data = await res.json();
        handleIncomingQuotes(data);
      } else {
        throw new Error(`REST quote API returned ${res.status}`);
      }
    } catch (err) {
      // Local seed fallback
      const fallbackList = symbolsList.map((s) => {
        const upper = s.trim().toUpperCase();
        const seed = SEED_FALLBACK_PRICES[upper] || {
          cmp: 1000.0,
          change: 0.0,
          percentChange: 0.0,
          dayHigh: 1010.0,
          dayLow: 990.0,
          volume: 100000,
        };
        return {
          symbol: upper,
          ...seed,
          timestamp: new Date().toISOString(),
          isLive: false,
        };
      });

      handleIncomingQuotes(fallbackList);
      setIsLive(false);
      setIsStreaming(false);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [sortedKey, handleIncomingQuotes, symbolsList]);

  // Main setup: SSE with Polling Fallback
  useEffect(() => {
    if (!sortedKey) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Try Server-Sent Events (SSE) if enabled
    if (enableSSE && typeof window !== "undefined" && window.EventSource) {
      const streamUrl = `/api/market/stream?symbols=${encodeURIComponent(sortedKey)}`;
      const es = new EventSource(streamUrl);
      eventSourceRef.current = es;

      es.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          handleIncomingQuotes(parsed);
          setIsStreaming(true);
        } catch (parseErr) {
          console.warn("[useLiveQuotes] Failed to parse SSE message payload:", parseErr);
        }
      };

      es.onerror = () => {
        // SSE disconnected, fallback to HTTP polling
        setIsStreaming(false);
        es.close();
        fetchQuotesRest();
      };

      return () => {
        if (es) {
          es.close();
          eventSourceRef.current = null;
        }
      };
    } else {
      // Direct polling fallback
      fetchQuotesRest();
      const timer = setInterval(fetchQuotesRest, pollIntervalMs);
      return () => clearInterval(timer);
    }
  }, [sortedKey, enableSSE, pollIntervalMs, fetchQuotesRest, handleIncomingQuotes]);

  // Helper function to get quote for a specific ticker
  const getQuote = useCallback(
    (symbol) => {
      const upper = (symbol || "").toUpperCase().trim();
      if (quotes[upper]) return quotes[upper];
      const seed = SEED_FALLBACK_PRICES[upper];
      if (seed) {
        return {
          symbol: upper,
          ...seed,
          timestamp: new Date().toISOString(),
          isLive: false,
        };
      }
      return null;
    },
    [quotes]
  );

  return {
    quotes,
    loading,
    error,
    isLive,
    isStreaming,
    lastUpdated,
    priceTicks,
    getQuote,
    refetch: fetchQuotesRest,
  };
}

export default useLiveQuotes;

