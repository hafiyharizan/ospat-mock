"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, ClipboardCheck, LayoutDashboard, MapPin, Menu, ShieldAlert, X } from "lucide-react";
import clsx from "clsx";

const NAV = [
  { href: "/", label: "Supervisor", icon: LayoutDashboard },
  { href: "/feed", label: "Live Feed", icon: Activity },
  { href: "/sites", label: "Safety Manager", icon: MapPin },
  { href: "/review", label: "Review Queue", icon: ClipboardCheck },
];

export function MobileNav(){const [open,setOpen]=useState(false);const pathname=usePathname();useEffect(()=>setOpen(false),[pathname]);return <><button type="button" onClick={()=>setOpen(true)} className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border"><Menu className="h-4 w-4" /></button>{open&&<div className="lg:hidden fixed inset-0 z-50"><div className="absolute inset-0 bg-black/50" onClick={()=>setOpen(false)} /><aside className="absolute inset-y-0 left-0 w-72 bg-white dark:bg-zinc-950 border-r"><div className="flex h-16 items-center gap-2 px-5 border-b"><ShieldAlert className="h-4 w-4" /><span className="text-sm font-semibold">OSPAT</span><button onClick={()=>setOpen(false)} className="ml-auto"><X className="h-4 w-4"/></button></div><nav className="p-3 space-y-1">{NAV.map((item)=>{const Icon=item.icon;const active=item.href==="/"?pathname==="/":pathname.startsWith(item.href);return <Link key={item.href} href={item.href} className={clsx("flex items-center gap-2 rounded-lg px-3 py-2",active&&"bg-zinc-100 dark:bg-white/5")}><Icon className="h-4 w-4" />{item.label}</Link>})}</nav></aside></div>}</>}
