"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { BrokerTradeCard } from "@/components/stock/BrokerTradeCard";
import { Search, ExternalLink, Star, Plus } from "lucide-react";
import type { Stock, BrokerTrade } from "@/types";

// Mock 데이터
const mockStock: Stock = {
  code: "005930",
  name: "삼성전자",
  currentPrice: 72000,
  changePrice: 1200,
  changeRate: 1.69,
  volume: 15000000,
  high: 72500,
  low: 70800,
  open: 71000,
};

const mockBrokerTrades: BrokerTrade[] = [
  {
    brokerName: "교보증권",
    buyAmount: 5200000000,
    buyQuantity: 72000,
    sellAmount: 1200000000,
    sellQuantity: 17000,
    netAmount: 4000000000,
    avgBuyPrice: 72222,
  },
  {
    brokerName: "KB증권",
    buyAmount: 3500000000,
    buyQuantity: 48000,
    sellAmount: 2800000000,
    sellQuantity: 39000,
    netAmount: 700000000,
    avgBuyPrice: 72917,
  },
];

const mockThemes = ["반도체", "AI", "HBM", "전기전자", "수출주"];

export default function StockDetailPage() {
  const params = useParams();
  const code = params.code as string;
  const [searchCode, setSearchCode] = useState(code || "");
  const [stock, setStock] = useState<Stock | null>(mockStock);

  const handleSearch = () => {
    // API 연동 시 구현
    console.log("Search:", searchCode);
  };

  const handleAddWatchlist = () => {
    // API 연동 시 구현
    console.log("Add to watchlist:", stock?.code);
  };

  return (
    <div className="container space-y-4 px-4 py-4">
      {/* 종목 검색 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input
              placeholder="종목코드 입력 (예: 005930)"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {stock && (
        <>
          {/* 종목 기본 정보 */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">{stock.name}</h1>
                    <span className="text-muted-foreground">{stock.code}</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">
                      {stock.currentPrice.toLocaleString()}원
                    </span>
                    <span
                      className={`ml-2 text-lg ${
                        stock.changeRate >= 0 ? "text-up" : "text-down"
                      }`}
                    >
                      {stock.changeRate >= 0 ? "+" : ""}
                      {stock.changePrice.toLocaleString()}원 (
                      {stock.changeRate >= 0 ? "+" : ""}
                      {stock.changeRate.toFixed(2)}%)
                    </span>
                  </div>
                </div>
                <Button onClick={handleAddWatchlist} variant="outline">
                  <Star className="mr-1 h-4 w-4" />
                  관심등록
                </Button>
              </div>

              <Separator className="my-4" />

              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">시가</span>
                  <p className="font-medium">{stock.open.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">고가</span>
                  <p className="font-medium text-up">{stock.high.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">저가</span>
                  <p className="font-medium text-down">{stock.low.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">거래량</span>
                  <p className="font-medium">{(stock.volume / 10000).toFixed(0)}만</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 탭 영역 */}
          <Tabs defaultValue="broker" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="broker">거래원</TabsTrigger>
              <TabsTrigger value="theme">테마/재료</TabsTrigger>
              <TabsTrigger value="links">외부링크</TabsTrigger>
            </TabsList>

            <TabsContent value="broker" className="mt-4">
              <BrokerTradeCard trades={mockBrokerTrades} />
            </TabsContent>

            <TabsContent value="theme" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">관련 테마</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {mockThemes.map((theme) => (
                      <Badge key={theme} variant="secondary" className="text-sm">
                        {theme}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="links" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">외부 링크</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <a
                    href={`https://finance.naver.com/item/main.naver?code=${stock.code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent"
                  >
                    <span>네이버 종목 정보</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <a
                    href={`https://finance.naver.com/item/board.naver?code=${stock.code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent"
                  >
                    <span>네이버 종목 토론실</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <a
                    href={`https://search.naver.com/search.naver?where=news&query=${encodeURIComponent(stock.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent"
                  >
                    <span>관련 뉴스 검색</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
