"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { StockListItem } from "@/components/stock/StockListItem";
import { BrokerTradeCard } from "@/components/stock/BrokerTradeCard";
import { ChevronRight, Info } from "lucide-react";
import Link from "next/link";
import type { SearchCondition, Stock, BrokerTrade } from "@/types";

// Mock 데이터
const mockConditions: SearchCondition[] = [
  { id: 1, name: "세력 매집 감지", description: "거래량 급증 + 특정 창구 매집" },
  { id: 2, name: "신고가 돌파", description: "52주 신고가 돌파 종목" },
  { id: 3, name: "급등주 포착", description: "전일 대비 5% 이상 상승" },
  { id: 4, name: "기관 순매수", description: "기관 순매수 상위 종목" },
];

const mockStocks: Stock[] = [
  {
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
  {
    code: "000660",
    name: "SK하이닉스",
    currentPrice: 135000,
    changePrice: 2500,
    changeRate: 1.89,
    volume: 5000000,
    high: 137000,
    low: 132000,
    open: 133000,
  },
  {
    code: "035720",
    name: "카카오",
    currentPrice: 52300,
    changePrice: -800,
    changeRate: -1.51,
    volume: 3500000,
    high: 53500,
    low: 52000,
    open: 53200,
  },
];

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
  {
    brokerName: "미래에셋",
    buyAmount: 2100000000,
    buyQuantity: 29000,
    sellAmount: 3200000000,
    sellQuantity: 44000,
    netAmount: -1100000000,
    avgBuyPrice: 72414,
  },
];

export default function DiscoverPage() {
  const [selectedCondition, setSelectedCondition] = useState<SearchCondition | null>(null);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);

  return (
    <div className="container grid h-[calc(100vh-8rem)] gap-4 px-4 py-4 md:grid-cols-3">
      {/* 조건검색 목록 */}
      <Card className="md:col-span-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">조건검색</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-14rem)]">
            <div className="space-y-1 p-2">
              {mockConditions.map((condition) => (
                <button
                  key={condition.id}
                  onClick={() => {
                    setSelectedCondition(condition);
                    setSelectedStock(null);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-3 text-left transition-colors ${
                    selectedCondition?.id === condition.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  }`}
                >
                  <div>
                    <div className="font-medium">{condition.name}</div>
                    <div className={`text-xs ${
                      selectedCondition?.id === condition.id
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    }`}>
                      {condition.description}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* 종목 목록 */}
      <Card className="md:col-span-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            {selectedCondition ? selectedCondition.name : "종목 선택"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-14rem)]">
            <div className="space-y-2 p-2">
              {selectedCondition ? (
                mockStocks.map((stock) => (
                  <StockListItem
                    key={stock.code}
                    stock={stock}
                    onClick={() => setSelectedStock(stock)}
                    selected={selectedStock?.code === stock.code}
                  />
                ))
              ) : (
                <div className="flex h-40 items-center justify-center text-muted-foreground">
                  조건을 선택하세요
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* 거래원 정보 */}
      <Card className="md:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg">
            {selectedStock ? selectedStock.name : "거래원 정보"}
          </CardTitle>
          {selectedStock && (
            <Link href={`/stock/${selectedStock.code}`}>
              <Button variant="outline" size="sm">
                <Info className="mr-1 h-4 w-4" />
                상세보기
              </Button>
            </Link>
          )}
        </CardHeader>
        <CardContent>
          {selectedStock ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-accent p-3">
                <div className="text-2xl font-bold">
                  {selectedStock.currentPrice.toLocaleString()}원
                </div>
                <div className={selectedStock.changeRate >= 0 ? "text-up" : "text-down"}>
                  {selectedStock.changeRate >= 0 ? "+" : ""}
                  {selectedStock.changePrice.toLocaleString()}원 (
                  {selectedStock.changeRate >= 0 ? "+" : ""}
                  {selectedStock.changeRate.toFixed(2)}%)
                </div>
              </div>
              <Separator />
              <BrokerTradeCard trades={mockBrokerTrades} />
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center text-muted-foreground">
              종목을 선택하세요
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
