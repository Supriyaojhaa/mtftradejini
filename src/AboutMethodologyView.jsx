import React, { useState, useEffect } from "react";
import {
  FileText,
  Layers,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Bookmark,
  Share2,
  Check
} from "lucide-react";
import AboutContent from "./AboutContent.jsx";
import MethodologyContent from "./MethodologyContent.jsx";

const ABOUT_TOC = [
  { id: "mission", title: "Mission & Platform Overview" },
  { id: "problem-solution", title: "The Problem vs Solution" },
  { id: "audience", title: "Built for Serious Traders" },
  { id: "governance", title: "Data Transparency & SLA" },
  { id: "disclaimer", title: "Statutory Regulatory Notice" }
];

const METHODOLOGY_TOC = [
  { id: "methodology-overview", title: "Methodology Overview" },
  { id: "pipelines", title: "Data Sourcing & Refresh Pipelines" },
  { id: "formulas", title: "Core Quantitative Formulas" },
  { id: "crowding", title: "Crowding Index & Risk Tiers" },
  { id: "carry-model", title: "Carry Cost & Break-Even Model" },
  { id: "limitations", title: "Surveillance & Edge Cases" }
];

export default function AboutMethodologyView({ initialTab = "about", onNavigate }) {
  const [subTab, setSubTab] = useState(initialTab === "methodology" ? "methodology" : "about");
  const [activeTocId, setActiveTocId] = useState("");
  const [copied, setCopied] = useState(false);

  // Sync state if initialTab changes from parent
  useEffect(() => {
    if (initialTab === "about" || initialTab === "methodology") {
      setSubTab(initialTab);
    }
  }, [initialTab]);

  const tocItems = subTab === "about" ? ABOUT_TOC : METHODOLOGY_TOC;

  // Handle smooth scroll to section
  const handleScrollTo = (id) => {
    setActiveTocId(id);
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="docContainer">
      {/* Top Header & Breadcrumb Bar */}
      <div className="docHeaderBar">
        <div className="docHeaderLeft">
          <div className="docBreadcrumbs">
            <span className="docCrumbLink" onClick={() => onNavigate && onNavigate("overview")}>
              Platform
            </span>
            <ChevronRight size={13} className="docCrumbDivider" />
            <span className="docCrumbCurrent">
              {subTab === "about" ? "About MTF Analytics" : "Quantitative Methodology"}
            </span>
          </div>

          <h1 className="docMainHeading">
            {subTab === "about" ? "About MTF Analytics" : "Quantitative Methodology"}
          </h1>
          <p className="docMainSubheading">
            {subTab === "about"
              ? "Democratizing margin leverage intelligence for Indian equity swing traders, quantitative funds, and risk managers."
              : "Complete mathematical formulas, regulatory clearing timelines, entity resolution algorithms, and surveillance edge cases."}
          </p>
        </div>

        <div className="docHeaderRight">
          <button className="docShareBtn" onClick={handleCopyLink} title="Copy link to page">
            {copied ? <Check size={14} className="text-emerald" /> : <Share2 size={14} />}
            <span>{copied ? "Link Copied!" : "Share"}</span>
          </button>
          <button className="docBackBtn" onClick={() => onNavigate && onNavigate("overview")}>
            <ArrowLeft size={14} />
            <span>Dashboard</span>
          </button>
        </div>
      </div>

      {/* Primary Sub-Navigation Switcher */}
      <div className="docSubNavRow">
        <button
          className={`docSubNavBtn ${subTab === "about" ? "active" : ""}`}
          onClick={() => {
            setSubTab("about");
            if (onNavigate) onNavigate("about");
          }}
        >
          <Sparkles size={15} />
          <span>About Platform & Mission</span>
        </button>

        <button
          className={`docSubNavBtn ${subTab === "methodology" ? "active" : ""}`}
          onClick={() => {
            setSubTab("methodology");
            if (onNavigate) onNavigate("methodology");
          }}
        >
          <Layers size={15} />
          <span>Quantitative Methodology</span>
        </button>
      </div>

      {/* Main Content Layout: Stream + Sticky TOC */}
      <div className="docLayoutGrid">
        {/* Left / Center: Comprehensive Documentation Stream */}
        <div className="docStreamCol">
          {subTab === "about" ? (
            <AboutContent onNavigate={onNavigate} />
          ) : (
            <MethodologyContent onNavigate={onNavigate} />
          )}
        </div>

        {/* Right: Sticky Table of Contents */}
        <aside className="docTocCol">
          <div className="docTocCard">
            <div className="docTocHeader">
              <Bookmark size={14} className="text-cyan" />
              <span>ON THIS PAGE</span>
            </div>

            <nav className="docTocNav">
              {tocItems.map((item) => (
                <button
                  key={item.id}
                  className={`docTocLink ${activeTocId === item.id ? "active" : ""}`}
                  onClick={() => handleScrollTo(item.id)}
                >
                  <span className="docTocDot" />
                  <span className="docTocText">{item.title}</span>
                </button>
              ))}
            </nav>

            <div className="docTocDivider" />

            <div className="docTocFooter">
              <div className="docTocBadge">
                <ShieldCheck size={13} className="text-emerald" />
                <span>SEBI Circular Compliance</span>
              </div>
              <small>Disclosures verified against NSE & BSE clearing files.</small>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

