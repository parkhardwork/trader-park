"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Star, Trash2, Settings, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { WatchList, Stock } from "@/types";

// Mock 데이터
const mockWatchList: WatchList[] = [
  {
    id: 1,
    stock: {
      code: "005930",
      name: "삼성전자",
      currentPrice: 72000,
      changePrice: 1200,
      changeRate: 1.69,
      volume: 15000000,
      high: 72500,
      low: 70800,
      open: 71000,
    },
    isAutoTrade: true,
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    stock: {
      code: "000660",
      name: "SK하이닉스",
      currentPrice: 135000,
      changePrice: -2000,
      changeRate: -1.46,
      volume: 5000000,
      high: 137000,
      low: 134000,
      open: 136500,
    },
    isAutoTrade: false,
    createdAt: "2024-01-16",
  },
  {
    id: 3,
    stock: {
      code: "035720",
      name: "카카오",
      currentPrice: 52300,
      changePrice: 800,
      changeRate: 1.55,
      volume: 3500000,
      high: 53500,
      low: 51500,
      open: 51800,
    },
    isAutoTrade: true,
    createdAt: "2024-01-17",
  },
];

export default function WatchlistPage() {
  const handleDelete = (id: number) => {
    // API 연동 시 구현
    console.log("Delete:", id);
  };

  const handleToggleAutoTrade = (id: number) => {
    // API 연동 시 구현
    console.log("Toggle auto trade:", id);
  };

  return (
    <div className="container space-y-4 px-4 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">관심종목</h1>
        <span className="text-sm text-muted-foreground">
          {mockWatchList.length}개 종목
        </span>
      </div>

      <div className="space-y-3">
        {mockWatchList.length > 0 ? (
          mockWatchList.map((item) => {
            const { stock } = item;
            const isUp = stock.changeRate >= 0;

            return (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <Link href={`/stock/${stock.code}`} className="flex-1">
                      <div className="flex items-center gap-3">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{stock.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {stock.code}
                            </span>
                            {item.isAutoTrade && (
                              <Badge variant="secondary" className="text-xs">
                                자동매매
                              </Badge>
                            )}
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="font-semibold">
                              {stock.currentPrice.toLocaleString()}원
                            </span>
                            <span
                              className={cn(
                                "text-sm",
                                isUp ? "text-up" : "text-down"
                              )}
                            >
                              {isUp ? "+" : ""}
                              {stock.changeRate.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleAutoTrade(item.id)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                      <Link href={`/stock/${stock.code}`}>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
            <Star className="mx-auto mb-2 h-8 w-8" />
            <p>관심종목이 없습니다</p>
            <p className="mt-1 text-sm">종목 발굴에서 관심종목을 추가해보세요</p>
            <Link href="/discover">
              <Button className="mt-4">종목 발굴하기</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
