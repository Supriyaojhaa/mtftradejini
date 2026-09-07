import React, { useState } from "react";
import {
  Layers,
  Database,
  Calculator,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Clock,
  RefreshCw,
  GitMerge,
  Percent,
  TrendingDown,
  TrendingUp,
  Scale,
  ShieldCheck,
  CheckCircle2,
  FileText,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Info
} from "lucide-react";

export default function MethodologyContent({ onNavigate }) {
  // State for expandable technical accordion blocks
  const [expandedPipelines, setExpandedPipelines] = useState({
    sourcing: true,
    timing: true,
    mapping: false,
    limitations: true
  });

  const togglePipeline = (key) => {
    setExpandedPipelines((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="docContentBlock">
      {/* 1. Header & Overview */}
      <section id="methodology-overview" className="docSection">
        <div className="docHeroCard">
          <div className="docHeroBadge">
            <Layers size={13} className="text-emerald" />
            <span>QUANTITATIVE FRAMEWORK & FORMULAS</span>
          </div>
          <h1 className="docHeroTitle">
            MTF Quantitative Methodology & Data Architecture
          </h1>
          <p className="docHeroSubtitle">
            A rigorous, transparent documentation of the mathematical formulas, data ingestion pipelines, entity resolution
            algorithms, statutory tax schedules, and risk threshold classifications powering the MTF Analytics engine.
          </p>

          <div className="docMethodologyNavPills">
            <a href="#pipelines" className="docNavPill">
              <Database size={13} />
              <span>Data Pipelines</span>
            </a>
            <a href="#formulas" className="docNavPill">
              <Calculator size={13} />
              <span>Core Formulas</span>
            </a>
            <a href="#crowding" className="docNavPill">
              <Percent size={13} />
              <span>Crowding Index</span>
            </a>
            <a href="#carry-model" className="docNavPill">
              <Scale size={13} />
              <span>Carry & Break-Even</span>
            </a>
            <a href="#limitations" className="docNavPill">
              <AlertTriangle size={13} />
              <span>Edge Cases</span>
            </a>
          </div>
        </div>
      </section>

      {/* 2. Data Sourcing & Pipelines */}
      <section id="pipelines" className="docSection">
        <div className="docSectionHeader">
          <div className="docSectionTag">INGESTION & RECONCILIATION</div>
          <h2 className="docSectionTitle">Data Sourcing & Refresh Pipelines</h2>
          <p className="docSectionDesc">
            How exchange disclosures move from raw statutory member filings to normalized analytics.
          </p>
        </div>

        <div className="docAccordionList">
          {/* Accordion 1: Statutory Disclosures */}
          <div className={`docAccordionCard ${expandedPipelines.sourcing ? "open" : ""}`}>
            <div className="docAccordionHead" onClick={() => togglePipeline("sourcing")}>
              <div className="docAccordionTitleRow">
                <div className="docAccordionIcon">
                  <Database size={18} className="text-cyan" />
                </div>
                <div>
                  <h3>1. Statutory Exchange Reporting (NSE & BSE)</h3>
                  <span>Mandatory regulatory disclosures under SEBI Master Circular</span>
                </div>
              </div>
              <button className="docAccordionToggle" aria-label="Toggle accordion">
                {expandedPipelines.sourcing ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>

            {expandedPipelines.sourcing && (
              <div className="docAccordionBody">
                <p>
                  Margin Trading Facility (MTF) positions are governed by the Securities and Exchange Board of India (SEBI)
                  under framework circular CIR/MRD/DP/54/2017. All SEBI-registered member trading brokers providing margin financing
                  are legally mandated to report their client-level financed positions to the clearing corporations at the close of every
                  trading session.
                </p>
                <div className="docSubGrid2">
                  <div className="docSubBox">
                    <b className="docSubBoxTitle">NSE Ingestion Feed</b>
                    <p>
                      Sourced directly from NSE Clearing Limited (NCL) daily member MTF disclosures. Includes ISIN, security symbol,
                      funded quantity, funded value, and collateral pledge quantities for all eligible securities in Category 1 and Category 2.
                    </p>
                  </div>
                  <div className="docSubBox">
                    <b className="docSubBoxTitle">BSE Ingestion Feed</b>
                    <p>
                      Sourced from Indian Clearing Corporation Limited (ICCL) end-of-day reports. Normalizes BSE scrip codes against universal
                      National Stock Exchange equity symbols via common primary International Securities Identification Numbers (ISINs).
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Accordion 2: Timing & Frequency */}
          <div className={`docAccordionCard ${expandedPipelines.timing ? "open" : ""}`}>
            <div className="docAccordionHead" onClick={() => togglePipeline("timing")}>
              <div className="docAccordionTitleRow">
                <div className="docAccordionIcon">
                  <Clock size={18} className="text-emerald" />
                </div>
                <div>
                  <h3>2. Timing, Dissemination Lag & Batch Windows</h3>
                  <span>Understanding the statutory reporting timeline from market close to publication</span>
                </div>
              </div>
              <button className="docAccordionToggle" aria-label="Toggle accordion">
                {expandedPipelines.timing ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>

            {expandedPipelines.timing && (
              <div className="docAccordionBody">
                <p>
                  Unlike instantaneous trading volume, margin leverage books represent settled financial commitments requiring member broker
                  audit reconciliation. The timeline below illustrates our data pipeline cycle:
                </p>

                <div className="docTimeline">
                  <div className="docTimelineItem">
                    <div className="docTimelineBadge">T-Day 15:30 IST</div>
                    <div className="docTimelineContent">
                      <b>Market Close & Session Freeze</b>
                      <span>Equities conclude regular trading session. Broker risk engines compute day-end client collateral haircuts.</span>
                    </div>
                  </div>

                  <div className="docTimelineItem">
                    <div className="docTimelineBadge">T-Day 20:00 - 23:30 IST</div>
                    <div className="docTimelineContent">
                      <b>Member Broker Reporting Window</b>
                      <span>Clearing members transmit statutory MTF position files to NCL and ICCL clearing repositories.</span>
                    </div>
                  </div>

                  <div className="docTimelineItem">
                    <div className="docTimelineBadge">T+1 07:30 - 08:45 IST</div>
                    <div className="docTimelineContent">
                      <b>Exchange Dissemination & Normalization Pipeline</b>
                      <span>Exchanges publish validated aggregate files. MTF Analytics runs deduplication, cross-exchange correlation, and free-float calculations.</span>
                    </div>
                  </div>

                  <div className="docTimelineItem">
                    <div className="docTimelineBadge">T+1 09:00 IST</div>
                    <div className="docTimelineContent">
                      <b>Live Market Intelligence Published</b>
                      <span>Updated leverage books, screener filters, sector rollups, and crowding indices go live before the market open.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Accordion 3: Entity Resolution */}
          <div className={`docAccordionCard ${expandedPipelines.mapping ? "open" : ""}`}>
            <div className="docAccordionHead" onClick={() => togglePipeline("mapping")}>
              <div className="docAccordionTitleRow">
                <div className="docAccordionIcon">
                  <GitMerge size={18} className="text-blue" />
                </div>
                <div>
                  <h3>3. Dual-Listed Equity Resolution & ISIN Deduplication</h3>
                  <span>Harmonizing multi-exchange exposures without double-counting</span>
                </div>
              </div>
              <button className="docAccordionToggle" aria-label="Toggle accordion">
                {expandedPipelines.mapping ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>

            {expandedPipelines.mapping && (
              <div className="docAccordionBody">
                <p>
                  Over 85% of active MTF volume in India occurs in companies dual-listed on both NSE and BSE. To provide a faithful
                  institutional view of leverage concentration without distorting company-level metrics, our engine enforces:
                </p>
                <ul className="docBulletList">
                  <li>
                    <b>Canonical ISIN Mapping:</b> The 12-character alphanumeric International Securities Identification Number (e.g., INE002A01018 for Reliance Industries) serves as the immutable primary key.
                  </li>
                  <li>
                    <b>Combined Book Consolidation:</b> Total Financed Quantity equals NSE Financed Quantity plus BSE Financed Quantity. The consolidated value is re-priced using the primary volume-weighted closing price (NSE).
                  </li>
                  <li>
                    <b>Liquidity Attribution:</b> Traders can inspect exchange-level breakdown tabs to evaluate whether borrowing is concentrated primarily on NSE or split across regional BSE market makers.
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. Core Metrics & Quantitative Formulas */}
      <section id="formulas" className="docSection">
        <div className="docSectionHeader">
          <div className="docSectionTag">MATHEMATICAL MODELS</div>
          <h2 className="docSectionTitle">Core Quantitative Formulas & Metrics</h2>
          <p className="docSectionDesc">
            Mathematical definitions and interpretation guides for the primary indicators across MTF Analytics.
          </p>
        </div>

        {/* Formula 1: Gross MTF Value */}
        <div className="docFormulaCard">
          <div className="docFormulaHead">
            <div className="docFormulaBadge">METRIC 01</div>
            <h3 className="docFormulaName">Gross MTF Outstanding Value (₹ Cr)</h3>
          </div>
          <p className="docFormulaDesc">
            Measures the aggregate total market value of all shares currently financed through margin lending across eligible securities.
          </p>

          <div className="docMathBlock">
            <div className="docMathDisplay">
              <span>Gross MTF Value (₹ Cr)</span>
              <span className="docMathEq">=</span>
              <div className="docMathFraction">
                <span className="docMathNum">
                  &sum;<sub>i=1</sub><sup>N</sup> ( Financed Shares<sub>i</sub> &times; Closing Price<sub>i</sub> )
                </span>
                <span className="docMathDen">10,00,00,000 (10<sup>7</sup>)</span>
              </div>
            </div>
          </div>

          <div className="docVariableTableWrap">
            <table className="docVariableTable">
              <thead>
                <tr>
                  <th>Variable</th>
                  <th>Description</th>
                  <th>Source / Unit</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>Financed Shares</code></td>
                  <td>Total quantity of equity shares financed by member brokers and pledged to clearing corp</td>
                  <td>NCL + ICCL Disclosures (Units)</td>
                </tr>
                <tr>
                  <td><code>Closing Price</code></td>
                  <td>Official exchange closing settlement price on observation date</td>
                  <td>NSE Closing Price (₹)</td>
                </tr>
                <tr>
                  <td><code>10<sup>7</sup></code></td>
                  <td>Denominator divisor to normalize Rupee values into Indian Crores (₹ Cr)</td>
                  <td>1 Crore = 10,000,000</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="docInsightNote">
            <Info size={16} className="text-cyan" />
            <div>
              <b>Valuation Fluctuation vs Fresh Borrowing:</b> An increase in Gross MTF Value can result from organic share price appreciation even when no new shares were borrowed. To distinguish genuine demand accumulation from price inflation, always cross-reference with <b>Daily Net Flow</b>.
            </div>
          </div>
        </div>

        {/* Formula 2: Crowding Index (MTF as % of Free Float) */}
        <div id="crowding" className="docFormulaCard">
          <div className="docFormulaHead">
            <div className="docFormulaBadge">METRIC 02</div>
            <h3 className="docFormulaName">Free Float Leverage Ratio (Crowding Index)</h3>
          </div>
          <p className="docFormulaDesc">
            Measures the proportion of a company's freely tradeable non-promoter share float that is tied up in margin debt.
            This is the premier indicator of retail crowding and vulnerable stop-loss concentration.
          </p>

          <div className="docMathBlock">
            <div className="docMathDisplay">
              <span>Free Float Leverage Ratio (%)</span>
              <span className="docMathEq">=</span>
              <div className="docMathFraction">
                <span className="docMathNum">Total Financed MTF Shares</span>
                <span className="docMathDen">Total Free Float Shares</span>
              </div>
              <span className="docMathEq">&times; 100</span>
            </div>
          </div>

          <div className="docSectionSubTitle">Quantitative Risk Thresholds</div>
          <div className="docThresholdsGrid">
            <div className="docThresholdCard healthy">
              <div className="docThresholdTop">
                <span className="docThresholdTag">&lt; 3.0%</span>
                <b className="docThresholdLabel">Healthy / Institutional</b>
              </div>
              <p className="docThresholdText">
                Leverage is low relative to floating liquidity. Natural market makers and cash investors absorb daily volatility. Minimal forced liquidation risk.
              </p>
            </div>

            <div className="docThresholdCard elevated">
              <div className="docThresholdTop">
                <span className="docThresholdTag">3.0% - 7.0%</span>
                <b className="docThresholdLabel">Elevated Leverage</b>
              </div>
              <p className="docThresholdText">
                Retail crowd participation is significant. Price corrections of 5% to 8% will trigger selective margin call warnings. Exercise caution on breakout buys.
              </p>
            </div>

            <div className="docThresholdCard dangerous">
              <div className="docThresholdTop">
                <span className="docThresholdTag">&gt; 7.0%</span>
                <b className="docThresholdLabel">Extreme Squeeze Risk</b>
              </div>
              <p className="docThresholdText">
                Hyper-crowded long leverage. A minor adverse move can trigger cascading automated broker liquidations. High vulnerability to violent long flushes.
              </p>
            </div>
          </div>
        </div>

        {/* Formula 3: Daily Net Flow */}
        <div className="docFormulaCard">
          <div className="docFormulaHead">
            <div className="docFormulaBadge">METRIC 03</div>
            <h3 className="docFormulaName">Daily Leverage Net Shift (Net Flow)</h3>
          </div>
          <p className="docFormulaDesc">
            Isolates the net daily delta between fresh margin borrowing and liquidated/unwound positions to reveal true institutional conviction.
          </p>

          <div className="docMathBlock">
            <div className="docMathDisplay">
              <span>Daily Net Flow (₹ Cr)</span>
              <span className="docMathEq">=</span>
              <span>Fresh MTF Borrowing (₹ Cr)</span>
              <span className="docMathEq">&minus;</span>
              <span>Liquidated/Unwound MTF (₹ Cr)</span>
            </div>
          </div>

          <div className="docFlowInterpretGrid">
            <div className="docFlowInterpretCard pos">
              <TrendingUp size={20} className="text-emerald" />
              <div>
                <b>Positive Net Flow (+): Capital Accumulation</b>
                <p>Fresh borrowing outpaces unwinding. Traders are aggressively leveraging into current price action, expanding aggregate book size.</p>
              </div>
            </div>
            <div className="docFlowInterpretCard neg">
              <TrendingDown size={20} className="text-crimson" />
              <div>
                <b>Negative Net Flow (&minus;): De-leveraging & Flush</b>
                <p>Positions are closing faster than new borrowing. Signals either voluntary profit-taking at cycle peaks or forced margin call liquidations during pullbacks.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Formula 4: Carry Cost & Break-Even Model */}
        <div id="carry-model" className="docFormulaCard">
          <div className="docFormulaHead">
            <div className="docFormulaBadge">METRIC 04</div>
            <h3 className="docFormulaName">Holding Carry Cost & Effective Break-Even Model</h3>
          </div>
          <p className="docFormulaDesc">
            Quantifies the complete financial drag of borrowed capital over time, factoring in daily financing interest, 18% GST, statutory taxes, and depository fees.
          </p>

          <div className="docMathBlock">
            <div className="docMathDisplay">
              <span>Total Cost (₹)</span>
              <span className="docMathEq">=</span>
              <span>Borrowed Loan &times; ( R<sub>ann</sub> / 365 ) &times; Days &times; ( 1 + 0.18 )</span>
              <span className="docMathEq">+</span>
              <span>Statutory Taxes</span>
              <span className="docMathEq">+</span>
              <span>Pledge Fees</span>
            </div>
          </div>

          <div className="docTaxScheduleCard">
            <h4 className="docTaxTitle">Statutory Indian Capital Market Levies Incorporated in Break-Even</h4>
            <div className="docTaxGrid">
              <div className="docTaxItem">
                <span className="docTaxName">Securities Transaction Tax (STT)</span>
                <b className="docTaxRate">0.10% (Delivery Buy) + 0.10% (Delivery Sell)</b>
              </div>
              <div className="docTaxItem">
                <span className="docTaxName">Exchange Turnover Fee (NSE)</span>
                <b className="docTaxRate">0.00297% on both Buy and Sell value</b>
              </div>
              <div className="docTaxItem">
                <span className="docTaxName">SEBI Regulatory Turnover Fee</span>
                <b className="docTaxRate">₹10 per Crore (0.0001%)</b>
              </div>
              <div className="docTaxItem">
                <span className="docTaxName">Integrated Stamp Duty (State)</span>
                <b className="docTaxRate">0.0015% (Buy side only)</b>
              </div>
              <div className="docTaxItem">
                <span className="docTaxName">Goods & Services Tax (GST)</span>
                <b className="docTaxRate">18% applied to Brokerage, Financing Interest & Charges</b>
              </div>
              <div className="docTaxItem">
                <span className="docTaxName">CDSL / NSDL Unpledge Fee</span>
                <b className="docTaxRate">₹12.50 to ₹15.00 + 18% GST per ISIN</b>
              </div>
            </div>
          </div>

          <div className="docFormulaActionRow">
            <button className="docLaunchCalcBtn" onClick={() => onNavigate && onNavigate("calc")}>
              <Calculator size={15} />
              <span>Interactive Model: Open MTF Leverage & Carry Calculator</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4. Data Limitations & Edge Cases */}
      <section id="limitations" className="docSection">
        <div className="docSectionHeader">
          <div className="docSectionTag">BOUNDARY CONDITIONS</div>
          <h2 className="docSectionTitle">Data Limitations, Surveillance & Edge Cases</h2>
          <p className="docSectionDesc">
            Critical operational boundary conditions that every quantitative trader and risk analyst should understand.
          </p>
        </div>

        <div className="docLimitsGrid">
          <div className="docLimitCard">
            <div className="docLimitIcon">
              <AlertTriangle size={18} className="text-amber" />
            </div>
            <h4 className="docLimitTitle">ASM & GSM Surveillance Exclusions</h4>
            <p className="docLimitText">
              Securities placed under SEBI Additional Surveillance Measure (ASM Long-Term or Short-Term) or Graded Surveillance Measure (GSM)
              are subjected to mandatory 100% margin requirements by exchanges. When an equity enters ASM/GSM, brokers are prohibited from issuing
              fresh MTF funding. Existing books must either be converted to cash or liquidated, resulting in abrupt book reductions.
            </p>
          </div>

          <div className="docLimitCard">
            <div className="docLimitIcon">
              <Scale size={18} className="text-blue" />
            </div>
            <h4 className="docLimitTitle">Broker-Specific Collateral Haircuts</h4>
            <p className="docLimitText">
              While SEBI establishes minimum regulatory haircuts (VaR + 3 &times; Extreme Loss Margin), individual brokerage risk teams often
              impose stricter internal haircuts (e.g., 35% to 50% instead of 20%) on mid-cap and high-beta equities. Consequently, maximum client leverage
              varies slightly across brokers like Zerodha, Groww, Angel One, and ICICI Direct.
            </p>
          </div>

          <div className="docLimitCard">
            <div className="docLimitIcon">
              <Clock size={18} className="text-cyan" />
            </div>
            <h4 className="docLimitTitle">Circuit Limits & Trading Halts</h4>
            <p className="docLimitText">
              When a heavily leveraged security hits lower circuit limits (e.g., 5%, 10%, or 20%), buyers evaporate from the order book. Brokers cannot execute
              forced margin liquidation orders. In such events, MTF position data will reflect high outstanding debt even as collateral value deteriorates,
              creating an acute liquidation overhang when trading resumes.
            </p>
          </div>

          <div className="docLimitCard">
            <div className="docLimitIcon">
              <ShieldCheck size={18} className="text-emerald" />
            </div>
            <h4 className="docLimitTitle">Settlement Lag Reconciliation</h4>
            <p className="docLimitText">
              Exchange margin disclosures operate on an official regulatory clearing lag (T+1 EOD). Intra-day borrowings initiated today will be reported
              in tomorrow evening's clearing batch. This makes MTF data an institutional positional and swing trading indicator rather than a high-frequency tick-level signal.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Summary Footer Row */}
      <div className="docQuickActionRow">
        <div className="docQuickCard" onClick={() => onNavigate && onNavigate("screener")}>
          <div className="docQuickIcon">
            <Layers size={18} className="text-cyan" />
          </div>
          <div>
            <b>Apply Methodology to Live Equities</b>
            <span>Screen 950+ stocks by Free Float Leverage Ratio, Market Cap, and Net Shift</span>
          </div>
          <ChevronRight size={18} className="docQuickArrow" />
        </div>

        <div className="docQuickCard" onClick={() => onNavigate && onNavigate("about")}>
          <div className="docQuickIcon">
            <FileText size={18} className="text-emerald" />
          </div>
          <div>
            <b>Read About MTF Analytics Platform</b>
            <span>Mission statement, comparative problem vs solution, and regulatory disclosures</span>
          </div>
          <ChevronRight size={18} className="docQuickArrow" />
        </div>
      </div>
    </div>
  );
}

