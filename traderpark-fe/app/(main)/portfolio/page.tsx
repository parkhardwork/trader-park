"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PortfolioSummary } from "@/components/portfolio/PortfolioSummary";
import { StockCard } from "@/components/stock/StockCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Portfolio, PortfolioSummary as PortfolioSummaryType, Order } from "@/types";

// Mock 데이터
const mockSummary: PortfolioSummaryType = {
  totalInvestment: 10000000,
  totalValue: 11500000,
  totalProfitLoss: 1500000,
  totalProfitLossRate: 15.0,
  stockCount: 3,
};

const mockPortfolio: Portfolio[] = [
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
    quantity: 50,
    avgBuyPrice: 68000,
    totalAmount: 3600000,
    profitLoss: 200000,
    profitLossRate: 5.88,
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
    quantity: 20,
    avgBuyPrice: 140000,
    totalAmount: 2700000,
    profitLoss: -100000,
    profitLossRate: -3.57,
  },
];

const mockOrders: Order[] = [
  {
    id: 1,
    stockCode: "005930",
    stockName: "삼성전자",
    type: "BUY",
    quantity: 10,
    price: 71500,
    status: "EXECUTED",
    executedAt: "2024-01-20 09:35:00",
    createdAt: "2024-01-20 09:30:00",
  },
  {
    id: 2,
    stockCode: "000660",
    stockName: "SK하이닉스",
    type: "SELL",
    quantity: 5,
    price: 136000,
    status: "PENDING",
    createdAt: "2024-01-20 10:00:00",
  },
  {
    id: 3,
    stockCode: "035720",
    stockName: "카카오",
    type: "BUY",
    quantity: 20,
    price: 52000,
    status: "CANCELLED",
    createdAt: "2024-01-19 14:00:00",
  },
];

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  PENDING: { label: "대기중", variant: "secondary" },
  EXECUTED: { label: "체결", variant: "default" },
  CANCELLED: { label: "취소", variant: "outline" },
  FAILED: { label: "실패", variant: "destructive" },
};

export default function PortfolioPage() {
  return (
    <div className="container space-y-4 px-4 py-4">
      <h1 className="text-xl font-bold">포트폴리오</h1>

      {/* 포트폴리오 요약 */}
      <PortfolioSummary summary={mockSummary} />

      {/* 탭 영역 */}
      <Tabs defaultValue="holdings" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="holdings">보유종목</TabsTrigger>
          <TabsTrigger value="orders">주문내역</TabsTrigger>
        </TabsList>

        <TabsContent value="holdings" className="mt-4 space-y-3">
          {mockPortfolio.length > 0 ? (
            mockPortfolio.map((item) => (
              <StockCard key={item.id} portfolio={item} />
            ))
          ) : (
            <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
              보유한 종목이 없습니다
            </div>
          )}
        </TabsContent>

        <TabsContent value="orders" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">최근 주문 내역</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>종목</TableHead>
                    <TableHead>유형</TableHead>
                    <TableHead className="text-right">수량</TableHead>
                    <TableHead className="text-right">가격</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead className="text-right">일시</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.stockName}</div>
                          <div className="text-xs text-muted-foreground">
                            {order.stockCode}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={order.type === "BUY" ? "default" : "secondary"}
                        >
                          {order.type === "BUY" ? "매수" : "매도"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {order.quantity.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {order.price.toLocaleString()}원
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusMap[order.status].variant}>
                          {statusMap[order.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {order.executedAt || order.createdAt}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
