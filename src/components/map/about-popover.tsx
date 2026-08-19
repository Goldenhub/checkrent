"use client";

import { useState, useRef, useEffect } from "react";

export default function AboutPopover() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      {open && (
        <div className="absolute bottom-full mb-2 right-0 w-80 rounded-xl border border-zinc-700/50 bg-zinc-900/80 p-4 backdrop-blur-md shadow-2xl">
          <h3 className="text-sm font-semibold text-white mb-2">About checkRent</h3>
          <div className="space-y-2 text-xs text-zinc-400 leading-relaxed">
            <p>checkRent is a crowdsourced rent analytics platform. Real renters share what they pay, and the map visualizes it so everyone can make informed decisions.</p>
            <p className="text-zinc-300 font-medium">How to use</p>
            <ul className="space-y-1 list-none">
              <li>
                <span className="text-cyan-400">Explore</span> — Pan and zoom the map. Cyan Hex polygon cells show rent density by area.
              </li>
              <li>
                <span className="text-cyan-400">Inspect</span> — Click anywhere on the map to see area stats: min, max, median, average, and breakdowns by bedrooms and property type.
              </li>
              <li>
                <span className="text-cyan-400">Filter</span> — Use the top toolbar to filter by bedrooms or property type.
              </li>
              <li>
                <span className="text-cyan-400">Contribute</span> — Tap &quot;+ Log Your Rent&quot; to anonymously submit your rent data.
              </li>
            </ul>
          </div>
          <button type="button" onClick={() => setOpen(false)} className="mt-3 text-xs text-zinc-500 hover:text-white transition-colors cursor-pointer">
            Close
          </button>
        </div>
      )}
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-700/50 bg-zinc-900/80 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors cursor-pointer backdrop-blur-sm" title="About checkRent">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4m0-4h.01" />
        </svg>
      </button>
    </div>
  );
}
