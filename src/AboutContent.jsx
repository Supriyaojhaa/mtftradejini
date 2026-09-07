import React from "react";
import {
  ShieldAlert,
  Target,
  Layers,
  Database,
  Users,
  CheckCircle2,
  XCircle,
  TrendingUp,
  AlertTriangle,
  Scale,
  Sparkles,
  Award,
  ExternalLink,
  ChevronRight,
  Calculator,
  Search
} from "lucide-react";

export default function AboutContent({ onNavigate }) {
  return (
    <div className="docContentBlock">
      {/* 1. Hero & Mission Section */}
      <section id="mission" className="docSection">
        <div className="docHeroCard">
          <div className="docHeroBadge">
            <Sparkles size={13} className="text-cyan" />
            <span>INSTITUTIONAL MARGIN INTELLIGENCE</span>
          </div>
          <h1 className="docHeroTitle">
            Democratizing Institutional-Grade Margin Leverage Analytics for Indian Equities
          </h1>
          <p className="docHeroSubtitle">
            Over ₹1.5 Lakh Crore of active Margin Trading Facility (MTF) exposure sits across National Stock Exchange (NSE)
            and Bombay Stock Exchange (BSE) order books. Traditional technical and fundamental tools ignore this borrowed capital,
            leaving traders blind to leverage saturation and sudden forced liquidation cascades. MTF Analytics decodes systemic
            borrowing concentration so you can trade with institutional clarity.
          </p>

          <div className="docHeroMetricsGrid">
            <div className="docHeroMetricItem">
              <span className="docHeroMetricVal">₹1.55+ Lakh Cr</span>
              <span className="docHeroMetricLbl">Tracked Leverage Book</span>
            </div>
            <div className="docHeroMetricItem">
              <span className="docHeroMetricVal">950+</span>
              <span className="docHeroMetricLbl">Monitored Equities</span>
            </div>
            <div className="docHeroMetricItem">
              <span className="docHeroMetricVal">100%</span>
              <span className="docHeroMetricLbl">Statutory Exchange Feeds</span>
            </div>
            <div className="docHeroMetricItem">
              <span className="docHeroMetricVal">T+1 EOD</span>
              <span className="docHeroMetricLbl">Normalized Settlement</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. The Problem vs The Solution */}
      <section id="problem-solution" className="docSection">
        <div className="docSectionHeader">
          <div className="docSectionTag">COMPARATIVE ARCHITECTURE</div>
          <h2 className="docSectionTitle">Why MTF Analytics Matters: The Problem vs The Solution</h2>
          <p className="docSectionDesc">
            How our automated normalization pipeline transforms opaque, raw regulatory disclosures into actionable, quantitative market alpha.
          </p>
        </div>

        <div className="docCompareGrid">
          {/* Problem Card */}
          <div className="docCompareCard problemCard">
            <div className="docCompareHeader">
              <div className="docCompareIcon danger">
                <XCircle size={20} />
              </div>
              <div>
                <h3 className="docCompareTitle">The Problem</h3>
                <span className="docCompareSubtitle">Fragmented & Opaque Disclosures</span>
              </div>
            </div>
            <ul className="docCompareList">
              <li>
                <b>Unstandardized Exchange Files:</b> NSE and BSE release end-of-day statutory MTF disclosures as disparate, unindexed CSV and text files with varying column schemas and late-evening batch schedules.
              </li>
              <li>
                <b>Zero Free-Float Normalization:</b> Raw loan values in Rupees give no context on true market liquidity. A ₹500 Cr leverage book in a mega-cap stock is benign, while ₹200 Cr in a low-float mid-cap creates acute squeeze danger.
              </li>
              <li>
                <b>Blind Breakout Buying:</b> Retail traders enter technical chart breakouts without knowing that 8% to 15% of the floating shares are already held on borrowed money, setting up violent stop-loss runs.
              </li>
              <li>
                <b>Hidden Carry Costs:</b> Position traders chronically underestimate financing rates (9.6% to 18% p.a.), 18% GST on interest, statutory turnover levies, and depository fees that silently erode trading edge.
              </li>
            </ul>
          </div>

          {/* Solution Card */}
          <div className="docCompareCard solutionCard">
            <div className="docCompareHeader">
              <div className="docCompareIcon success">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h3 className="docCompareTitle">The Solution</h3>
                <span className="docCompareSubtitle">Institutional-Grade Intelligence Engine</span>
              </div>
            </div>
            <ul className="docCompareList">
              <li>
                <b>Automated Normalization Engine:</b> Daily ingestion pipelines parse, validate, and deduplicate multi-exchange records across dual-listed ISINs into a clean, unified real-time data repository.
              </li>
              <li>
                <b>Free Float Leverage (Crowding Index):</b> Mathematical ratios calculate precise percentage of liquid float financed through leverage, tagging stocks into clear risk tiers (Healthy, Elevated, Dangerous).
              </li>
              <li>
                <b>Sector-Level Concentration Heatmaps:</b> Hierarchical squarified treemaps and quadrant distribution matrices identify where retail borrowing is accumulating versus where margin unwindings are underway.
              </li>
              <li>
                <b>Granular Carry & Break-Even Modeler:</b> Dynamic simulation of interest accruals, statutory taxes, broker-specific haircuts, and margin call thresholds with exact Rupee and percentage calculations.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3. Target Audience & Core Use Cases */}
      <section id="audience" className="docSection">
        <div className="docSectionHeader">
          <div className="docSectionTag">ECOSYSTEM VALUE</div>
          <h2 className="docSectionTitle">Built for Institutional Thinkers & Serious Traders</h2>
          <p className="docSectionDesc">
            Whether managing personal capital or institutional risk, understanding margin concentration unlocks a sustainable edge.
          </p>
        </div>

        <div className="docAudienceGrid">
          <div className="docAudienceCard">
            <div className="docAudienceIcon">
              <TrendingUp size={22} className="text-cyan" />
            </div>
            <h3 className="docAudienceTitle">Momentum & Breakout Traders</h3>
            <p className="docAudienceText">
              Separate clean institutional volume breakouts from exhausted retail margin traps. Focus capital on names where free float leverage is under 3%, avoiding crowded names vulnerable to flash margin liquidations.
            </p>
            <div className="docAudienceFeatures">
              <span>Screener Crowding Filter</span>
              <span>Daily Net Shift Alerts</span>
            </div>
          </div>

          <div className="docAudienceCard">
            <div className="docAudienceIcon">
              <Scale size={22} className="text-emerald" />
            </div>
            <h3 className="docAudienceTitle">Swing & Positional Traders</h3>
            <p className="docAudienceText">
              Model true holding carry costs before entering leveraged positions. Compute the exact price gain needed to clear financing interest, statutory turnover taxes, 18% GST, and depository pledge/unpledge fees.
            </p>
            <div className="docAudienceFeatures">
              <span>Carry Calculator</span>
              <span>Margin Call Buffer Gauge</span>
            </div>
          </div>

          <div className="docAudienceCard">
            <div className="docAudienceIcon">
              <Layers size={22} className="text-blue" />
            </div>
            <h3 className="docAudienceTitle">Proprietary Desks & Long-Short Funds</h3>
            <p className="docAudienceText">
              Analyze sector-wide retail crowd traps and leverage unwinding risks. Build mean-reversion and short-bias strategies on equities displaying extreme free float crowding (&gt;7%) during market consolidation.
            </p>
            <div className="docAudienceFeatures">
              <span>Sector Heatmaps</span>
              <span>Quadrant Squeeze Matrix</span>
            </div>
          </div>

          <div className="docAudienceCard">
            <div className="docAudienceIcon">
              <ShieldAlert size={22} className="text-amber" />
            </div>
            <h3 className="docAudienceTitle">Risk Managers & Compliance Officers</h3>
            <p className="docAudienceText">
              Monitor systemic leverage exposure across capital market segments, surveillance buckets (ASM/GSM), and broker concentration tiers to ensure capital preservation during volatile drawdowns.
            </p>
            <div className="docAudienceFeatures">
              <span>Surveillance Tracking</span>
              <span>Collateral Haircut Metrics</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Data Transparency & Governance */}
      <section id="governance" className="docSection">
        <div className="docSectionHeader">
          <div className="docSectionTag">DATA INTEGRITY</div>
          <h2 className="docSectionTitle">Statutory Data Transparency & Quality SLA</h2>
          <p className="docSectionDesc">
            How we ensure every data point on MTF Analytics remains authentic, verifiable, and free of synthetic estimation.
          </p>
        </div>

        <div className="docGovernanceCard">
          <div className="docGovRow">
            <div className="docGovItem">
              <div className="docGovBullet">
                <Database size={16} className="text-cyan" />
              </div>
              <div>
                <h4>Direct Statutory Reporting</h4>
                <p>
                  100% of margin trading quantities and values originate directly from statutory disclosures published by the National Stock Exchange of India (NSE) and BSE Limited in accordance with SEBI circular CIR/MRD/DP/54/2017.
                </p>
              </div>
            </div>

            <div className="docGovItem">
              <div className="docGovBullet">
                <CheckCircle2 size={16} className="text-emerald" />
              </div>
              <div>
                <h4>Zero Algorithmic Hallucinations</h4>
                <p>
                  We do not estimate, extrapolate, or synthesize leverage books. In instances where an exchange disclosure is delayed or an ISIN is under surveillance review, the platform explicitly flags the timestamp and reporting lag.
                </p>
              </div>
            </div>

            <div className="docGovItem">
              <div className="docGovBullet">
                <Scale size={16} className="text-blue" />
              </div>
              <div>
                <h4>Dual-Exchange Cross Correlation</h4>
                <p>
                  For companies dual-listed on NSE and BSE, our pipeline links books via primary ISIN identifiers to present both consolidated institutional totals and granular exchange-specific trading books without double-counting.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Legal Disclaimer & Regulatory Notice */}
      <section id="disclaimer" className="docSection">
        <div className="docDisclaimerCard">
          <div className="docDisclaimerIconWrap">
            <AlertTriangle size={24} className="text-amber" />
          </div>
          <div className="docDisclaimerBody">
            <h3 className="docDisclaimerHeading">Statutory Disclaimer & Capital Market Regulatory Notice</h3>
            <p className="docDisclaimerText">
              <b>MTF Analytics</b> is a quantitative research, financial technology, and data visualization platform developed for educational, informational, and quantitative analysis purposes only.
            </p>
            <p className="docDisclaimerText">
              <b>Not Investment Advice:</b> The platform is not registered as an Investment Adviser, Research Analyst, or Portfolio Manager under the Securities and Exchange Board of India (SEBI) regulations. No metric, ratio, score, screener output, sector classification, carry simulation, or content on this website constitutes financial, investment, legal, taxation, or trading advice, nor should it be construed as an offer or solicitation to buy, sell, or hold any security.
            </p>
            <p className="docDisclaimerText">
              <b>Inherent Risk in Leveraged Trading:</b> Margin Trading Facility (MTF) entails substantial leverage risks, including the total loss of invested capital and exposure to mandatory broker liquidation if margin calls are not satisfied in cash or eligible collateral within regulatory timelines. Past performance, accumulation patterns, and historical leverage flows are not indicative of future market outcomes. Users are strongly advised to conduct independent due diligence and consult a licensed, SEBI-registered financial advisor before executing leveraged trades.
            </p>
            <div className="docDisclaimerMeta">
              <span>Jurisdiction: Mumbai, Maharashtra, India</span>
              <span>Regulatory Standard: SEBI Master Circular on Margin Trading</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Quick Action Navigation Row */}
      <div className="docQuickActionRow">
        <div className="docQuickCard" onClick={() => onNavigate && onNavigate("methodology")}>
          <div className="docQuickIcon">
            <Layers size={18} className="text-cyan" />
          </div>
          <div>
            <b>Explore Quantitative Methodology</b>
            <span>Read data sourcing pipelines, mathematical formulas, and metric definitions</span>
          </div>
          <ChevronRight size={18} className="docQuickArrow" />
        </div>

        <div className="docQuickCard" onClick={() => onNavigate && onNavigate("calc")}>
          <div className="docQuickIcon">
            <Calculator size={18} className="text-emerald" />
          </div>
          <div>
            <b>Launch MTF Carry Calculator</b>
            <span>Simulate daily interest, statutory taxes, and margin call liquidation buffers</span>
          </div>
          <ChevronRight size={18} className="docQuickArrow" />
        </div>
      </div>
    </div>
  );
}

