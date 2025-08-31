'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useAppContext } from "@/context/app-context";
import { formatCurrency } from "@/lib/utils";
import type { Expense, Income } from "@/lib/types";

interface AnalyticsSummaryProps {
  expenses: Expense[];
  income: Income[];
  dateRange: { start: Date; end: Date };
  isLoading: boolean;
}

export function AnalyticsSummary({ expenses, income, dateRange, isLoading }: AnalyticsSummaryProps) {
  const { currency } = useAppContext();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalIncome = income
    .filter(item => item.status === 'Received')
    .reduce((sum, item) => sum + item.amount, 0);
  const netFlow = totalIncome - totalExpenses;
  const transactionCount = expenses.length + income.length;

  const getPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Income */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(totalIncome, currency)}
          </div>
          <p className="text-xs text-muted-foreground">
            {income.filter(item => item.status === 'Received').length} transactions
          </p>
        </CardContent>
      </Card>

      {/* Total Expenses */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(totalExpenses, currency)}
          </div>
          <p className="text-xs text-muted-foreground">
            {expenses.length} transactions
          </p>
        </CardContent>
      </Card>

      {/* Net Flow */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Flow</CardTitle>
          {netFlow >= 0 ? (
            <ArrowUpRight className="h-4 w-4 text-green-600" />
          ) : (
            <ArrowDownRight className="h-4 w-4 text-red-600" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(netFlow, currency)}
          </div>
          <p className="text-xs text-muted-foreground">
            {netFlow >= 0 ? 'Positive' : 'Negative'} cash flow
          </p>
        </CardContent>
      </Card>

      {/* Transaction Count */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
          <DollarSign className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {transactionCount}
          </div>
          <p className="text-xs text-muted-foreground">
            All transactions
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
