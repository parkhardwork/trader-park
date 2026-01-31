"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MarketIndex } from "@/components/stock/MarketIndex";
import { StockCard } from "@/components/stock/StockCard";
import { PortfolioSummary } from "@/components/portfolio/PortfolioSummary";
import { Search } from "lucide-react";
import Link from "next/link";
import type { Portfolio, PortfolioSummary as PortfolioSummaryType, MarketIndex as MarketIndexType } from "@/types";

// Mock 데이터 (API 연동 전 테스트용)
const mockIndices: MarketIndexType[] = [
  { name: "코스피", value: 2547.89, changeValue: 15.32, changeRate: 0.60 },
  { name: "코스닥", value: 823.45, changeValue: -5.21, changeRate: -0.63 },
];

const mockSummary: PortfolioSummaryType = {
  totalInvestment: 10000000,
  totalValue: 11500000,
  totalProfitLoss: 1500000,
  totalProfitLossRate: 15.0,
  stockCount: 5,
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

export default function DashboardPage() {
  // API 연동 시 아래 주석 해제
  // const { data: indices, isLoading: indicesLoading } = useQuery({
  //   queryKey: ["marketIndices"],
  //   queryFn: getMarketIndices,
  // });

  // Mock 데이터 사용
  const indices = mockIndices;
  const summary = mockSummary;
  const portfolio = mockPortfolio;
  const isLoading = false;

  return (
    <div className="container space-y-6 px-4 py-4">
      {/* 시장 지수 */}
      <section>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
          시장 지수
        </h2>
        {isLoading ? (
          <div className="flex gap-4">
            <Skeleton className="h-24 w-40" />
            <Skeleton className="h-24 w-40" />
          </div>
        ) : (
          <MarketIndex indices={indices} />
        )}
      </section>

      {/* 종목 발굴 버튼 */}
      <Link href="/discover">
        <Button className="w-full" size="lg">
          <Search className="mr-2 h-5 w-5" />
          종목 발굴하기
        </Button>
      </Link>

      {/* 포트폴리오 요약 */}
      <section>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
          내 포트폴리오
        </h2>
        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <PortfolioSummary summary={summary} />
        )}
      </section>

      {/* 보유 종목 목록 */}
      <section>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
          보유 종목
        </h2>
        <div className="space-y-3">
          {isLoading ? (
            <>
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </>
          ) : portfolio.length > 0 ? (
            portfolio.map((item) => (
              <StockCard key={item.id} portfolio={item} />
            ))
          ) : (
            <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
              보유한 종목이 없습니다
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
