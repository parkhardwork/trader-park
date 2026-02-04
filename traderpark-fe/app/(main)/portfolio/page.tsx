"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getDailyBalance } from "@/lib/api/portfolio";
import type { DailyBalance, Order } from "@/types";

// Mock 주문 데이터
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
];

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  PENDING: { label: "대기중", variant: "secondary" },
  EXECUTED: { label: "체결", variant: "default" },
  CANCELLED: { label: "취소", variant: "outline" },
  FAILED: { label: "실패", variant: "destructive" },
};

function formatNumber(value: string | undefined): string {
  if (!value) return "-";
  const num = parseFloat(value.replace(/,/g, ""));
  if (isNaN(num)) return value;
  return num.toLocaleString("ko-KR");
}

function formatAmount(value: string | undefined): string {
  if (!value) return "-";
  const num = parseFloat(value.replace(/,/g, ""));
  if (isNaN(num)) return value;
  if (Math.abs(num) >= 100000000) {
    return (num / 100000000).toFixed(2) + "억";
  }
  return num.toLocaleString("ko-KR");
}

function getProfitClass(value: string | undefined): string {
  if (!value) return "";
  const num = parseFloat(value.replace(/,/g, ""));
  if (num > 0) return "text-red-500";
  if (num < 0) return "text-blue-500";
  return "";
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10).replace(/-/g, "");
}

export default function PortfolioPage() {
  const [queryDate, setQueryDate] = useState(getToday());

  const { data, isLoading, error, refetch } = useQuery<DailyBalance>({
    queryKey: ["dailyBalance", queryDate],
    queryFn: () => getDailyBalance(queryDate),
    enabled: false, // 수동으로 조회
  });

  const handleSearch = () => {
    refetch();
  };

  return (
    <div className="container space-y-4 px-4 py-4">
      <h1 className="text-xl font-bold">포트폴리오</h1>

      {/* 조회 설정 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">일별 잔고 수익률 조회</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Input
              type="text"
              placeholder="YYYYMMDD"
              value={queryDate}
              onChange={(e) => setQueryDate(e.target.value)}
              maxLength={8}
              className="w-32"
            />
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? "조회 중..." : "조회"}
            </Button>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            실전투자만 지원됩니다. (모의투자 미지원)
          </p>
        </CardContent>
      </Card>

      {/* 에러 표시 */}
      {error && (
        <Card className="border-red-500 bg-red-50 dark:bg-red-950">
          <CardContent className="pt-4">
            <p className="text-red-600 dark:text-red-400">
              조회 실패: {error instanceof Error ? error.message : "알 수 없는 오류"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* 계좌 요약 */}
      {data && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">계좌 요약</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg bg-muted p-3 text-center">
                <div className="text-xs text-muted-foreground">조회일자</div>
                <div className="mt-1 text-lg font-bold">{data.date || "-"}</div>
              </div>
              <div className="rounded-lg bg-muted p-3 text-center">
                <div className="text-xs text-muted-foreground">총 매입가</div>
                <div className="mt-1 text-lg font-bold">{formatAmount(data.totalBuyAmount)}</div>
              </div>
              <div className="rounded-lg bg-muted p-3 text-center">
                <div className="text-xs text-muted-foreground">총 평가금액</div>
                <div className="mt-1 text-lg font-bold">{formatAmount(data.totalEvalAmount)}</div>
              </div>
              <div className="rounded-lg bg-muted p-3 text-center">
                <div className="text-xs text-muted-foreground">총 평가손익</div>
                <div className={cn("mt-1 text-lg font-bold", getProfitClass(data.totalEvalProfit))}>
                  {formatAmount(data.totalEvalProfit)}
                </div>
              </div>
              <div className="rounded-lg bg-muted p-3 text-center">
                <div className="text-xs text-muted-foreground">수익률</div>
                <div className={cn("mt-1 text-lg font-bold", getProfitClass(data.totalProfitRate))}>
                  {data.totalProfitRate || "-"}%
                </div>
              </div>
              <div className="rounded-lg bg-muted p-3 text-center">
                <div className="text-xs text-muted-foreground">예수금</div>
                <div className="mt-1 text-lg font-bold">{formatAmount(data.depositBalance)}</div>
              </div>
              <div className="rounded-lg bg-muted p-3 text-center">
                <div className="text-xs text-muted-foreground">추정자산</div>
                <div className="mt-1 text-lg font-bold">{formatAmount(data.dayStockAsset)}</div>
              </div>
              <div className="rounded-lg bg-muted p-3 text-center">
                <div className="text-xs text-muted-foreground">현금비중</div>
                <div className="mt-1 text-lg font-bold">{data.cashWeight || "-"}%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 탭 영역 */}
      <Tabs defaultValue="holdings" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="holdings">보유종목</TabsTrigger>
          <TabsTrigger value="orders">주문내역</TabsTrigger>
        </TabsList>

        <TabsContent value="holdings" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">종목별 잔고</CardTitle>
            </CardHeader>
            <CardContent>
              {!data ? (
                <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                  조회 버튼을 클릭하세요
                </div>
              ) : data.stocks.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                  보유한 종목이 없습니다
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {/* <TableHead>종목코드</TableHead> */}
                        <TableHead>종목명</TableHead>
                        {/* <TableHead className="text-right">현재가</TableHead> */}
                        <TableHead className="text-right">보유수량</TableHead>
                        {/* <TableHead className="text-right">매입단가</TableHead> */}
                        <TableHead className="text-right">평가금액</TableHead>
                        <TableHead className="text-right">평가손익</TableHead>
                        <TableHead className="text-right">수익률</TableHead>
                        {/* <TableHead className="text-right">매수비중</TableHead>
                        <TableHead className="text-right">평가비중</TableHead> */}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.stocks.map((stock, index) => (
                        <TableRow key={stock.stockCode || index}>
                          {/* <TableCell>{stock.stockCode || "-"}</TableCell> */}
                          <TableCell className="font-medium">{stock.stockName || "-"}</TableCell>
                          {/* <TableCell className="text-right">{formatNumber(stock.currentPrice)}</TableCell> */}
                          <TableCell className="text-right">{formatNumber(stock.quantity)}</TableCell>
                          {/* <TableCell className="text-right">{formatNumber(stock.buyPrice)}</TableCell> */}
                          <TableCell className="text-right">{formatAmount(stock.evalAmount)}</TableCell>
                          <TableCell className={cn("text-right", getProfitClass(stock.evalProfit))}>
                            {formatAmount(stock.evalProfit)}
                          </TableCell>
                          <TableCell className={cn("text-right", getProfitClass(stock.profitRate))}>
                            {stock.profitRate || "-"}%
                          </TableCell>
                          {/* <TableCell className="text-right">{stock.buyWeight || "-"}%</TableCell> */}
                          {/* <TableCell className="text-right">{stock.evalWeight || "-"}%</TableCell> */}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
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
