"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import RentForm from "./rent-form";

export default function FormSheet() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg rounded-full px-5 py-3 h-auto text-sm font-medium cursor-pointer" data-tour-id="log-rent">
        + Log Your Rent
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md bg-zinc-900 border-zinc-800 overflow-y-auto p-0">
        <SheetHeader className="p-6 pb-0">
          <SheetTitle className="text-white">Share Your Rent</SheetTitle>
        </SheetHeader>
        <RentForm onSuccess={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
