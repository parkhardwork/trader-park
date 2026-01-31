"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MarketIndex as MarketIndexType } from "@/types";

interface MarketIndexProps {
  indices: MarketIndexType[];
}

export function MarketIndex({ indices }: MarketIndexProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {indices.map((index) => {
        const isUp = index.changeRate >= 0;
        return (
          <div
            key={index.name}
            className="flex min-w-[140px] flex-col rounded-lg border bg-card p-3"
          >
            <span className="text-sm text-muted-foreground">{index.name}</span>
            <span className="text-lg font-semibold">
              {index.value.toLocaleString("ko-KR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <div
              className={cn(
                "flex items-center gap-1 text-sm",
                isUp ? "text-up" : "text-down"
              )}
            >
              {isUp ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span>
                {isUp ? "+" : ""}
                {index.changeValue.toLocaleString("ko-KR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <span>
                ({isUp ? "+" : ""}
                {index.changeRate.toFixed(2)}%)
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
