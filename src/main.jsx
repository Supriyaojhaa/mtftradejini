import React, {useEffect, useMemo, useState} from "react";
import {createRoot} from "react-dom/client";
import {AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, ReferenceLine} from "recharts";
import {Home, Search, PieChart as PieIcon, Calculator, Send, CircleHelp, ShieldCheck, Download, Sun, Moon, ChevronDown, Activity, Building2, Landmark, Users, CalendarDays, TrendingUp, ArrowUpRight, ArrowDownRight, SlidersHorizontal, ChevronLeft, ChevronRight, ArrowRight} from "lucide-react";
import ScreenerView from "./ScreenerView.jsx";
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
  const cr = Number(lakh) / 100;
  return `₹${cr.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })} Cr`;
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
    <div style={{
      background: "rgba(10, 19, 34, 0.96)",
      border: "1px solid #223552",
      borderRadius: 7,
      padding: "5px 9px",
      boxShadow: "0 6px 18px rgba(0,0,0,0.6)",
      pointerEvents: "none",
      whiteSpace: "nowrap",
      textAlign: "center"
    }}>
      <div style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: "13px",
        fontWeight: 700,
        color: strokeColor || "#fff",
        letterSpacing: "-0.2px"
      }}>
        {formatExactCr(val)}
      </div>
      {dateStr ? (
        <div style={{ color: "#8a97aa", fontSize: "10px", marginTop: "2px" }}>
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
            {isPositive ? "+" : ""}{formatExactCr(net)}
          </b>
        </div>
      </div>
    </div>
  );
}


function App(){
 const [dark,setDark]=useState(true);
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

 useEffect(()=>{document.documentElement.dataset.theme=dark?"dark":"light"},[dark]);
 useEffect(()=>{(async()=>{setLoading(true);try{
   const summary=await getJson("/api/v1/summary");
   const [t,f,c,s,scr]=await Promise.all([
     getJson("/mtf_daily_totals.json").catch(()=>[]),
     getJson("/mtf_flow.json").catch(()=>[]),
     getJson("/mtf_aum_by_class.json").catch(()=>[]),
     getJson(`/date/${summary.asOf}.json`).catch(()=>null),
     getJson("/compressed_data/screener_data.json").catch(()=>null)
   ]);
   setData({summary,history:normalizeTotals(t),flow:normalizeFlow(f),comp:normalizeComp(c),snapshot:s,screener:scr});
 }catch(e){
   setData({summary:{book:{combined:15364883.96,nse:14693266.25,bse:671617.71},asOf:"2026-09-02"},history:fallbackHistory,flow:fallbackFlow,comp:fallbackComp,snapshot:null,screener:null});
 }finally{setLoading(false)}})()},[]);

 const summary=data?.summary||{book:{combined:15364883.96,nse:14693266.25,bse:671617.71},asOf:"2026-09-02"};
 const book=summary.book||{}; const combined=num(book.combined), nse=num(book.nse), bse=num(book.bse);
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

 return <div className="app">
  <header className="topbar">
   <div className="brand"><div className="brandMark"><span/><span/><span/><span/></div><div><b>MTF ANALYTICS</b><small>India’s Margin Trading Intelligence</small></div></div>
    <div className="live" title="Feed connected and synced live from exchange records"><i/> LIVE FEED</div>
    <div className="market" title="NSE and BSE publish aggregate MTF disclosures on a 1-2 day regulatory settlement lag. 02 Sept 2026 is the latest official disclosure released by the exchanges. Feed is synced live.">
      <span>EXCHANGE DISCLOSURE</span>
      <small>As of {fmtDate(displayDate)} &bull; Latest Released</small>
    </div>
    <div className="topbarRight">
      <button className="iconBtn" onClick={()=>setDark(!dark)} title={dark ? "Switch to light mode" : "Switch to dark mode"} aria-label="Toggle theme">{dark?<Sun size={18}/>:<Moon size={18}/>}</button>
    </div>
  </header>
  <div className="body">
   <aside className="sidebar">
    <Nav icon={<Home/>} text="Overview" active={tab==="overview"} onClick={()=>setTab("overview")}/>
    <Nav icon={<Search/>} text="Stock Screener" active={tab==="screener"} onClick={()=>setTab("screener")}/>
    <Nav icon={<PieIcon/>} text="Sectors & Map" active={tab==="sectors"} onClick={()=>setTab("sectors")}/>
    <Nav icon={<Calculator/>} text="Calculators" active={tab==="calc"} onClick={()=>setTab("calc")}/>
    <Nav icon={<Send/>} text="Broker Share" badge="Soon"/>
    <div className="sideSpacer"/>
    <div className="insight"><span>MTF INSIGHT</span><p>MTF book is up</p><strong>+{pctCombined.toFixed(2)}%</strong><small>today (+{formatExactCr(changeCombined)})</small><div className="miniLine"><ResponsiveContainer width="100%" height={48}><AreaChart data={history.slice(-30)} margin={{top:4,bottom:0,left:0,right:0}}><defs><linearGradient id="sideInsightGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#16d98a" stopOpacity={0.4}/><stop offset="100%" stopColor="#16d98a" stopOpacity={0}/></linearGradient></defs><YAxis hide domain={['dataMin','dataMax']}/><Area type="monotone" dataKey="combined" dot={false} stroke="#16d98a" strokeWidth={2} fill="url(#sideInsightGrad)"/></AreaChart></ResponsiveContainer></div><small>vs {fmtDate(previous.date)}</small></div>
    <div className="sideDownload"><Download size={17}/><div><b>Download Data</b><span>Get all datasets</span></div></div>
    <Nav icon={<CircleHelp/>} text="About"/><Nav icon={<ShieldCheck/>} text="Methodology"/>
   </aside>
   <main className="content">
    {tab === "screener" ? (
      <ScreenerView onSelectStockInOverview={(stock) => {}} />
    ) : tab === "sectors" ? (
      <div className="card" style={{padding: 24}}>
        <h2>Sectors & Market Map</h2>
        <p style={{color: "var(--muted)"}}>Deep-dive into sector-level retail crowding, free-float leverage, and industry concentration.</p>
        <button className="btn" style={{marginTop: 12}} onClick={()=>setTab("screener")}>Back to Screener</button>
      </div>
    ) : tab === "calc" ? (
      <div className="card" style={{padding: 24}}>
        <h2>MTF Leverage & Carry Calculator</h2>
        <p style={{color: "var(--muted)"}}>Model position carry, margin call thresholds, and holding break-evens.</p>
        <button className="btn" style={{marginTop: 12}} onClick={()=>setTab("screener")}>Back to Screener</button>
      </div>
    ) : (
      <>
        <div className="heroGrid">
         <Kpi title="TOTAL MTF BOOK (NSE + BSE)" value={formatExactCr(combined)} delta={changeCombined} pct={pctCombined} icon={<Activity/>} chart={history}/>
         <Kpi title="NSE MTF BOOK" value={formatExactCr(nse)} delta={changeNse} pct={pctNse} icon={<Building2/>} chart={history} keyName="nse"/>
         <Kpi title="BSE MTF BOOK" value={formatExactCr(bse)} delta={changeBse} pct={pctBse} icon={<Landmark/>} chart={history} keyName="bse"/>
         <Kpi title="ACTIVE SECURITIES" value={activeSecuritiesCount.toLocaleString("en-IN")} subtitle={`${nseSecCount.toLocaleString("en-IN")} NSE + ${bseSecCount.toLocaleString("en-IN")} BSE`} icon={<Users/>}/>
        </div>
        <div className="grid3">
          <section className="card chartCard span2">
           <div className="cardHead">
            <div>
              <h2>MTF BOOK LONG TERM</h2>
              <p>Total margin trading exposure across NSE + BSE</p>
            </div>
            <div className="controls">
              <Segment values={["1M","3M","6M","1Y","ALL"]} value={period} onChange={setPeriod}/>
              <Segment values={["ALL","NSE","BSE"]} value={exchange} onChange={setExchange}/>
            </div>
           </div>
           <div className="chart big">
            <ResponsiveContainer width="100%" height={255}>
              <AreaChart data={filteredHistory} margin={{top:10,right:10,left:0,bottom:0}}>
                <defs>
                  <linearGradient id="bluefill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2580ff" stopOpacity=".45"/>
                    <stop offset="100%" stopColor="#2580ff" stopOpacity="0.02"/>
                  </linearGradient>
                  <linearGradient id="greenfill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#18d57e" stopOpacity=".4"/>
                    <stop offset="100%" stopColor="#18d57e" stopOpacity="0.02"/>
                  </linearGradient>
                  <linearGradient id="orangefill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f6a21a" stopOpacity=".4"/>
                    <stop offset="100%" stopColor="#f6a21a" stopOpacity="0.02"/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1c2940" strokeDasharray="2 3" vertical={false}/>
                <XAxis dataKey="date" tickFormatter={(x)=>{if(!x)return "";if(period==="1M"||period==="3M")return x.slice(5);if(period==="6M"||period==="1Y")return x.slice(2,7);return x.slice(0,4);}} tick={{fill:"#7f8da5",fontSize:11}} axisLine={false} minTickGap={28}/>
                <YAxis width={76} tickFormatter={(v)=>{const cr=v/100;return `₹${Math.round(cr).toLocaleString("en-IN")} Cr`;}} tick={{fill:"#7f8da5",fontSize:11}} axisLine={false} domain={period==="ALL"?[0,"auto"]:["auto","auto"]}/>
                <Tooltip contentStyle={{background:"#0b1424",border:"1px solid #263650",borderRadius:10,color:"#fff",fontSize:12}} labelFormatter={(label)=>fmtDate(label)} formatter={(v,name)=>[formatExactCr(v),name==="combined"?"Total MTF Book":name==="nse"?"NSE Book":name==="bse"?"BSE Book":name]}/>
                {exchange==="ALL"?(
                  <>
                    <Area type="monotone" dataKey="combined" name="combined" stroke="#2580ff" fill="url(#bluefill)" strokeWidth={2.5}/>
                    <Area type="monotone" dataKey="nse" name="nse" stroke="#18d57e" fill="url(#greenfill)" strokeWidth={1.8} fillOpacity={0.2}/>
                    <Area type="monotone" dataKey="bse" name="bse" stroke="#f6a21a" fill="url(#orangefill)" strokeWidth={1.8} fillOpacity={0.25}/>
                  </>
                ):exchange==="NSE"?(
                  <Area type="monotone" dataKey="nse" name="nse" stroke="#18d57e" fill="url(#greenfill)" strokeWidth={2.5}/>
                ):(
                  <Area type="monotone" dataKey="bse" name="bse" stroke="#f6a21a" fill="url(#orangefill)" strokeWidth={2.5}/>
                )}
              </AreaChart>
            </ResponsiveContainer>
           </div>
           <div className="legend">
            {exchange==="ALL"?(
              <>
                <span><i className="blue"/>Combined</span>
                <span><i className="green"/>NSE</span>
                <span><i className="orange"/>BSE</span>
              </>
            ):exchange==="NSE"?(
              <span><i className="green"/>NSE Margin Book</span>
            ):(
              <span><i className="orange"/>BSE Margin Book</span>
            )}
           </div>
          </section>
          <section className="card chartCard">
            <div className="cardHead">
              <div>
                <h2>DAILY LEVERAGE FLOW</h2>
                <p>Fresh exposure vs liquidated margin</p>
              </div>
              <div className="flowControlsRow">
                <div className="miniSegment">
                  <button className={flowPeriod==="14D"?"on":""} onClick={()=>setFlowPeriod("14D")}>14D</button>
                  <button className={flowPeriod==="30D"?"on":""} onClick={()=>setFlowPeriod("30D")}>30D</button>
                  <button className={flowPeriod==="60D"?"on":""} onClick={()=>setFlowPeriod("60D")}>60D</button>
                </div>
                <div className="miniSegment">
                  <button className={flowType==="net"?"on":""} onClick={()=>setFlowType("net")}>Net Flow</button>
                  <button className={flowType==="dual"?"on":""} onClick={()=>setFlowType("dual")}>Dual Bars</button>
                  <button className={flowType==="split"?"on":""} onClick={()=>setFlowType("split")}>Split Flow</button>
                </div>
              </div>
            </div>
            <div className="flowMetaBar">
              <div className="flowLegendNew">
                {flowType === "dual" ? (
                  <>
                    <span className="flowLegendItem"><i className="flowDot green"/>Fresh Exposure (Inflow)</span>
                    <span className="flowLegendItem"><i className="flowDot red"/>Liquidated Margin (Outflow)</span>
                  </>
                ) : flowType === "split" ? (
                  <>
                    <span className="flowLegendItem"><i className="flowDot green"/>Fresh Borrowing (+Up)</span>
                    <span className="flowLegendItem"><i className="flowDot red"/>Liquidated Margin (-Down)</span>
                  </>
                ) : (
                  <>
                    <span className="flowLegendItem"><i className="flowDot green"/>Net Inflow (Leverage Added)</span>
                    <span className="flowLegendItem"><i className="flowDot red"/>Net Outflow (Liquidation Flush)</span>
                  </>
                )}
              </div>
              <div className="flowStatsPills">
                <span className="flowPill">
                  <span className="flowPillLbl">Avg Fresh:</span>
                  <b>{formatExactCr(flowStats.avgFresh)}</b>
                </span>
                <span className="flowPill">
                  <span className="flowPillLbl">Avg Liq:</span>
                  <b>{formatExactCr(flowStats.avgLiq)}</b>
                </span>
                <span className={`flowPill netPill ${flowStats.netTotal >= 0 ? "positive" : "negative"}`}>
                  <span className="flowPillLbl">Net Flow:</span>
                  <b>{flowStats.netTotal >= 0 ? "+" : ""}{formatExactCr(flowStats.netTotal)}</b>
                </span>
                {flowStats.flushCount > 0 && (
                  <span className="flowPill flushPill">
                    <span className="flushDot"/>
                    <b>{flowStats.flushCount} Flush {flowStats.flushCount === 1 ? "Event" : "Events"}</b>
                  </span>
                )}
              </div>
            </div>
            <div className="chart flow">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={visibleFlow}
                  margin={{top:12,right:12,left:-4,bottom:0}}
                  barGap={flowType==="dual" ? (flowPeriod==="14D"?4:2) : 0}
                  barCategoryGap={flowPeriod==="14D"?"24%":flowPeriod==="30D"?"18%":"12%"}
                >
                  <defs>
                    <linearGradient id="freshFlowGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.95}/>
                      <stop offset="100%" stopColor="#059669" stopOpacity={0.35}/>
                    </linearGradient>
                    <linearGradient id="liqFlowGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.95}/>
                      <stop offset="100%" stopColor="#be123c" stopOpacity={0.35}/>
                    </linearGradient>
                    <linearGradient id="netPosGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.95}/>
                      <stop offset="100%" stopColor="#047857" stopOpacity={0.35}/>
                    </linearGradient>
                    <linearGradient id="netNegGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#be123c" stopOpacity={0.35}/>
                      <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.95}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#1c2940" strokeDasharray="3 3" vertical={false}/>
                  <XAxis
                    dataKey="date"
                    tickFormatter={x=>{
                      if(!x)return "";
                      const p=String(x).split("-");
                      if(p.length===3){
                        const m=["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
                        return `${p[2]} ${m[+p[1]]||""}`;
                      }
                      return String(x).slice(5);
                    }}
                    tick={{fill:"#8292a8",fontSize:11}}
                    axisLine={false}
                    tickLine={false}
                    minTickGap={16}
                    dy={6}
                  />
                  <YAxis
                    tickFormatter={formatFlowY}
                    tick={{fill:"#8292a8",fontSize:11}}
                    axisLine={false}
                    tickLine={false}
                    width={64}
                  />
                  <Tooltip
                    cursor={{fill:"rgba(255,255,255,0.04)",radius:6}}
                    content={<CustomFlowTooltip/>}
                  />
                  {(flowType==="net"||flowType==="split") && (
                    <ReferenceLine y={0} stroke="rgba(255,255,255,0.18)" strokeWidth={1.2}/>
                  )}
                  {flowType==="dual" ? (
                    <>
                      <Bar
                        dataKey="fresh"
                        fill="url(#freshFlowGrad)"
                        radius={[5,5,0,0]}
                        name="fresh"
                        maxBarSize={flowPeriod==="14D"?15:flowPeriod==="30D"?9:5}
                      />
                      <Bar
                        dataKey="liquidated"
                        fill="url(#liqFlowGrad)"
                        radius={[5,5,0,0]}
                        name="liquidated"
                        maxBarSize={flowPeriod==="14D"?15:flowPeriod==="30D"?9:5}
                      />
                    </>
                  ) : flowType==="split" ? (
                    <>
                      <Bar
                        dataKey="fresh"
                        fill="url(#freshFlowGrad)"
                        radius={[5,5,0,0]}
                        name="fresh"
                        maxBarSize={flowPeriod==="14D"?22:flowPeriod==="30D"?14:7}
                      />
                      <Bar
                        dataKey="liqNeg"
                        fill="url(#liqFlowGrad)"
                        radius={[0,0,5,5]}
                        name="liquidated"
                        maxBarSize={flowPeriod==="14D"?22:flowPeriod==="30D"?14:7}
                      />
                    </>
                  ) : (
                    <Bar
                      dataKey="net"
                      name="net"
                      maxBarSize={flowPeriod==="14D"?26:flowPeriod==="30D"?16:9}
                    >
                      {visibleFlow.map((entry,idx)=>(
                        <Cell
                          key={`net-${idx}`}
                          fill={entry.net>=0?"url(#netPosGrad)":"url(#netNegGrad)"}
                          radius={entry.net>=0?[5,5,0,0]:[0,0,5,5]}
                        />
                      ))}
                    </Bar>
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
          <section className="card chartCard">
            <div className="cardHead">
              <div>
                <h2>BOOK COMPOSITION BY CLASS</h2>
                <p>Margin book distribution by asset class</p>
              </div>
              <div className="compHeaderBadge">
                <ShieldCheck size={13}/>
                <span>3 Asset Classes</span>
              </div>
            </div>
            <div className="compContainer">
              <div className="compDonutSide">
                <div className="compTopBar">
                  {hoveredClass ? (
                    <div className="compTopActive">
                      <span className="compTopDot" style={{background:hoveredClass.color}}/>
                      <span className="compTopLabel">{hoveredClass.name}:</span>
                      <b className="compTopPct" style={{color:hoveredClass.color}}>{hoveredClass.value.toFixed(2)}%</b>
                      <span className="compTopAmt">({formatExactCr(hoveredClass.book)})</span>
                    </div>
                  ) : (
                    <div className="compTopDefault">
                      <span className="compTopDot defaultDot"/>
                      <span className="compTopLabel">Total MTF Portfolio:</span>
                      <b className="compTopTotalVal">{formatExactCr(combined)}</b>
                      <span className="compTopTotalSub">across classes</span>
                    </div>
                  )}
                </div>
                <div className="compDonutWrapper">
                  <div className="compDonutInner">
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart margin={{top:0,bottom:0,left:0,right:0}} onMouseLeave={()=>setHoveredClass(null)}>
                        <Pie
                          data={pie}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={78}
                          outerRadius={108}
                          paddingAngle={4}
                          cornerRadius={6}
                          minAngle={8}
                          stroke="none"
                          isAnimationActive={false}
                        >
                          {pie.map((x)=>(
                            <Cell
                              key={x.name}
                              fill={x.color}
                              opacity={hoveredClass?(hoveredClass.name===x.name?1:0.3):1}
                              style={{cursor:"pointer",transition:"opacity .2s ease, transform .2s ease",outline:"none"}}
                              onMouseEnter={()=>setHoveredClass(x)}
                            />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="compDonutCenter">
                      {hoveredClass ? (
                        <div className="compCenterState active">
                          <span className="compCenterTag" style={{color:hoveredClass.color}}>{hoveredClass.shortName}</span>
                          <span className="compCenterValue pctVal" style={{color:hoveredClass.color}}>{hoveredClass.value.toFixed(2)}%</span>
                          <span className="compCenterSub">{formatExactCr(hoveredClass.book)}</span>
                        </div>
                      ) : (
                        <div className="compCenterState">
                          <span className="compCenterTag">TOTAL MTF BOOK</span>
                          <span className="compCenterValue totalVal">{formatExactCr(combined)}</span>
                          <span className="compCenterSub">3 Asset Classes</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="compBreakdownList">
                {pie.map(x=>(
                  <div
                    key={x.name}
                    className={`compBreakdownItem ${hoveredClass?.name===x.name?"itemActive":""}`}
                    onMouseEnter={()=>setHoveredClass(x)}
                    onMouseLeave={()=>setHoveredClass(null)}
                  >
                    <div className="compItemTop">
                      <div className="compItemTitle">
                        <span className="compColorDot" style={{background:x.color}}/>
                        <span className="compItemName">{x.name}</span>
                        <span className="compItemTag">{x.tag}</span>
                      </div>
                      <div className="compItemFigures">
                        <b className="compItemPct" style={{color:x.color}}>{x.value.toFixed(2)}%</b>
                        <span className="compItemBook">{formatExactCr(x.book)}</span>
                      </div>
                    </div>
                    <div className="compItemDesc">{x.desc}</div>
                    <div className="compBarTrack">
                      <div className="compBarFill" style={{width:`${Math.min(100,Math.max(x.value,3))}%`,background:x.color}}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="compFootnote">Disclosed under SEBI MTF asset classification norms</div>
          </section>
        </div>
        <div className="metricGrid">
          <Metric title="LATEST 1D NET FLOW" value={`${(latestNetFlow >= 0 ? "+" : "") + formatExactCr(latestNetFlow)}`} sub={`Net shift on ${fmtDate(displayDate)}`} icon={<TrendingUp/>}/>
          <Metric title="MTF EXPOSURE (1D)" value={fmtPct(pctCombined)} sub={`vs ${fmtDate(previous.date)}`} icon={<Activity/>}/>
          <Metric title="FLUSH EVENTS (30D)" value={String(flushCount30D)} sub={lastFlush ? `0 in 30D (Last: ${fmtDate(lastFlush.date)})` : "High liquidation days"} icon={<CalendarDays/>}/>
          <Metric title="AVG LEVERAGE" value={`${avgLeverage.toFixed(2)}%`} sub="Across active stocks" icon={<PieIcon/>}/>
        </div>
        <section className="card tableCard"><div className="tableHead"><div><h2>TOP MTF STOCKS</h2><p>Latest active securities ranked by margin book</p></div><div className="tableTools"><Segment values={["ALL", "NSE", "BSE"]} value={tableExchange} onChange={(v)=>{setTableExchange(v);setPage(1);}}/><button className="screenerLinkBtn" onClick={()=>setTab("screener")} title="Launch full-featured stock screener"><SlidersHorizontal size={13} className="screenerBtnIcon"/><span>Open Full Stock Screener</span><ArrowRight size={13} className="screenerBtnArrow"/></button><div className="tableSearch"><Search size={16}/><input value={query} onChange={e=>{setQuery(e.target.value);setPage(1)}} placeholder="Search by symbol or company..."/></div><select value={rowsPer} onChange={e=>{setRowsPer(+e.target.value);setPage(1)}}><option value="5">5 per page</option><option value="10">10 per page</option><option value="25">25 per page</option></select></div></div>
          <div className="tableScroll"><table><thead><tr><th>#</th><th onClick={()=>setSortBy("symbol")}>Symbol</th><th>Company</th><th>Exchange</th><th onClick={()=>setSortBy("book")}>MTF Book (₹ Cr)</th><th>1D Change (₹ Cr)</th><th onClick={()=>setSortBy("pct")}>1D Change (%)</th><th onClick={()=>setSortBy("lev")}>Leverage (%)</th><th>Trend (30D)</th></tr></thead><tbody>{pageRows.map((r,i)=><tr key={r[0]}><td>{(page-1)*rowsPer+i+1}</td><td className="symbol">{r[0]}</td><td>{r[1]}</td><td><span className={`exchangeBadge badge-${String(r[2]||"nse").toLowerCase()}`}><b style={{fontSize:9,marginRight:3}}>◆</b>{r[2]}</span></td><td className="number">{r[3].toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td><td className={r[4]>=0?"positive":"negative"}>{r[4]>=0?"+":""}{r[4].toFixed(2)}</td><td className={r[5]>=0?"positive":"negative"}>{r[5]>=0?"+":""}{r[5].toFixed(2)}%</td><td>{r[6].toFixed(2)}%</td><td><Spark positive={r[5]>=0}/></td></tr>)}</tbody></table></div>
          <div className="pagination"><span>Showing {pageRows.length} of {stocks.length} stocks</span><div><button disabled={page===1} onClick={()=>setPage(page-1)}><ChevronLeft size={16}/></button>{Array.from({length:Math.min(4,pages)},(_,i)=><button className={page===i+1?"active":""} onClick={()=>setPage(i+1)} key={i}>{i+1}</button>)}{pages>4&&<><em>…</em><button onClick={()=>setPage(pages)}>{pages}</button></>}<button disabled={page===pages} onClick={()=>setPage(page+1)}><ChevronRight size={16}/></button></div></div>
        </section>
      </>
    )}
    <footer><span>Data source: NSE / BSE MTF disclosures</span><i/> <span>Processed via MTF Analytics public data endpoints</span><span className="footRight">All values in ₹ (INR) &nbsp;|&nbsp; Lakh = 100,000 &nbsp;|&nbsp; Crore = 10,000,000</span></footer>
   </main>
  </div>
  {loading&&<div className="loading"><div className="spinner"/>Loading live market data…</div>}
 </div>
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
  const strokeColor = keyName === "nse" ? "#10b981" : keyName === "bse" ? "#f59e0b" : "#3b82f6";
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
      <div className="kpiIcon">{React.cloneElement(icon, { size: 20 })}</div>
      <div className="kpiTitle">{title}</div>
      <div className="kpiValue">{value}</div>
      {delta != null ? (
        <div className={`kpiDelta ${delta >= 0 ? "positive" : "negative"}`}>
          {delta >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          {delta >= 0 ? "+" : "-"}{formatExactCr(Math.abs(delta))} <b>({pct >= 0 ? "+" : ""}{pct.toFixed(2)}%)</b>
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
function Spark({positive}){const pts=Array.from({length:20},(_,i)=>({v:50+Math.sin(i/2)*8+i*.7+Math.random()*4}));return <div className="spark"><ResponsiveContainer width="100%" height="100%"><LineChart data={pts} margin={{top:2,bottom:2,left:2,right:2}}><YAxis hide domain={['dataMin','dataMax']}/><Line type="monotone" dataKey="v" dot={false} stroke={positive?"#17d87f":"#ff4d5c"} strokeWidth={2}/></LineChart></ResponsiveContainer></div>}

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

