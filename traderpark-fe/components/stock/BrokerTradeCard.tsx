"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { BrokerTrade } from "@/types";

interface BrokerTradeCardProps {
  trades: BrokerTrade[];
}

export function BrokerTradeCard({ trades }: BrokerTradeCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">거래원별 매매 현황</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>증권사</TableHead>
              <TableHead className="text-right">매수금액</TableHead>
              <TableHead className="text-right">매수수량</TableHead>
              <TableHead className="text-right">평균매수가</TableHead>
              <TableHead className="text-right">순매수</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trades.map((trade) => (
              <TableRow key={trade.brokerName}>
                <TableCell className="font-medium">{trade.brokerName}</TableCell>
                <TableCell className="text-right">
                  {(trade.buyAmount / 100000000).toFixed(1)}억
                </TableCell>
                <TableCell className="text-right">
                  {trade.buyQuantity.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  {trade.avgBuyPrice.toLocaleString()}원
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right",
                    trade.netAmount > 0 ? "text-up" : "text-down"
                  )}
                >
                  {trade.netAmount > 0 ? "+" : ""}
                  {(trade.netAmount / 100000000).toFixed(1)}억
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
