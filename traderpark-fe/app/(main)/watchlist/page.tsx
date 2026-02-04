"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TrendingDown, BarChart3, ArrowDown } from "lucide-react";
import CandlestickChart from "@/components/stock/CandlestickChart";
import { getDailyChart } from "@/lib/api/stocks";
import type { DailyChart } from "@/types";

interface WatchlistStock {
  code: string;
  name: string;
}

interface WatchlistGroup {
  label: string;
  stocks: WatchlistStock[];
}

const WATCHLIST_GROUPS: WatchlistGroup[] = [
  {
    label: "개별종목",
    stocks: [
      { code: "241520", name: "DSC인베스트먼트" },
    ],
  },
  {
    label: "원자재 / AI",
    stocks: [
      { code: "132030", name: "KODEX 골드선물(H)" },
      { code: "144600", name: "KODEX 은선물(H)" },
      { code: "395160", name: "KODEX AI반도체" },
      { code: "445290", name: "KODEX 로봇액티브" },
      { code: "487240", name: "KODEX AI전력핵심설비" },
      { code: "491010", name: "TIGER 글로벌AI전력인프라액티브" },
    ],
  },
  {
    label: "바이오",
    stocks: [
      { code: "244580", name: "KODEX 바이오" },
      { code: "364970", name: "TIGER 바이오TOP10" },
    ],
  },
  {
    label: "방산 / 조선",
    stocks: [
      { code: "449450", name: "PLUS K방산" },
      { code: "466920", name: "SOL 조선TOP3플러스" },
    ],
  },
  {
    label: "대형주",
    stocks: [
      { code: "005380", name: "현대차" },
      { code: "000660", name: "SK하이닉스" },
      { code: "005930", name: "삼성전자" },
    ],
  },
];

function formatNumber(num: number): string {
  return num.toLocaleString("ko-KR");
}

function formatDate(dt: string): string {
  if (!dt || dt.length !== 8) return dt || "-";
  return `${dt.substring(0, 4)}-${dt.substring(4, 6)}-${dt.substring(6, 8)}`;
}

export default function WatchlistPage() {
  const [selectedStock, setSelectedStock] = useState<WatchlistStock | null>(null);

  const { data: chartData, isLoading, error } = useQuery<DailyChart>({
    queryKey: ["dailyChart", selectedStock?.code],
    queryFn: () => getDailyChart(selectedStock!.code),
    enabled: !!selectedStock,
  });

  const handleStockClick = (stock: WatchlistStock) => {
    setSelectedStock(stock);
  };

  return (
    <div className="container px-4 py-4">
      <h1 className="mb-4 text-xl font-bold">관심종목</h1>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left: Stock List */}
        <div className="space-y-3 lg:col-span-1">
          {WATCHLIST_GROUPS.map((group) => (
            <Card key={group.label}>
              <CardHeader className="pb-2 pt-3 px-4">
                <CardTitle className="text-sm text-muted-foreground">{group.label}</CardTitle>
              </CardHeader>
              <CardContent className="px-2 pb-2">
                <div className="space-y-0.5">
                  {group.stocks.map((stock) => {
                    const isSelected = selectedStock?.code === stock.code;
                    return (
                      <button
                        key={stock.code}
                        onClick={() => handleStockClick(stock)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors",
                          "hover:bg-accent",
                          isSelected && "bg-accent font-medium"
                        )}
                      >
                        <span>{stock.name}</span>
                        <span className="text-xs text-muted-foreground">{stock.code}</span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Right: Chart Area */}
        <div className="space-y-4 lg:col-span-2">
          {!selectedStock ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <BarChart3 className="mb-3 h-10 w-10" />
                <p>종목을 선택하면 일봉 차트를 조회합니다</p>
              </CardContent>
            </Card>
          ) : isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-20 text-muted-foreground">
                조회 중...
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="border-red-500">
              <CardContent className="pt-4">
                <p className="text-red-500">
                  조회 실패: {error instanceof Error ? error.message : "알 수 없는 오류"}
                </p>
              </CardContent>
            </Card>
          ) : chartData ? (
            <>
              {/* Drop Rate Summary */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingDown className="h-5 w-5" />
                    {selectedStock.name}
                    <Badge variant="outline" className="text-xs font-normal">
                      {selectedStock.code}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-lg bg-muted p-3 text-center">
                      <div className="text-xs text-muted-foreground">기간 내 최고가</div>
                      <div className="mt-1 text-lg font-bold text-red-500">
                        {formatNumber(chartData.highPrice)}
                      </div>
                    </div>
                    <div className="rounded-lg bg-muted p-3 text-center">
                      <div className="text-xs text-muted-foreground">현재가</div>
                      <div className="mt-1 text-lg font-bold">
                        {formatNumber(chartData.currentPrice)}
                      </div>
                    </div>
                    <div className="rounded-lg bg-muted p-3 text-center">
                      <div className="text-xs text-muted-foreground">고점대비 하락률</div>
                      <div className={cn(
                        "mt-1 flex items-center justify-center gap-1 text-lg font-bold",
                        chartData.dropRate < 0 ? "text-blue-500" : "text-red-500"
                      )}>
                        {chartData.dropRate < 0 && <ArrowDown className="h-4 w-4" />}
                        {chartData.dropRate}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Candlestick Chart */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">일봉 차트</CardTitle>
                  {chartData.items.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {formatDate(chartData.items[chartData.items.length - 1]?.date)} ~{" "}
                      {formatDate(chartData.items[0]?.date)} ({chartData.items.length}일)
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <CandlestickChart items={chartData.items} />
                </CardContent>
              </Card>

              {/* Recent Data Summary */}
              {chartData.items.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">최근 거래 정보</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <div className="rounded-lg bg-muted p-3 text-center">
                        <div className="text-xs text-muted-foreground">종가</div>
                        <div className="mt-1 font-bold">
                          {formatNumber(chartData.items[0].close)}
                        </div>
                      </div>
                      <div className="rounded-lg bg-muted p-3 text-center">
                        <div className="text-xs text-muted-foreground">시가</div>
                        <div className="mt-1 font-bold">
                          {formatNumber(chartData.items[0].open)}
                        </div>
                      </div>
                      <div className="rounded-lg bg-muted p-3 text-center">
                        <div className="text-xs text-muted-foreground">고가</div>
                        <div className="mt-1 font-bold text-red-500">
                          {formatNumber(chartData.items[0].high)}
                        </div>
                      </div>
                      <div className="rounded-lg bg-muted p-3 text-center">
                        <div className="text-xs text-muted-foreground">저가</div>
                        <div className="mt-1 font-bold text-blue-500">
                          {formatNumber(chartData.items[0].low)}
                        </div>
                      </div>
                      <div className="rounded-lg bg-muted p-3 text-center">
                        <div className="text-xs text-muted-foreground">거래량</div>
                        <div className="mt-1 font-bold">
                          {formatNumber(chartData.items[0].volume)}
                        </div>
                      </div>
                      <div className="rounded-lg bg-muted p-3 text-center">
                        <div className="text-xs text-muted-foreground">전일대비</div>
                        <div className={cn(
                          "mt-1 font-bold",
                          chartData.items[0].changeSign === "1" || chartData.items[0].changeSign === "2"
                            ? "text-red-500"
                            : chartData.items[0].changeSign === "4" || chartData.items[0].changeSign === "5"
                              ? "text-blue-500"
                              : ""
                        )}>
                          {chartData.items[0].change || "-"}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
