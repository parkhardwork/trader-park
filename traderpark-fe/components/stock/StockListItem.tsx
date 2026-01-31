"use client";

import { cn } from "@/lib/utils";
import type { Stock } from "@/types";

interface StockListItemProps {
  stock: Stock;
  onClick?: (stock: Stock) => void;
  selected?: boolean;
}

export function StockListItem({ stock, onClick, selected }: StockListItemProps) {
  const isUp = stock.changeRate >= 0;

  return (
    <button
      onClick={() => onClick?.(stock)}
      className={cn(
        "flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors",
        selected ? "border-primary bg-accent" : "hover:bg-accent"
      )}
    >
      <div>
        <div className="font-medium">{stock.name}</div>
        <div className="text-sm text-muted-foreground">{stock.code}</div>
      </div>
      <div className="text-right">
        <div className="font-semibold">
          {stock.currentPrice.toLocaleString()}원
        </div>
        <div
          className={cn(
            "text-sm",
            isUp ? "text-up" : "text-down"
          )}
        >
          {isUp ? "+" : ""}
          {stock.changeRate.toFixed(2)}%
        </div>
      </div>
    </button>
  );
}
