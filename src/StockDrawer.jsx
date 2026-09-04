import React, { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  X,
  Star,
  Bell,
  TrendingUp,
  BarChart3,
  FileText,
  PieChart as PieIcon,
  Activity,
  Sliders,
  Check,
  AlertCircle,
  ShieldCheck,
  Target,
  Sparkles,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Trash2,
} from "lucide-react";
import { generateFinancialStatements } from "./stockDataEnricher";

export default function StockDrawer({
  stock,
  onClose,
  isWatchlisted,
  onToggleWatchlist,
  alerts,
  onAddAlert,
  onDeleteAlert,
  historyData,
}) {
  const [activeTab, setActiveTab] = useState("overview");
  const [chartPeriod, setChartPeriod] = useState("1Y");

  // Alert Form state
  const [alertType, setAlertType] = useState("price_above");
  const [alertValue, setAlertValue] = useState(
    stock ? Math.round(stock.currentPrice * 1.05) : 1000
  );
  const [alertSaved, setAlertSaved] = useState(false);

  // Financials 5-Year Data
  const financials = useMemo(() => {
    if (!stock) return [];
    return generateFinancialStatements(stock);
  }, [stock]);

  // Filtered stock chart data
  const visibleChartData = useMemo(() => {
    if (!historyData || !historyData.length) return [];
    const countMap = { "1M": 30, "3M": 90, "6M": 180, "1Y": 365, ALL: historyData.length };
    const n = countMap[chartPeriod] || historyData.length;
    return historyData.slice(-n);
  }, [historyData, chartPeriod]);

  if (!stock) return null;

  // Active alerts for this specific stock
  const stockAlerts = (alerts || []).filter((a) => a.symbol === stock.symbol);

  const handleCreateAlert = (e) => {
    e.preventDefault();
    if (!alertValue || isNaN(alertValue)) return;
    onAddAlert({
      id: Date.now().toString(),
      symbol: stock.symbol,
      type: alertType,
      targetValue: Number(alertValue),
      currentValue:
        alertType.includes("price") ? stock.currentPrice : alertType.includes("rsi") ? stock.rsi : stock.bookCr,
      createdDate: new Date().toISOString().slice(0, 10),
    });
    setAlertSaved(true);
    setTimeout(() => setAlertSaved(false), 2000);
  };

  return (
    <div className="drawerOverlay" onClick={onClose}>
      <div className="drawerPanel" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawerHeader">
          <div className="drawerTitleSection">
            <div className="drawerBadges">
              <span className={`exchangeBadge badge-${(stock.exchange || "NSE").toLowerCase()}`}>
                {stock.exchange || "NSE"}
              </span>
              <span className="drawerSectorBadge">{stock.sector || "Equities"}</span>
              <span className="drawerIndexBadge">{stock.index || "Nifty 50"}</span>
              {stock.is_etf && <span className="etfBadge">ETF</span>}
            </div>
            <div className="drawerHeadingRow">
              <h2 className="drawerTitle">
                {stock.name || stock.symbol}{" "}
                <span className="drawerSymbolMuted">({stock.symbol})</span>
              </h2>
            </div>
            <div className="drawerPriceLine">
              <span className="drawerCurrentPrice">₹{stock.currentPrice?.toLocaleString("en-IN")}</span>
              <span
                className={`drawerDayChange ${stock.dayMove >= 0 ? "positive" : "negative"}`}
              >
                {stock.dayMove >= 0 ? "+" : ""}
                {stock.dayMove}% (1D)
              </span>
              <span className="drawerMcapText">
                MCap: ₹{Number(stock.mcapCr).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Cr ({stock.capTier})
              </span>
            </div>
          </div>

          <div className="drawerActions">
            <button
              className={`drawerActionBtn ${isWatchlisted ? "starActive" : ""}`}
              onClick={() => onToggleWatchlist(stock.symbol)}
              title={isWatchlisted ? "Remove from Watchlist" : "Add to Watchlist"}
            >
              <Star size={17} fill={isWatchlisted ? "#f59e0b" : "none"} color={isWatchlisted ? "#f59e0b" : "currentColor"} />
            </button>
            <button
              className="drawerActionBtn"
              onClick={() => setActiveTab("alerts")}
              title="Set Price/Metric Alert"
            >
              <Bell size={17} />
              {stockAlerts.length > 0 && <span className="alertCounterDot" />}
            </button>
            <button className="drawerCloseBtn" onClick={onClose} title="Close drawer">
              <X size={19} />
            </button>
          </div>
        </div>

        {/* Drawer Tabs */}
        <div className="drawerTabs">
          <button
            className={`drawerTab ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <Activity size={14} /> Overview & MTF
          </button>
          <button
            className={`drawerTab ${activeTab === "financials" ? "active" : ""}`}
            onClick={() => setActiveTab("financials")}
          >
            <FileText size={14} /> 5Y Financials
          </button>
          <button
            className={`drawerTab ${activeTab === "ownership" ? "active" : ""}`}
            onClick={() => setActiveTab("ownership")}
          >
            <PieIcon size={14} /> Ownership
          </button>
          <button
            className={`drawerTab ${activeTab === "technicals" ? "active" : ""}`}
            onClick={() => setActiveTab("technicals")}
          >
            <BarChart3 size={14} /> Technicals & Patterns
          </button>
          <button
            className={`drawerTab ${activeTab === "analysts" ? "active" : ""}`}
            onClick={() => setActiveTab("analysts")}
          >
            <Target size={14} /> Analyst Targets
          </button>
          <button
            className={`drawerTab ${activeTab === "alerts" ? "active" : ""}`}
            onClick={() => setActiveTab("alerts")}
          >
            <Bell size={14} /> Alerts ({stockAlerts.length})
          </button>
        </div>

        {/* Drawer Content Body */}
        <div className="drawerBody">
          {/* TAB 1: Overview & MTF Chart */}
          {activeTab === "overview" && (
            <div className="drawerTabContent">
              <div className="drawerStatsRow">
                <div className="drawerStatBox">
                  <span>MTF BOOK</span>
                  <strong>₹{Number(stock.bookCr).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Cr</strong>
                  <small>Amount financed</small>
                </div>
                <div className="drawerStatBox">
                  <span>30D BOOK CHANGE</span>
                  <strong className={(stock.change_30d_pct || 0) >= 0 ? "positive" : "negative"}>
                    {(stock.change_30d_pct || 0) >= 0 ? "+" : ""}
                    {(stock.change_30d_pct || 0).toFixed(1)}%
                  </strong>
                  <small>Rolling 30 days</small>
                </div>
                <div className="drawerStatBox">
                  <span>FREE FLOAT LEV</span>
                  <strong>{stock.ff_leverage_pct ? `${stock.ff_leverage_pct.toFixed(2)}%` : " "}</strong>
                  <small>% of public float</small>
                </div>
                <div className="drawerStatBox">
                  <span>DAYS TO COVER</span>
                  <strong
                    className={
                      stock.days_to_cover > 7
                        ? "negative"
                        : stock.days_to_cover > 3
                        ? "warningText"
                        : "positive"
                    }
                  >
                    {stock.days_to_cover ? `${stock.days_to_cover.toFixed(1)}d` : " "}
                  </strong>
                  <small>Liquidity risk</small>
                </div>
              </div>

              {/* Chart Card */}
              <div className="card drawerSubCard">
                <div className="drawerCardHeader">
                  <div>
                    <h3 className="drawerSubheading">MTF Book & Exposure Trend</h3>
                    <p className="drawerSubDesc">Total amount financed under MTF over time</p>
                  </div>
                  <div className="segment">
                    {["1M", "3M", "6M", "1Y", "ALL"].map((p) => (
                      <button
                        key={p}
                        className={chartPeriod === p ? "on" : ""}
                        onClick={() => setChartPeriod(p)}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="drawerChartWrap">
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={visibleChartData}>
                      <defs>
                        <linearGradient id="drawerBookGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2681ff" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#2681ff" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#1c2940" strokeDasharray="2 3" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(d) => d.slice(5)}
                        tick={{ fill: "#7f8da5", fontSize: 10 }}
                        axisLine={false}
                      />
                      <YAxis
                        tickFormatter={(v) => `₹${Math.round(v)}Cr`}
                        tick={{ fill: "#7f8da5", fontSize: 10 }}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "#0b1424",
                          border: "1px solid #263650",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                        formatter={(val) => [`₹${Number(val).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Cr`, "MTF Financed Book"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="book"
                        stroke="#2681ff"
                        strokeWidth={2}
                        fill="url(#drawerBookGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Technical Pattern Recognition Preview */}
              <div className="card drawerSubCard">
                <h3 className="drawerSubheading">Automated Technical Diagnostics</h3>
                <div className="patternTagsList">
                  {stock.patterns && stock.patterns.length > 0 ? (
                    stock.patterns.map((p, idx) => (
                      <div key={idx} className={`patternDetailPill pill-${p.type}`}>
                        <Sparkles size={14} />
                        <div>
                          <strong>{p.name}</strong>
                          <span>Detected pattern on current charts</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="noPatternNotice">
                      Neutral technical momentum. No aggressive breakout or breakdown detected.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 5Y Financial Statements */}
          {activeTab === "financials" && (
            <div className="drawerTabContent">
              <div className="card drawerSubCard">
                <div className="drawerCardHeader">
                  <div>
                    <h3 className="drawerSubheading">5-Year Revenue & Net Profit Trend</h3>
                    <p className="drawerSubDesc">Consolidated Income Statement (₹ Cr)</p>
                  </div>
                </div>
                <div className="drawerChartWrap">
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={financials}>
                      <CartesianGrid stroke="#1c2940" strokeDasharray="2 3" vertical={false} />
                      <XAxis dataKey="year" tick={{ fill: "#7f8da5", fontSize: 11 }} axisLine={false} />
                      <YAxis
                        tickFormatter={(v) => `₹${Math.round(v / 1000)}k Cr`}
                        tick={{ fill: "#7f8da5", fontSize: 10 }}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "#0b1424",
                          border: "1px solid #263650",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                        formatter={(val) => [`₹${val.toLocaleString("en-IN")} Cr`]}
                      />
                      <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
                      <Bar dataKey="revenue" name="Total Revenue" fill="#2681ff" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="netProfit" name="Net Profit" fill="#18d57e" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Financial Ratios Grid */}
              <div className="drawerFinancialRatios">
                <div className="ratioItem">
                  <span>P/E RATIO</span>
                  <strong>{stock.pe ? `${stock.pe}x` : " "}</strong>
                </div>
                <div className="ratioItem">
                  <span>P/B RATIO</span>
                  <strong>{stock.pb ? `${stock.pb}x` : " "}</strong>
                </div>
                <div className="ratioItem">
                  <span>EPS (TTM)</span>
                  <strong>₹{stock.eps || " "}</strong>
                </div>
                <div className="ratioItem">
                  <span>EPS GROWTH YoY</span>
                  <strong className={(stock.epsGrowth || 0) >= 0 ? "positive" : "negative"}>
                    {(stock.epsGrowth || 0) >= 0 ? "+" : ""}
                    {stock.epsGrowth != null ? `${stock.epsGrowth}%` : " "}
                  </strong>
                </div>
                <div className="ratioItem">
                  <span>DIVIDEND YIELD</span>
                  <strong>{stock.divYield != null ? `${stock.divYield}%` : " "}</strong>
                </div>
                <div className="ratioItem">
                  <span>ROE (RETURN ON EQUITY)</span>
                  <strong>{stock.roe != null ? `${stock.roe}%` : " "}</strong>
                </div>
                <div className="ratioItem">
                  <span>DEBT TO EQUITY</span>
                  <strong>{stock.debtToEquity != null ? `${stock.debtToEquity}x` : " "}</strong>
                </div>
                <div className="ratioItem">
                  <span>1Y PROJ REV GROWTH</span>
                  <strong className="positive">+{stock.projRevGrowth}%</strong>
                </div>
              </div>

              {/* Cash Flow vs Debt Card */}
              <div className="card drawerSubCard">
                <h3 className="drawerSubheading">Cash Flow & Capital Expenditure (₹ Cr)</h3>
                <div className="financialTableWrap">
                  <table className="miniFinancialTable">
                    <thead>
                      <tr>
                        <th>Year</th>
                        <th>Revenue</th>
                        <th>Operating Cash Flow</th>
                        <th>CapEx</th>
                        <th>Free Cash Flow</th>
                        <th>Total Debt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {financials.map((f) => (
                        <tr key={f.year}>
                          <td>{f.year}</td>
                          <td>₹{f.revenue.toLocaleString("en-IN")} Cr</td>
                          <td className="positive">₹{f.ocf.toLocaleString("en-IN")} Cr</td>
                          <td>₹{f.capex.toLocaleString("en-IN")} Cr</td>
                          <td className="positive">₹{f.fcf.toLocaleString("en-IN")} Cr</td>
                          <td>₹{f.debt.toLocaleString("en-IN")} Cr</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Ownership & Shareholding */}
          {activeTab === "ownership" && (
            <div className="drawerTabContent">
              <div className="card drawerSubCard">
                <h3 className="drawerSubheading">Shareholding Distribution</h3>
                <p className="drawerSubDesc">Latest shareholding pattern disclosures</p>

                <div className="ownershipBarsWrap">
                  <div className="ownershipBarHeader">
                    <span>Promoters: <b>{stock.promoter}%</b></span>
                    <span>FII (Foreign): <b>{stock.fii}%</b></span>
                    <span>DII (Domestic): <b>{stock.dii}%</b></span>
                    <span>Public / Retail: <b>{stock.retail}%</b></span>
                  </div>

                  <div className="stackedOwnershipBar">
                    <div className="ownPart ownPromoter" style={{ width: `${stock.promoter}%` }} title={`Promoters: ${stock.promoter}%`} />
                    <div className="ownPart ownFii" style={{ width: `${stock.fii}%` }} title={`FIIs: ${stock.fii}%`} />
                    <div className="ownPart ownDii" style={{ width: `${stock.dii}%` }} title={`DIIs: ${stock.dii}%`} />
                    <div className="ownPart ownRetail" style={{ width: `${stock.retail}%` }} title={`Public Retail: ${stock.retail}%`} />
                  </div>

                  <div className="ownershipLegendRow">
                    <span><i className="ownDot dotPromoter" /> Promoters ({stock.promoter}%)</span>
                    <span><i className="ownDot dotFii" /> FII / Foreign Inst ({stock.fii}%)</span>
                    <span><i className="ownDot dotDii" /> DII / Mutual Funds ({stock.dii}%)</span>
                    <span><i className="ownDot dotRetail" /> Retail & Others ({stock.retail}%)</span>
                  </div>
                </div>
              </div>

              <div className="drawerStatsRow">
                <div className="drawerStatBox">
                  <span>PROMOTER PLEDGE</span>
                  <strong className={stock.pledged > 0 ? "negative" : "positive"}>
                    {stock.pledged ? `${stock.pledged}%` : "0% (Zero Pledge)"}
                  </strong>
                  <small>Shares pledged with lenders</small>
                </div>
                <div className="drawerStatBox">
                  <span>INSTITUTIONAL FLOAT</span>
                  <strong>{(stock.fii + stock.dii).toFixed(1)}%</strong>
                  <small>FII + DII combined</small>
                </div>
                <div className="drawerStatBox">
                  <span>RETAIL OWNERSHIP</span>
                  <strong>{stock.retail}%</strong>
                  <small>Public non-institutional</small>
                </div>
                <div className="drawerStatBox">
                  <span>FREE FLOAT LEVERAGE</span>
                  <strong>{stock.ff_leverage_pct ? `${stock.ff_leverage_pct.toFixed(2)}%` : " "}</strong>
                  <small>MTF book / Float</small>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Technicals & Pattern Diagnostics */}
          {activeTab === "technicals" && (
            <div className="drawerTabContent">
              <div className="drawerStatsRow">
                <div className="drawerStatBox">
                  <span>RSI (14D)</span>
                  <strong
                    className={
                      stock.rsi < 30 ? "positive" : stock.rsi > 70 ? "negative" : "neutral"
                    }
                  >
                    {stock.rsi}
                  </strong>
                  <small>{stock.rsi < 30 ? "Oversold" : stock.rsi > 70 ? "Overbought" : "Neutral"}</small>
                </div>
                <div className="drawerStatBox">
                  <span>50-DMA</span>
                  <strong>₹{stock.dma50}</strong>
                  <small className={stock.currentPrice > stock.dma50 ? "positive" : "negative"}>
                    {stock.currentPrice > stock.dma50 ? "Above 50-DMA" : "Below 50-DMA"}
                  </small>
                </div>
                <div className="drawerStatBox">
                  <span>200-DMA</span>
                  <strong>₹{stock.dma200}</strong>
                  <small className={stock.currentPrice > stock.dma200 ? "positive" : "negative"}>
                    {stock.currentPrice > stock.dma200 ? "Above 200-DMA" : "Below 200-DMA"}
                  </small>
                </div>
                <div className="drawerStatBox">
                  <span>VOLUME SURGE</span>
                  <strong>{stock.volSurge}x</strong>
                  <small>vs 30-day average volume</small>
                </div>
              </div>

              {/* 52-Week Range Bar */}
              <div className="card drawerSubCard">
                <h3 className="drawerSubheading">52-Week Price Range</h3>
                <div className="rangeBarContainer">
                  <div className="rangeLabels">
                    <span>52W Low: <b>₹{stock.low52}</b></span>
                    <span>Current: <b>₹{stock.currentPrice}</b></span>
                    <span>52W High: <b>₹{stock.high52}</b></span>
                  </div>
                  <div className="rangeTrack">
                    <div
                      className="rangePin"
                      style={{
                        left: `${Math.min(
                          100,
                          Math.max(
                            0,
                            ((stock.currentPrice - stock.low52) / (stock.high52 - stock.low52 || 1)) * 100
                          )
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Automated Pattern Recognition */}
              <div className="card drawerSubCard">
                <h3 className="drawerSubheading">Detected Chart Patterns</h3>
                <div className="patternListDetailed">
                  {stock.patterns && stock.patterns.length > 0 ? (
                    stock.patterns.map((p, i) => (
                      <div key={i} className="patternRowItem">
                        <div className={`patternTag pill-${p.type}`}>{p.badge}</div>
                        <div className="patternText">
                          <strong>{p.name}</strong>
                          <p>
                            {p.badge === "GOLDEN CROSS"
                              ? "The short-term 50-day moving average has moved above the long-term 200-day moving average, signaling potential sustained upward momentum."
                              : p.badge === "BREAKOUT"
                              ? "Stock is trading within 4% of its 52-week peak with rising institutional participation."
                              : p.badge === "RSI OVERSOLD"
                              ? "14-day Relative Strength Index is below 30, signaling heavily oversold territory and potential mean reversion bounce."
                              : p.badge === "SQUEEZE RISK"
                              ? "High MTF amount financed relative to a small floating supply creates a high margin-call cascade risk if prices fall sharply."
                              : "Momentum signal identified from automated quantitative price & volume scan."}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="noPatternNotice">No high-probability candlestick or moving-average triggers detected today.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Analyst Consensus & Targets */}
          {activeTab === "analysts" && (
            <div className="drawerTabContent">
              <div className="card drawerSubCard">
                <div className="analystHeaderStrip">
                  <div>
                    <span className="analystRatingBadge rating-buy">{stock.rating}</span>
                    <h3 className="analystTargetHeadline">
                      Target: ₹{stock.targetPrice}{" "}
                      <span className={stock.upsidePct >= 0 ? "positive" : "negative"}>
                        ({stock.upsidePct >= 0 ? "+" : ""}{stock.upsidePct}% Potential)
                      </span>
                    </h3>
                    <p className="analystCoverageText">Based on consensus of {stock.analystCount} institutional research analysts</p>
                  </div>
                </div>

                {/* Target Price Horizon Wall */}
                <div className="targetWall">
                  <div className="targetStep">
                    <span>Current Price</span>
                    <strong>₹{stock.currentPrice}</strong>
                  </div>
                  <div className="targetArrow">→</div>
                  <div className="targetStep targetHighlight">
                    <span>Consensus Target (12M)</span>
                    <strong>₹{stock.targetPrice}</strong>
                  </div>
                  <div className="targetArrow">→</div>
                  <div className="targetStep">
                    <span>High Estimate</span>
                    <strong>₹{Math.round(stock.targetPrice * 1.15)}</strong>
                  </div>
                </div>
              </div>

              {/* Analyst Rating Distribution */}
              <div className="card drawerSubCard">
                <h3 className="drawerSubheading">Institutional Recommendations</h3>
                <div className="ratingsBreakdown">
                  <div className="ratingBarSegment">
                    <span className="ratingBarLabel">Strong Buy / Buy</span>
                    <div className="ratingTrack">
                      <div className="ratingFill buyFill" style={{ width: "72%" }} />
                    </div>
                    <span className="ratingCount">72%</span>
                  </div>
                  <div className="ratingBarSegment">
                    <span className="ratingBarLabel">Hold</span>
                    <div className="ratingTrack">
                      <div className="ratingFill holdFill" style={{ width: "20%" }} />
                    </div>
                    <span className="ratingCount">20%</span>
                  </div>
                  <div className="ratingBarSegment">
                    <span className="ratingBarLabel">Sell / Underperform</span>
                    <div className="ratingTrack">
                      <div className="ratingFill sellFill" style={{ width: "8%" }} />
                    </div>
                    <span className="ratingCount">8%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Price & Metric Alerts */}
          {activeTab === "alerts" && (
            <div className="drawerTabContent">
              <div className="card drawerSubCard">
                <h3 className="drawerSubheading">Create Custom Trigger Alert</h3>
                <p className="drawerSubDesc">
                  Receive instant notifications when {stock.symbol} crosses designated levels.
                </p>

                <form onSubmit={handleCreateAlert} className="alertForm">
                  <div className="alertFormRow">
                    <label>
                      <span>Alert Condition:</span>
                      <select value={alertType} onChange={(e) => setAlertType(e.target.value)}>
                        <option value="price_above">Price crosses Above (₹)</option>
                        <option value="price_below">Price drops Below (₹)</option>
                        <option value="rsi_below">RSI drops Below (Oversold)</option>
                        <option value="rsi_above">RSI crosses Above (Overbought)</option>
                        <option value="book_above">MTF Book exceeds (₹ Cr)</option>
                      </select>
                    </label>

                    <label>
                      <span>Threshold Value:</span>
                      <input
                        type="number"
                        step="any"
                        value={alertValue}
                        onChange={(e) => setAlertValue(e.target.value)}
                        placeholder="e.g. 1500"
                        required
                      />
                    </label>

                    <button type="submit" className="btn createAlertBtn">
                      <Plus size={15} /> Add Alert
                    </button>
                  </div>
                  {alertSaved && (
                    <div className="alertSuccessNotice">
                      <Check size={14} /> Alert set for {stock.symbol}! Saved to local alerts.
                    </div>
                  )}
                </form>
              </div>

              {/* Active Alerts for this stock */}
              <div className="card drawerSubCard">
                <h3 className="drawerSubheading">Active Alerts for {stock.symbol}</h3>
                {stockAlerts.length === 0 ? (
                  <p className="noPatternNotice">No active triggers for this stock. Create one above!</p>
                ) : (
                  <div className="activeAlertsList">
                    {stockAlerts.map((al) => (
                      <div key={al.id} className="alertItemRow">
                        <div className="alertItemInfo">
                          <Bell size={15} className="positive" />
                          <div>
                            <strong>
                              {al.type.replace(/_/g, " ").toUpperCase()}: {al.targetValue}
                            </strong>
                            <span>Created on {al.createdDate}</span>
                          </div>
                        </div>
                        <button
                          className="alertDeleteBtn"
                          onClick={() => onDeleteAlert(al.id)}
                          title="Delete Alert"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
