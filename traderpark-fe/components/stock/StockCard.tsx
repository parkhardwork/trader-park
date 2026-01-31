"use client";

import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Portfolio } from "@/types";
import Link from "next/link";

interface StockCardProps {
  portfolio: Portfolio;
}

export function StockCard({ portfolio }: StockCardProps) {
  const { stock, quantity, avgBuyPrice, profitLoss, profitLossRate } = portfolio;
  const isProfit = profitLoss >= 0;

  return (
    <Link href={`/stock/${stock.code}`}>
      <Card className="transition-colors hover:bg-accent">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{stock.name}</span>
              <span className="text-xs text-muted-foreground">{stock.code}</span>
            </div>
            <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
              <span>{quantity.toLocaleString()}주</span>
              <span>평단 {avgBuyPrice.toLocaleString()}원</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="font-semibold">
                {stock.currentPrice.toLocaleString()}원
              </div>
              <div
                className={cn(
                  "flex items-center justify-end gap-1 text-sm",
                  isProfit ? "text-up" : "text-down"
                )}
              >
                <span>
                  {isProfit ? "+" : ""}
                  {profitLoss.toLocaleString()}원
                </span>
                <span>
                  ({isProfit ? "+" : ""}
                  {profitLossRate.toFixed(2)}%)
                </span>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
