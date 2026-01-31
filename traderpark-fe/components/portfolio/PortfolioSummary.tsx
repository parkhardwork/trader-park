"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { PortfolioSummary as PortfolioSummaryType } from "@/types";

interface PortfolioSummaryProps {
  summary: PortfolioSummaryType;
}

export function PortfolioSummary({ summary }: PortfolioSummaryProps) {
  const isProfit = summary.totalProfitLoss >= 0;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-muted-foreground">총 평가금액</span>
            <p className="text-xl font-bold">
              {summary.totalValue.toLocaleString()}원
            </p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">총 투자금액</span>
            <p className="text-xl font-bold">
              {summary.totalInvestment.toLocaleString()}원
            </p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">총 평가손익</span>
            <p
              className={cn(
                "text-xl font-bold",
                isProfit ? "text-up" : "text-down"
              )}
            >
              {isProfit ? "+" : ""}
              {summary.totalProfitLoss.toLocaleString()}원
            </p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">총 수익률</span>
            <p
              className={cn(
                "text-xl font-bold",
                isProfit ? "text-up" : "text-down"
              )}
            >
              {isProfit ? "+" : ""}
              {summary.totalProfitLossRate.toFixed(2)}%
            </p>
          </div>
        </div>
        <div className="mt-4 border-t pt-4">
          <span className="text-sm text-muted-foreground">
            보유 종목 {summary.stockCount}개
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
