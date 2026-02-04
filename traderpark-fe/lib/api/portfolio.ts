import apiClient from "./client";
import type { Portfolio, PortfolioSummary, WatchList, TradingStrategy, MarketIndex, DailyBalance } from "@/types";

// 보유 종목 목록 조회
export async function getPortfolio(): Promise<Portfolio[]> {
  const response = await apiClient.get(`/portfolio`);
  return response.data;
}

// 포트폴리오 요약 조회
export async function getPortfolioSummary(): Promise<PortfolioSummary> {
  const response = await apiClient.get(`/portfolio/summary`);
  return response.data;
}

// 일별 잔고 수익률 조회 (키움 API)
export async function getDailyBalance(date?: string): Promise<DailyBalance> {
  const params = date ? { date } : {};
  const response = await apiClient.get(`/portfolio/daily-balance`, { params });
  return response.data;
}

// 관심 종목 목록 조회
export async function getWatchList(): Promise<WatchList[]> {
  const response = await apiClient.get(`/watchlist`);
  return response.data;
}

// 관심 종목 추가
export async function addWatchList(stockCode: string, strategyId?: number): Promise<WatchList> {
  const response = await apiClient.post(`/watchlist`, {
    stockCode,
    strategyId,
  });
  return response.data;
}

// 관심 종목 삭제
export async function removeWatchList(id: number): Promise<void> {
  await apiClient.delete(`/watchlist/${id}`);
}

// 매매 전략 목록 조회
export async function getStrategies(): Promise<TradingStrategy[]> {
  const response = await apiClient.get(`/strategies`);
  return response.data;
}

// 시장 지수 조회
export async function getMarketIndices(): Promise<MarketIndex[]> {
  const response = await apiClient.get(`/market/indices`);
  return response.data;
}
