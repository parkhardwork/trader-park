// 주식 종목 정보
export interface Stock {
  code: string;
  name: string;
  currentPrice: number;
  changePrice: number;
  changeRate: number;
  volume: number;
  high: number;
  low: number;
  open: number;
}

// 보유 종목 (포트폴리오)
export interface Portfolio {
  id: number;
  stock: Stock;
  quantity: number;
  avgBuyPrice: number;
  totalAmount: number;
  profitLoss: number;
  profitLossRate: number;
}

// 관심 종목
export interface WatchList {
  id: number;
  stock: Stock;
  strategyId?: number;
  isAutoTrade: boolean;
  createdAt: string;
}

// 매매 전략
export interface TradingStrategy {
  id: number;
  name: string;
  entryPrice?: number;
  entryRatio: number;
  stopLossRate: number;
  takeProfitRate: number;
  maxBuyCount: number;
}

// 시장 지수
export interface MarketIndex {
  name: string;
  value: number;
  changeValue: number;
  changeRate: number;
}

// 조건 검색
export interface SearchCondition {
  id: number;
  name: string;
  description?: string;
}

// 조건 검색 결과 종목
export interface SearchResult {
  condition: SearchCondition;
  stocks: Stock[];
}

// 거래원 정보
export interface BrokerTrade {
  brokerName: string;
  buyAmount: number;
  buyQuantity: number;
  sellAmount: number;
  sellQuantity: number;
  netAmount: number;
  avgBuyPrice: number;
}

// 주문
export interface Order {
  id: number;
  stockCode: string;
  stockName: string;
  type: "BUY" | "SELL";
  quantity: number;
  price: number;
  status: "PENDING" | "EXECUTED" | "CANCELLED" | "FAILED";
  executedAt?: string;
  createdAt: string;
}

// 사용자 정보
export interface User {
  id: number;
  email: string;
  name: string;
  provider: "KAKAO" | "GOOGLE";
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// 포트폴리오 요약
export interface PortfolioSummary {
  totalInvestment: number;
  totalValue: number;
  totalProfitLoss: number;
  totalProfitLossRate: number;
  stockCount: number;
}
