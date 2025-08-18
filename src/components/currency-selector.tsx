'use client';

import { useAppContext } from "@/context/app-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Currency } from "@/lib/types";
import { Globe } from "lucide-react";

const CURRENCIES: { value: Currency, label: string }[] = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'INR', label: 'INR (₹)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'GBP', label: 'GBP (£)' },
    { value: 'JPY', label: 'JPY (¥)' },
]

export function CurrencySelector() {
  const { currency, setCurrency, isLoading } = useAppContext();

  if (isLoading) return null;

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-5 w-5 text-muted-foreground" />
      <Select value={currency} onValueChange={(value: Currency) => setCurrency(value)}>
        <SelectTrigger className="w-[120px] h-9">
          <SelectValue placeholder="Currency" />
        </SelectTrigger>
        <SelectContent>
          {CURRENCIES.map(c => (
            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
