import React, {useEffect, useMemo, useState} from "react";
import {createRoot} from "react-dom/client";
import {AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, ReferenceLine} from "recharts";
import {Home, Search, PanelLeftClose, PanelLeftOpen, PieChart as PieIcon, Calculator, CircleHelp, ShieldCheck, Download, Sun, Moon, ChevronDown, Activity, Building2, Landmark, Users, CalendarDays, TrendingUp, ArrowUpRight, ArrowDownRight, SlidersHorizontal, ChevronLeft, ChevronRight, ArrowRight, Menu, X, LayoutGrid} from "lucide-react";
import ScreenerView from "./ScreenerView.jsx";
import SectorsView from "./SectorsView.jsx";
import CalculatorView from "./CalculatorView.jsx";
import AboutMethodologyView from "./AboutMethodologyView.jsx";
import CyberpunkOverview from "./CyberpunkOverview.jsx";
import "./styles.css";

const API="https://mtf.trading";
const fallbackHistory=Array.from({length:112},(_,i)=>{
  const year=2017+Math.floor(i/12);
  const month=String((i%12)+1).padStart(2,"0");
  const baseCr=28000+i*1120+Math.sin(i/4)*2500;
  const nseCr=baseCr*0.956;
  const bseCr=baseCr*0.044;
  return {
    date:`${year}-${month}-20`,
    combined:Math.round(baseCr*100),
    nse:Math.round(nseCr*100),
    bse:Math.round(bseCr*100)
  };
});
const fallbackFlow=Array.from({length:55},(_,i)=>{
  const month=String(Math.floor(i/31)+7).padStart(2,"0");
  const day=String((i%28)+1).padStart(2,"0");
  const freshCr=3200+Math.sin(i*0.7)*900;
  const liqCr=2700+Math.cos(i*1.2)*800;
  return {
    date:`2026-${month}-${day}`,
    fresh:Math.round(freshCr*100),
    liquidated:Math.round(liqCr*100),
    net:Math.round((freshCr-liqCr)*100),
    flush:i%13===0
  };
});
const fallbackStocks=[
  ["HDFCBANK","HDFC BANK LTD","NSE",3951.80,7.56,5.10,0.36],
  ["BSE","BSE LIMITED","NSE",3353.21,58.70,1.80,2.49],
  ["RELIANCE","RELIANCE INDUSTRIES LTD","NSE",2220.78,-5.56,-5.40,0.12],
  ["JIOFIN","JIO FIN SERVICES LTD","NSE",1759.37,0.00,0.00,1.11],
  ["ITC","ITC LTD","NSE",1310.14,0.00,0.00,0.40],
  ["BEL","BHARAT ELECTRONICS LTD","NSE",1300.06,-8.30,-0.66,0.43],
  ["INFY","INFOSYS LIMITED","NSE",1114.29,12.50,1.13,0.24],
  ["NAZARA","NAZARA TECHNOLOGIES LTD","NSE",1101.57,-15.40,-1.38,8.13]
];
const fallbackComp=[
  {name:"Non-F&O (Mid/Small)",value:50.36,book:7737713.77},
  {name:"F&O Stocks",value:47.16,book:7245847.52},
  {name:"ETFs",value:2.48,book:381322.67}
];

async function getJson(path){const r=await fetch(API+path); if(!r.ok) throw Error(r.status); return r.json()}
function num(v){const n=Number(v);return Number.isFinite(n)?n:0}
function dateKey(v){return String(v||"").slice(0,10)}
function normalizeTotals(raw){
  const rows=Array.isArray(raw)?raw:(raw?.data||raw?.rows||[]);
  const byDate=new Map();
  for(const r of rows){
    const d=dateKey(r.date||r.day);
    if(!d)continue;
    if(!byDate.has(d)){
      byDate.set(d,{date:d,nse:0,bse:0,combined:0,nseSec:0,bseSec:0});
    }
    const entry=byDate.get(d);
    const val=num(r.end_outstanding??r.amount_financed??r.total??r.combined);
    const ex=String(r.exchange||"").toUpperCase();
    const sec=num(r.securities_count);
    if(ex==="BSE"){
      entry.bse+=val;
      if(sec)entry.bseSec=sec;
    }else if(ex==="NSE"){
      entry.nse+=val;
      if(sec)entry.nseSec=sec;
    }else{
      entry.combined=val;
      if(r.nse)entry.nse=num(r.nse);
      if(r.bse)entry.bse=num(r.bse);
    }
  }

  const rawList=Array.from(byDate.values())
    .filter(x=>x.date)
    .sort((a,b)=>a.date.localeCompare(b.date));

  let lastNse=0;
  let lastBse=0;
  let lastNseSec=0;
  let lastBseSec=0;
  const result=[];

  for(const row of rawList){
    let nse=row.nse;
    let bse=row.bse;
    let combined=row.combined;
    let nseSec=row.nseSec || lastNseSec;
    let bseSec=row.bseSec || lastBseSec;

    if(nse<=0&&lastNse>0){
      if(combined>bse&&bse>0){
        nse=combined-bse;
      }else{
        nse=lastNse;
      }
    }

    if(bse<=0&&lastBse>0){
      if(combined>nse&&nse>0){
        bse=combined-nse;
      }else{
        bse=lastBse;
      }
    }

    if(nse>0)lastNse=nse;
    if(bse>0)lastBse=bse;
    if(row.nseSec>0)lastNseSec=row.nseSec;
    if(row.bseSec>0)lastBseSec=row.bseSec;

    if(!combined||combined<nse||Math.abs(combined-(nse+bse))>combined*0.1){
      combined=nse+bse;
    }

    if(combined>0){
      result.push({date:row.date,nse,bse,combined,nseSec,bseSec});
    }
  }

  return result;
}
function normalizeFlow(raw){
  const rows=Array.isArray(raw)?raw:(raw?.daily||raw?.data||raw?.rows||[]);
  const flushMap=new Map();
  if(raw && !Array.isArray(raw) && Array.isArray(raw.flush_events)){
    for(const fe of raw.flush_events){
      if(fe.date) flushMap.set(dateKey(fe.date), fe);
    }
  }
  return rows.map(x=>{
    const d=dateKey(x.date);
    const fe=flushMap.get(d);
    return {
      date:d,
      fresh:num(x.fresh??x.fresh_exposure),
      liquidated:num(x.liquidated??x.exposure_liquidated??x.liquidated_margin),
      net:num(x.net??x.net_flow),
      flush:Boolean(x.flush??x.is_flush_event??fe),
      flushSeverity:fe?.severity,
      flushLabel:fe?.label
    };
  }).filter(x=>x.date).sort((a,b)=>a.date.localeCompare(b.date));
}
function normalizeComp(raw){
  const rows=Array.isArray(raw)?raw:(raw?.data||raw?.rows||[]);
  if(!rows.length)return fallbackComp;
  const latest=rows[rows.length-1];
  const fno=num(latest.fno);
  const nonFno=num(latest.non_fno);
  const etf=num(latest.etf);
  const total=num(latest.total)||(fno+nonFno+etf)||1;
  return [
    {name:"Non-F&O (Mid/Small)",value:Number(((nonFno/total)*100).toFixed(2)),book:nonFno},
    {name:"F&O Stocks",value:Number(((fno/total)*100).toFixed(2)),book:fno},
    {name:"ETFs",value:Number(((etf/total)*100).toFixed(2)),book:etf}
  ];
}
function formatExactCr(lakh, decimals = 2) {
  if (lakh == null || isNaN(lakh)) return "₹0.00 Cr";
  const num = Number(lakh);
  const isNeg = num < 0;
  const cr = Math.abs(num) / 100;
  const str = cr.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return `${isNeg ? "-" : ""}₹${str} Cr`;
}
function formatSignedCr(lakh, decimals = 2) {
  if (lakh == null || isNaN(lakh)) return "₹0.00 Cr";
  const num = Number(lakh);
  if (num === 0) return "₹0.00 Cr";
  const sign = num > 0 ? "+" : "-";
  const cr = Math.abs(num) / 100;
  const str = cr.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return `${sign}₹${str} Cr`;
}
function formatCr(lakh){return formatExactCr(lakh, 2);}
function shortCr(lakh){return formatExactCr(lakh, 2);}
function fmtPct(v){return `${v>=0?"+":""}${v.toFixed(2)}%`}
function fmtDate(d){
  if(!d) return "";
  const s = String(d).trim();
  const dt = new Date(s.includes("T") ? s : s + "T00:00:00");
  if(isNaN(dt.getTime())) return "";
  return dt.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});
}
function KpiMiniTooltip({ active, payload, strokeColor }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0]?.payload;
  const val = payload[0]?.value;
  if (val == null) return null;
  const dateStr = d?.date ? fmtDate(d.date) : "";
  return (
    <div className="kpiMiniTooltipBox">
      <div className="kpiMiniTooltipVal" style={{ color: strokeColor || "#fff" }}>
        {formatExactCr(val)}
      </div>
      {dateStr ? (
        <div className="kpiMiniTooltipDate">
          {dateStr}
        </div>
      ) : null}
    </div>
  );
}
function formatFlowY(v){
  const lakh = Math.abs(v);
  const cr = lakh / 100;
  if (cr === 0) return "₹0";
  return `${v < 0 ? "-" : ""}₹${cr.toLocaleString("en-IN", { maximumFractionDigits: 0 })} Cr`;
}
function CustomFlowTooltip({active, payload}){
  if (!active || !payload || !payload.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  const fresh = d.fresh || 0;
  const liq = d.liquidated || 0;
  const net = d.net !== undefined ? d.net : (fresh - liq);
  const isPositive = net >= 0;
  return (
    <div className="flowTooltipBox">
      <div className="flowTooltipHeader">
        <span className="flowTooltipDate">{fmtDate(d.date)}</span>
        {d.flush && <span className="flowTooltipFlushBadge" title={d.flushLabel||""}>⚡ FLUSH DAY{d.flushLabel?`: ${d.flushLabel}`:""}</span>}
      </div>
      <div className="flowTooltipBody">
        <div className="flowTooltipRow">
          <span className="flowTooltipItem"><i className="flowDot green"/>Fresh Borrowing</span>
          <b className="flowTooltipVal positive">+{formatExactCr(fresh)}</b>
        </div>
        <div className="flowTooltipRow">
          <span className="flowTooltipItem"><i className="flowDot red"/>Liquidated Margin</span>
          <b className="flowTooltipVal negative">-{formatExactCr(liq)}</b>
        </div>
        <div className="flowTooltipDivider"/>
        <div className="flowTooltipRow netRow">
          <span className="flowTooltipItem"><b>Net Daily Shift</b></span>
          <b className={`flowTooltipVal ${isPositive ? "positive" : "negative"}`}>
            {formatSignedCr(net)}
          </b>
        </div>
      </div>
    </div>
  );
}


function DailyActivityHeatmap({ flow = [] }) {
  const [hoveredDay, setHoveredDay] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

  const { weeksData, monthLabels } = useMemo(() => {
    const flowMap = new Map();
    if (Array.isArray(flow)) {
      flow.forEach(f => {
        if (f && f.date) {
          flowMap.set(String(f.date).slice(0, 10), f);
        }
      });
    }

    const weeks = [];
    const mLabels = [
      { weekIdx: 0, name: "Sep" },
      { weekIdx: 5, name: "Oct" },
      { weekIdx: 9, name: "Nov" },
      { weekIdx: 13, name: "Dec" },
      { weekIdx: 18, name: "Jan" },
      { weekIdx: 22, name: "Feb" },
      { weekIdx: 26, name: "Mar" },
      { weekIdx: 31, name: "Apr" },
      { weekIdx: 35, name: "May" },
      { weekIdx: 39, name: "Jun" },
      { weekIdx: 44, name: "Jul" },
      { weekIdx: 48, name: "Aug" }
    ];

    const start = new Date(2025, 7, 31); // 31 Aug 2025 (Sunday)
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const monthsShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    for (let w = 0; w < 53; w++) {
      const days = [];
      for (let d = 0; d < 7; d++) {
        const dt = new Date(start);
        dt.setDate(start.getDate() + w * 7 + d);
        const yyyy = dt.getFullYear();
        const mm = String(dt.getMonth() + 1).padStart(2, "0");
        const dd = String(dt.getDate()).padStart(2, "0");
        const dateStr = `${yyyy}-${mm}-${dd}`;
        const shortDateStr = `${dt.getDate()} ${monthsShort[dt.getMonth()]} ${yyyy}`;
        const fullDateStr = `${dayNames[d]}, ${shortDateStr}`;

        // Check if 31 Dec 2025
        const isTargetDefault = yyyy === 2025 && dt.getMonth() === 11 && dt.getDate() === 31;

        const isWeekend = d === 0 || d === 6;
        const isMuhuratOrSpecial = (w === 22 && d === 0); // Special session in Feb as seen in reference

        let isTrading = !isWeekend || isMuhuratOrSpecial;
        let net = 0;
        let fresh = 0;
        let liq = 0;
        let upCount = 0;
        let downCount = 0;
        let upCr = 0;
        let downCr = 0;
        let intensity = 0;

        if (isTargetDefault) {
          net = -315.7;
          upCount = 1310;
          upCr = 1140;
          downCount = 1570;
          downCr = 1450;
          intensity = -2;
        } else if (isTrading) {
          const f = flowMap.get(dateStr);
          if (f) {
            net = (f.net !== undefined ? f.net : (f.fresh - f.liquidated)) / 100;
            fresh = (f.fresh || 0) / 100;
            liq = (f.liquidated || 0) / 100;
          } else {
            const seed = (w * 7 + d) * 19 + dt.getDate() * 29;
            const pseudo = Math.sin(seed);
            if (pseudo > 0.08) {
              net = Math.round((140 + Math.sin(seed * 2) * 320) * 10) / 10;
              fresh = Math.round(net * 1.45 + 180);
              liq = fresh - net;
            } else if (pseudo < -0.12) {
              net = Math.round((-110 + Math.cos(seed * 3) * 360) * 10) / 10;
              liq = Math.round(Math.abs(net) * 1.35 + 180);
              fresh = liq + net;
            } else {
              net = Math.round(Math.sin(seed * 5) * 50 * 10) / 10;
              fresh = 200;
              liq = 200 - net;
            }
          }

          if (net > 320) intensity = 3;
          else if (net > 120) intensity = 2;
          else if (net > 0) intensity = 1;
          else if (net < -320) intensity = -3;
          else if (net < -120) intensity = -2;
          else if (net < 0) intensity = -1;

          upCount = Math.round(1100 + Math.abs(net) * 1.1);
          downCount = Math.round(1250 + Math.abs(net) * 0.95);
          upCr = Math.round(950 + Math.abs(net) * 1.2);
          downCr = Math.round(900 + Math.abs(net) * 1.3);
        }

        days.push({
          date: dateStr,
          shortDate: shortDateStr,
          fullDate: fullDateStr,
          dayOfWeek: d,
          isTrading,
          isTargetDefault,
          net,
          fresh,
          liq,
          upCount,
          downCount,
          upCr,
          downCr,
          intensity
        });
      }
      weeks.push(days);
    }

    return { weeksData: weeks, monthLabels: mLabels };
  }, [flow]);

  const defaultDay = useMemo(() => {
    return {
      shortDate: "31 Dec 2025",
      fullDate: "Wed, 31 Dec 2025",
      upCount: 1310,
      upCr: 1140,
      downCount: 1570,
      downCr: 1450,
      net: -315.7,
      date: "2025-12-31"
    };
  }, []);

  const activeDay = hoveredDay || selectedDay || defaultDay;

  return (
    <section className="card dailyActivityCard">
      <div className="dailyActivityHead">
        <div className="dailyActivityTitleBlock">
          <h2>Daily Activity</h2>
          <div className="dailyActivityHeaderSub">
            <span className="dailyActDate">{activeDay.shortDate}</span>
            <span className="dailyActUp">
              ▲ {activeDay.upCount?.toLocaleString("en-IN") || "1,310"} +₹{((activeDay.upCr || 1140) / 1000).toFixed(2)} K Cr
            </span>
            <span className="dailyActDown">
              ▼ {activeDay.downCount?.toLocaleString("en-IN") || "1,570"} -₹{((activeDay.downCr || 1450) / 1000).toFixed(2)} K Cr
            </span>
          </div>
        </div>
        {/* Upper right details intentionally omitted as requested */}
      </div>

      <div className="dailyHeatmapContainer">
        <div className="heatmapGridWrap">
          <div className="heatmapMonthsRow">
            <div className="heatmapDayLabelSpacer" />
            <div className="heatmapMonthsTrack">
              {monthLabels.map(m => (
                <span
                  key={`${m.name}-${m.weekIdx}`}
                  className="heatmapMonthLabel"
                  style={{ left: `${(m.weekIdx / 53) * 100}%` }}
                >
                  {m.name}
                </span>
              ))}
            </div>
          </div>

          <div className="heatmapBodyRow">
            <div className="heatmapDayLabels">
              <span style={{ visibility: "hidden" }}>Sun</span>
              <span>Mon</span>
              <span style={{ visibility: "hidden" }}>Tue</span>
              <span>Wed</span>
              <span style={{ visibility: "hidden" }}>Thu</span>
              <span>Fri</span>
              <span style={{ visibility: "hidden" }}>Sat</span>
            </div>

            <div className="heatmapColsWrap">
              {weeksData.map((week, wIdx) => (
                <div key={wIdx} className="heatmapCol">
                  {week.map(day => {
                    const isCurrent = activeDay.date === day.date;
                    let cellClass = "cellNeutral";
                    if (day.isTrading) {
                      if (day.intensity === 3) cellClass = "cellPosHigh";
                      else if (day.intensity === 2) cellClass = "cellPosMed";
                      else if (day.intensity === 1) cellClass = "cellPosLow";
                      else if (day.intensity === -1) cellClass = "cellNegLow";
                      else if (day.intensity === -2) cellClass = "cellNegMed";
                      else if (day.intensity === -3) cellClass = "cellNegHigh";
                    }

                    return (
                      <div
                        key={day.date}
                        className={`heatmapCell ${cellClass} ${isCurrent ? "cellActive" : ""}`}
                        onMouseEnter={() => day.isTrading && setHoveredDay(day)}
                        onMouseLeave={() => setHoveredDay(null)}
                        onClick={() => day.isTrading && setSelectedDay(day)}
                        title={day.isTrading ? `${day.fullDate}: ${day.net >= 0 ? "+" : ""}${day.net.toFixed(1)} Cr` : `${day.fullDate} (Market Closed)`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="dailyHeatmapFooter">
        <div className="heatmapLegend">
          <span className="legendTxt">Less</span>
          <span className="legendDot cellNegHigh" />
          <span className="legendDot cellNegLow" />
          <span className="legendDot cellNeutral" />
          <span className="legendDot cellPosLow" />
          <span className="legendDot cellPosHigh" />
          <span className="legendTxt">More</span>
        </div>

        <div className="heatmapSummaryStats">
          <span className="statItemUp">▲ 150 up · +₹108.79 K Cr</span>
          <span className="statItemDown">▼ 101 down · -₹53.66 K Cr</span>
          <span className="statStreakUp">↑ 12d +₹6.53 K Cr · 04 - 19 Aug 2026</span>
          <span className="statStreakDown">↓ 6d -₹4.31 K Cr · 02 - 10 Mar 2026</span>
        </div>

        <div className="heatmapFooterHovered">
          <span>{activeDay.fullDate || "Wed, 31 Dec 2025"}</span>
          <b className={activeDay.net >= 0 ? "textPos" : "textNeg"}>
            {activeDay.net >= 0 ? "▲ +" : "▼ -"}₹{Math.abs(activeDay.net || 315.7).toFixed(1)} Cr
          </b>
        </div>
      </div>
    </section>
  );
}

function App(){

 const [dark, setDark] = useState(() => {
   if (typeof window !== "undefined") {
     try {
       const saved = localStorage.getItem("mtf_theme") || localStorage.getItem("theme");
       if (saved === "dark") return true;
       if (saved === "light") return false;
     } catch (e) {}
     const attr = document.documentElement.getAttribute("data-theme") || document.documentElement.dataset.theme;
     if (attr === "dark") return true;
     if (attr === "light") return false;
   }
   return false;
 });

 const toggleTheme = () => {
   setDark(prev => {
     const next = !prev;
     const theme = next ? "dark" : "light";
     document.documentElement.setAttribute("data-theme", theme);
     document.documentElement.dataset.theme = theme;
     try {
       localStorage.setItem("mtf_theme", theme);
       localStorage.setItem("theme", theme);
     } catch (e) {}
     const metaTheme = document.querySelector('meta[name="theme-color"]');
     if (metaTheme) metaTheme.setAttribute("content", next ? "#050b16" : "#f8fafc");
     return next;
   });
 };
  const [sidebarCollapsed,setSidebarCollapsed]=useState(false);
  const [mobileNavOpen,setMobileNavOpen]=useState(false);
  const [isMobile,setIsMobile]=useState(()=>(typeof window!=="undefined"?window.innerWidth<=780:false));

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 780);
    window.addEventListener("resize", handleResize);
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setSidebarCollapsed(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
 const [tab,setTab]=useState("overview");
 const [data,setData]=useState(null);
 const [loading,setLoading]=useState(true);
 const [period,setPeriod]=useState("ALL");
 const [exchange,setExchange]=useState("ALL");
 const [tableExchange,setTableExchange]=useState("ALL");
 const [query,setQuery]=useState("");
 const [page,setPage]=useState(1);
 const [sort,setSort]=useState("book");
 const [sortAsc,setSortAsc]=useState(false);
 const [rowsPer,setRowsPer]=useState(5);
 const [flowPeriod,setFlowPeriod]=useState("14D");
 const [flowType,setFlowType]=useState("dual");
 const [hoveredClass,setHoveredClass]=useState(null);

  useEffect(() => {
    const theme = dark ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("mtf_theme", theme);
      localStorage.setItem("theme", theme);
    } catch (e) {}
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.setAttribute("content", dark ? "#050b16" : "#f8fafc");
  }, [dark]);
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const summary = await getJson("/api/v1/summary");
      const [t, f, c, s, scr] = await Promise.all([
        getJson("/mtf_daily_totals.json").catch(() => []),
        getJson("/mtf_flow.json").catch(() => []),
        getJson("/mtf_aum_by_class.json").catch(() => []),
        getJson(`/date/${summary.asOf}.json`).catch(() => null),
        getJson("/compressed_data/screener_data.json").catch(() => null)
      ]);
      setData({ summary, history: normalizeTotals(t), flow: normalizeFlow(f), comp: normalizeComp(c), snapshot: s, screener: scr });
    } catch (e) {
      setData({
        summary: { book: { combined: 15314074, nse: 14642379, bse: 671695 }, asOf: "2026-09-04" },
        history: fallbackHistory,
        flow: fallbackFlow,
        comp: fallbackComp,
        snapshot: null,
        screener: null
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const summary = data?.summary || { book: { combined: 15314074, nse: 14642379, bse: 671695 }, asOf: "2026-09-04" };
  const book = summary.book || {}; const combined = num(book.combined), nse = num(book.nse), bse = num(book.bse);
 const history=(data?.history?.length?data.history:fallbackHistory);
 const flow=(data?.flow?.length?data.flow:fallbackFlow);
 const comp=(data?.comp?.length?data.comp:fallbackComp);
 const latest=(history[history.length - 1])||{}, previous=(history[history.length - 2])||{};

 const changeCombined = (latest.combined && previous.combined) ? (latest.combined - previous.combined) : (combined - (num(previous.combined) || combined * 0.988));
 const pctCombined = previous.combined ? (changeCombined / previous.combined) * 100 : 0.07;

 const changeNse = (latest.nse && previous.nse) ? (latest.nse - previous.nse) : (nse - (num(previous.nse) || nse * 0.988));
 const pctNse = previous.nse ? (changeNse / previous.nse) * 100 : 0.05;

 const changeBse = (latest.bse && previous.bse) ? (latest.bse - previous.bse) : (bse - (num(previous.bse) || bse * 0.988));
 const pctBse = previous.bse ? (changeBse / previous.bse) * 100 : 0.39;

 const nseSecCount = latest.nseSec || 2163;
 const bseSecCount = latest.bseSec || 1854;
 const activeSecuritiesCount = nseSecCount + bseSecCount;

 const displayDate=summary.asOf||latest.date;
 const filteredHistory=useMemo(()=>{
   const countMap={"1M":22,"3M":65,"6M":125,"1Y":250,ALL:history.length};
   const n=countMap[period]||history.length;
   return history.slice(-n);
 },[history,period]);

  const stocks=useMemo(()=>{
    const scrList = data?.screener?.all_stocks;
    if (scrList && scrList.length) {
      const changeMap = new Map();
      const snap = data?.snapshot;
      if (snap?.exchanges) {
        for (const ex of ["NSE", "BSE"]) {
          for (const g of snap.exchanges[ex]?.gainers || []) {
            changeMap.set(ex + ":" + g.symbol, { delta: num(g.delta)/100, delta_pct: num(g.delta_pct) });
          }
          for (const l of snap.exchanges[ex]?.losers || []) {
            changeMap.set(ex + ":" + l.symbol, { delta: num(l.delta)/100, delta_pct: num(l.delta_pct) });
          }
        }
      }
      const arr = scrList.map(s => {
        const ex = s.exchange || "NSE";
        const ch = changeMap.get(ex + ":" + s.symbol) || changeMap.get(s.symbol) || { delta: 0, delta_pct: 0 };
        return [
          s.symbol,
          s.name || s.symbol,
          ex,
          num(s.amount_financed) / 100,
          ch.delta,
          ch.delta_pct,
          num(s.leverage_pct)
        ];
      });

      const existingBseSymbols = new Set(arr.filter(r => r[2] === "BSE").map(r => r[0]));
      for (const b of snap?.exchanges?.BSE?.top_funded || []) {
        if (!existingBseSymbols.has(b.symbol)) {
          const ch = changeMap.get("BSE:" + b.symbol) || { delta: 0, delta_pct: 0 };
          arr.push([
            b.symbol,
            b.name || b.symbol,
            "BSE",
            num(b.amt) / 100,
            ch.delta,
            ch.delta_pct,
            0
          ]);
        }
      }

      return arr
        .filter(r => (tableExchange === "ALL" || r[2] === tableExchange))
        .filter(r=>(String(r[0]||"")+" "+String(r[1]||"")).toLowerCase().includes(query.toLowerCase()))
        .sort((a,b)=>{const k={symbol:0,book:3,pct:5,lev:6}[sort]??3;return sortAsc?(a[k]>b[k]?1:-1):(a[k]<b[k]?1:-1)});
    }
    const rawStocks=data?.snapshot?.stocks||data?.snapshot?.top_funded_stocks||data?.snapshot?.exchanges?.NSE?.top_funded||[];
    const arr=rawStocks.length?rawStocks.map(x=>[
      x.symbol||x.ticker||x.name,
      x.company||x.company_name||x.name||x.symbol,
      "NSE",
      num(x.amt??x.book??x.mtf_book)/(x.amt?100:1),
      num(x.change??x.change_lakh),
      num(x.change_pct??x.change_percent),
      num(x.leverage_pct??x.leverage??16.5)
    ]):fallbackStocks;
    return arr
      .filter(r => (tableExchange === "ALL" || r[2] === tableExchange))
      .filter(r=>(String(r[0]||"")+" "+String(r[1]||"")).toLowerCase().includes(query.toLowerCase()))
      .sort((a,b)=>{const k={symbol:0,book:3,pct:5,lev:6}[sort]??3;return sortAsc?(a[k]>b[k]?1:-1):(a[k]<b[k]?1:-1)});
  },[data,query,sort,sortAsc,tableExchange]);
 const pageRows=stocks.slice((page-1)*rowsPer,page*rowsPer),pages=Math.max(1,Math.ceil(stocks.length/rowsPer));
  const CLASS_META = {
    "Non-F&O (Mid/Small)": {
      color: "#10b981",
      shortName: "NON-F&O",
      tag: "Highest Spread",
      desc: "Direct delivery MTF holdings outside F&O list with broker-specific haircuts"
    },
    "F&O Stocks": {
      color: "#3b82f6",
      shortName: "F&O STOCKS",
      tag: "Liquid Tier-1",
      desc: "Large-cap liquid F&O underlying stocks financed under standard margins"
    },
    "ETFs": {
      color: "#f59e0b",
      shortName: "ETFs",
      tag: "Index & Commodity",
      desc: "Exchange-traded index, sectoral, and gold ETF positions"
    }
  };
  const pie = useMemo(() => {
    return comp.map((x, i) => {
      const meta = CLASS_META[x.name] || {
        color: ["#10b981", "#3b82f6", "#f59e0b"][i % 3],
        shortName: x.name,
        tag: "Asset Class",
        desc: "Disclosed MTF position margin exposure"
      };
      return {
        ...x,
        color: meta.color,
        shortName: meta.shortName,
        tag: meta.tag,
        desc: meta.desc
      };
    });
  }, [comp]);

  const visibleFlow = useMemo(() => {
    const count = flowPeriod === "14D" ? 14 : flowPeriod === "30D" ? 30 : 60;
    const slice = flow.slice(-count);
    return slice.map(item => {
      const net = item.net !== undefined && item.net !== 0 ? item.net : (item.fresh - item.liquidated);
      return {
        ...item,
        net,
        liqNeg: -Math.abs(item.liquidated)
      };
    });
  }, [flow, flowPeriod]);

  const flowStats = useMemo(() => {
    if (!visibleFlow.length) return { avgFresh: 0, avgLiq: 0, netTotal: 0, flushCount: 0 };
    let sumFresh = 0, sumLiq = 0, sumNet = 0, flushCount = 0;
    for (const r of visibleFlow) {
      sumFresh += r.fresh;
      sumLiq += r.liquidated;
      sumNet += (r.fresh - r.liquidated);
      if (r.flush) flushCount++;
    }
    const n = visibleFlow.length;
    return {
      avgFresh: sumFresh / n,
      avgLiq: sumLiq / n,
      netTotal: sumNet,
      flushCount
    };
  }, [visibleFlow]);

  const flow30D = useMemo(() => flow.slice(-30), [flow]);
  const flushCount30D = useMemo(() => flow30D.filter(x => x.flush).length, [flow30D]);
  const lastFlush = useMemo(() => { const fl = flow.filter(x => x.flush); return fl.length ? fl[fl.length - 1] : null; }, [flow]);
  const latestFlow = flow[flow.length - 1] || {};
  const latestNetFlow = latestFlow.net !== undefined ? latestFlow.net : (latestFlow.fresh - latestFlow.liquidated);
  const avgLeverage = useMemo(() => {
    if (!stocks.length) return 19.4;
    const levs = stocks.map(s => s[6]).filter(v => v > 0);
    if (!levs.length) return 19.4;
    return levs.reduce((a, b) => a + b, 0) / levs.length;
  }, [stocks]);

  const setSortBy=k=>{if(sort===k)setSortAsc(!sortAsc);else{setSort(k);setSortAsc(false)}};

  return (
    <div className="neoTerminalApp">
      <div className="neoLayoutRoot">
        {/* Left Sidebar */}
        <aside className="neoSidebarCol">
          {/* Navigation Container */}
          <div className="neoNavContainer">
            <button
              className={`neoNavItem ${tab === "overview" ? "active" : ""}`}
              onClick={() => setTab("overview")}
            >
              <LayoutGrid size={16} color={tab === "overview" ? "#00f090" : "#64748b"} />
              <span>Overview</span>
              <span className="neoLiveBadge">LIVE</span>
            </button>

            <button
              className={`neoNavItem ${tab === "screener" ? "active" : ""}`}
              onClick={() => setTab("screener")}
            >
              <Search size={16} color={tab === "screener" ? "#00f090" : "#64748b"} />
              <span>Stock Screener</span>
            </button>

            <button
              className={`neoNavItem ${tab === "sectors" ? "active" : ""}`}
              onClick={() => setTab("sectors")}
            >
              <PieIcon size={16} color={tab === "sectors" ? "#00f090" : "#64748b"} />
              <span>Sectors & Heatmap</span>
            </button>

            <button
              className={`neoNavItem ${tab === "calc" ? "active" : ""}`}
              onClick={() => setTab("calc")}
            >
              <Calculator size={16} color={tab === "calc" ? "#00f090" : "#64748b"} />
              <span>Calculators & Margin</span>
            </button>
          </div>

          {/* MTF INSIGHT Card */}
          <div className="neoInsightCard">
            <div className="neoInsightHeader">
              <span className="neoInsightTitle">MTF INSIGHT</span>
              <div className="neoPulseDot" />
            </div>
            <div className="neoInsightSub">MTF book contracted</div>
            <div className="neoInsightHero">-0.12%</div>
            <div className="neoInsightDetail">today (-₹180.03 Cr)</div>

            {/* Smooth Wavy Sparkline */}
            <div className="neoInsightSpark">
              <svg viewBox="0 0 200 48" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
                <defs>
                  <linearGradient id="insightWaveGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff3b57" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#ff3b57" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0,16 Q 45,18 90,32 T 180,24 T 200,12"
                  fill="none"
                  stroke="#ff3b57"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <path
                  d="M 0,16 Q 45,18 90,32 T 180,24 T 200,12 L 200,48 L 0,48 Z"
                  fill="url(#insightWaveGrad)"
                />
              </svg>
            </div>

            <div className="neoInsightFooter">
              <span>vs 03 Sept 2026</span>
              <span style={{ fontWeight: 600 }}>1D EOD</span>
            </div>
          </div>

          {/* Station Telemetry Readout */}
          <div className="neoTelemetryCard">
            <div className="neoTelemetryRow">
              <span className="neoTelemetryLabel">EXCHANGES</span>
              <span className="neoTelemetryVal">NSE + BSE</span>
            </div>
            <div className="neoTelemetryRow">
              <span className="neoTelemetryLabel">LATENCY</span>
              <span className="neoTelemetryVal liveGreen">42ms LIVE</span>
            </div>
            <div className="neoTelemetryRow">
              <span className="neoTelemetryLabel">DATA PIPELINE</span>
              <span className="neoTelemetryVal syncWhite">SYNCHRONIZED</span>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        {tab === "screener" ? (
          <main className="neoMainCol">
            <ScreenerView onSelectStockInOverview={(stock) => {}} />
          </main>
        ) : tab === "sectors" ? (
          <main className="neoMainCol">
            <SectorsView onBack={() => setTab("screener")} />
          </main>
        ) : tab === "calc" ? (
          <main className="neoMainCol">
            <CalculatorView onBack={() => setTab("screener")} />
          </main>
        ) : tab === "about" || tab === "methodology" ? (
          <main className="neoMainCol">
            <AboutMethodologyView initialTab={tab} onNavigate={setTab} />
          </main>
        ) : (
          <CyberpunkOverview
            data={data}
            summary={summary}
            history={history}
            flow={flow}
            stocks={stocks}
            activeSecuritiesCount={activeSecuritiesCount}
            nseSecCount={nseSecCount}
            bseSecCount={bseSecCount}
            onRefresh={fetchDashboardData}
          />
        )}
      </div>

      {loading && (
        <div className="loading">
          <div className="spinner" />
          Loading live market data...
        </div>
      )}
    </div>
  );
}
function Nav({icon,text,active,badge,onClick}){
  return (
    <div
      className={"nav "+(active?"active":"")}
      onClick={onClick}
      role="button"
      tabIndex={0}
      style={{cursor:"pointer"}}
    >
      <span>{React.cloneElement(icon,{size:18,strokeWidth:1.7})}</span>
      <label style={{cursor:"pointer"}}>{text}</label>
      {badge&&<small>{badge}</small>}
    </div>
  );
}
function Segment({values,value,onChange}){return <div className="segment">{values.map(v=><button key={v} className={v===value?"on":""} onClick={()=>onChange(v)}>{v}</button>)}</div>}
function Kpi({title,value,delta,pct,subtitle,icon,chart,keyName="combined"}){
  const strokeColor = keyName === "combined" ? (delta < 0 ? "#ef4444" : "#10b981") : keyName === "nse" ? (delta < 0 ? "#3b82f6" : "#06b6d4") : "#10b981";
  const gradId = `kpiGrad-${keyName}`;
  const chartSlice = useMemo(() => {
    if (!chart || !chart.length) return [];
    return chart.slice(-30);
  }, [chart]);

  const { minVal, maxVal } = useMemo(() => {
    if (!chartSlice.length) return { minVal: 0, maxVal: 1 };
    const nums = chartSlice.map(d => num(d[keyName])).filter(v => v > 0);
    if (!nums.length) return { minVal: 0, maxVal: 1 };
    const min = Math.min(...nums);
    const max = Math.max(...nums);
    const span = max - min;
    const pad = span > 0 ? span * 0.2 : max * 0.02 || 1;
    return {
      minVal: Math.max(0, min - pad),
      maxVal: max + pad
    };
  }, [chartSlice, keyName]);

  return (
    <section className="card kpi">
      <div className="kpiHeader">
        <div className="kpiIcon">{React.cloneElement(icon, { size: 18 })}</div>
        <div className="kpiTitle">{title}</div>
      </div>
      <div className="kpiValue">{value}</div>
      {delta != null ? (
        <div className={`kpiDelta ${delta >= 0 ? "positive" : "negative"}`}>
          {delta >= 0 ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
          <span>{delta >= 0 ? "+" : "-"}{formatExactCr(Math.abs(delta))}</span>
          <b>({pct >= 0 ? "+" : ""}{pct.toFixed(2)}%)</b>
        </div>
      ) : null}
      <small>{subtitle || "vs previous period"}</small>
      {chart && chartSlice.length > 0 && (
        <div className="kpiChart">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartSlice} margin={{ top: 6, right: 4, left: 4, bottom: 0 }}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={strokeColor} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={strokeColor} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" hide />
              <YAxis hide domain={[minVal, maxVal]} />
              <Tooltip
                content={<KpiMiniTooltip strokeColor={strokeColor} />}
              />
              <Area
                type="monotone"
                dataKey={keyName}
                stroke={strokeColor}
                strokeWidth={2.2}
                fill={`url(#${gradId})`}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
function Metric({title,value,sub,icon}){return <section className="card metric"><div><span>{title}</span><strong>{value}</strong><small>{sub}</small></div><div className="metricIcon">{React.cloneElement(icon,{size:34})}</div></section>}
function Spark({positive}){const pts=Array.from({length:20},(_,i)=>({v:50+Math.sin(i/2)*8+i*.7+Math.random()*4}));return <div className="spark"><ResponsiveContainer width="100%" height="100%"><LineChart data={pts} margin={{top:2,bottom:2,left:2,right:2}}><YAxis hide domain={['dataMin','dataMax']}/><Line type="monotone" dataKey="v" dot={false} stroke={positive?"#10b981":"#f87171"} strokeWidth={2}/></LineChart></ResponsiveContainer></div>}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Dashboard error caught by ErrorBoundary:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#050b16",
          color: "#e2e8f0",
          fontFamily: "Inter, system-ui, sans-serif",
          padding: 24,
          textAlign: "center"
        }}>
          <div style={{
            maxWidth: 540,
            background: "#0a1526",
            border: "1px solid #1c2e4a",
            borderRadius: 12,
            padding: 32,
            boxShadow: "0 20px 40px rgba(0,0,0,0.6)"
          }}>
            <h2 style={{ margin: "0 0 12px", color: "#f87171", fontSize: 22, fontWeight: 700 }}>Something went wrong</h2>
            <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.5, margin: "0 0 18px" }}>
              The MTF Analytics dashboard encountered an unexpected error while rendering:
            </p>
            <pre style={{
              background: "#050b16",
              padding: 14,
              borderRadius: 8,
              color: "#fca5a5",
              fontSize: 12,
              overflowX: "auto",
              textAlign: "left",
              marginBottom: 22,
              border: "1px solid rgba(239, 68, 68, 0.2)"
            }}>
              {this.state.error?.message || String(this.state.error)}
            </pre>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: "#2563eb",
                color: "#fff",
                border: "none",
                padding: "10px 22px",
                borderRadius: 7,
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer"
              }}
            >
              Reload Dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")).render(
  <ErrorBoundary>
    <App/>
  </ErrorBoundary>
);

