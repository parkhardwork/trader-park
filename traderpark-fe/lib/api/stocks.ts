import apiClient from "./client";
import type { Stock, BrokerTrade, SearchCondition, SearchResult } from "@/types";

// 종목 상세 조회
export async function getStock(code: string): Promise<Stock> {
  const response = await apiClient.get(`/stocks/${code}`);
  return response.data;
}

// 종목 검색
export async function searchStocks(keyword: string): Promise<Stock[]> {
  const response = await apiClient.get(`/stocks/search`, {
    params: { q: keyword },
  });
  return response.data;
}

// 거래원별 정보 조회
export async function getBrokerTrades(code: string): Promise<BrokerTrade[]> {
  const response = await apiClient.get(`/stocks/${code}/broker-trades`);
  return response.data;
}

// 조건 검색 목록 조회
export async function getSearchConditions(): Promise<SearchCondition[]> {
  const response = await apiClient.get(`/conditions`);
  return response.data;
}

// 조건 검색 실행
export async function executeSearchCondition(conditionId: number): Promise<SearchResult> {
  const response = await apiClient.get(`/conditions/${conditionId}/execute`);
  return response.data;
}
