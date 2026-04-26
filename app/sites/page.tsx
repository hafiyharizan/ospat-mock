import clsx from "clsx";
import { ArrowDownRight, ArrowUpRight, MapPin, Minus } from "lucide-react";
import { getSiteSummaries } from "@/lib/data";
import { PageHeader } from "@/components/ui/PageHeader";
import { MiniSparkline } from "@/components/charts/MiniSparkline";

export default function SitesPage() {
  const sites = getSiteSummaries();
  return <div><PageHeader title="Safety Manager Dashboard · 14 days" description="Strategic readiness drift, flagged burden, and riskiest shift by site." />
  <div className="grid gap-4 md:grid-cols-2">{sites.map((s)=>{const trendColor=s.trend14d>0?"text-emerald-300":s.trend14d<0?"text-rose-300":"text-zinc-400";const TrendIcon=s.trend14d>0?ArrowUpRight:s.trend14d<0?ArrowDownRight:Minus;const sparkColor=s.trend14d>0?"#34d399":s.trend14d<0?"#fb7185":"#a5b4fc";return <div key={s.siteId} className="panel-padded"><div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-zinc-500" /><span className="text-[10px] uppercase tracking-widest text-zinc-500">{s.region}</span></div><h3 className="mt-1 text-base font-semibold text-zinc-900 dark:text-white">{s.siteName}</h3><p className="text-xs text-zinc-500">{s.type}</p></div><div className={clsx("inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium", s.trend14d>0?"bg-emerald-400/10":s.trend14d<0?"bg-rose-400/10":"bg-white/[0.04]", trendColor)}><TrendIcon className="h-3 w-3" />{Math.abs(s.trend14d).toFixed(1)}%<span className="text-[10px] text-zinc-500 ml-1">14d</span></div></div><div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3"><Metric label="Today" value={s.assessments}/><Metric label="Flagged" value={s.flagged} accent={s.flagged>0?"danger":"default"}/><Metric label="Avg readiness" value={s.avgReadiness.toFixed(1)}/><Metric label="Riskiest shift" value={s.highestRiskShift}/></div><div className="mt-4 -mx-2"><MiniSparkline values={s.recentScores} color={sparkColor} /></div></div>;})}</div></div>;
}

function Metric({label,value,accent="default"}:{label:string;value:string|number;accent?:"default"|"danger"}){return <div><div className="text-[10px] uppercase tracking-widest text-zinc-500">{label}</div><div className={clsx("mt-1 text-lg font-semibold tabular-nums",accent==="danger"?"text-rose-500 dark:text-rose-300":"text-zinc-900 dark:text-white")}>{value}</div></div>}
