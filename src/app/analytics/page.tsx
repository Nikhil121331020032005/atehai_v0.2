'use client';

import AppLayout from "@/components/app-layout";
import { EnhancedTrendsChart } from "@/components/analytics/enhanced-trends-chart";
import { AnalyticsSummary } from "@/components/analytics/analytics-summary";
import { CategoryBreakdown } from "@/components/analytics/category-breakdown";
import { DateRangeSelector } from "@/components/analytics/date-range-selector";
import { MultiMonthComparison } from "@/components/analytics/multi-month-comparison";
import { useAppContext } from "@/context/app-context";
import { Suspense, useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Calendar, TrendingUp, BarChart3 } from "lucide-react";
import { format, subMonths, subWeeks, subYears, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear } from "date-fns";

export default function AnalyticsPage() {
  return (
    <AppLayout pageTitle="Financial Analytics">
      <Suspense fallback={<PageSkeleton />}>
        <AnalyticsClient />
      </Suspense>
    </AppLayout>
  );
}

function AnalyticsClient() {
  const { expenses, income, isLoading, getArchivedData } = useAppContext();
  const [selectedDateRange, setSelectedDateRange] = useState<'current' | 'previous' | 'custom'>('current');
  const [timeRange, setTimeRange] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [historicalData, setHistoricalData] = useState<any>(null);
  const [isLoadingHistorical, setIsLoadingHistorical] = useState(false);

  // Get date range based on selection
  const getDateRange = () => {
    const now = new Date();
    
    switch (selectedDateRange) {
      case 'current':
        switch (timeRange) {
          case 'weekly':
            return { start: startOfWeek(now), end: endOfWeek(now) };
          case 'monthly':
            return { start: startOfMonth(now), end: endOfMonth(now) };
          case 'yearly':
            return { start: startOfYear(now), end: endOfYear(now) };
        }
        break;
      case 'previous':
        switch (timeRange) {
          case 'weekly':
            const lastWeek = subWeeks(now, 1);
            return { start: startOfWeek(lastWeek), end: endOfWeek(lastWeek) };
          case 'monthly':
            const lastMonth = subMonths(now, 1);
            return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
          case 'yearly':
            const lastYear = subYears(now, 1);
            return { start: startOfYear(lastYear), end: endOfYear(lastYear) };
        }
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          return { start: new Date(customStartDate), end: new Date(customEndDate) };
        }
        return { start: startOfMonth(now), end: endOfMonth(now) };
    }
  };

  // Load historical data when needed
  useEffect(() => {
    const loadHistoricalData = async () => {
      if (selectedDateRange === 'previous' || selectedDateRange === 'custom') {
        setIsLoadingHistorical(true);
        try {
          const dateRange = getDateRange();
          const monthKey = format(dateRange.start, 'yyyy-MM');
          
          // Try to get archived data first
          const archivedData = await getArchivedData(monthKey);
          
          if (archivedData && Object.keys(archivedData).length > 0) {
            setHistoricalData(archivedData);
          } else {
            // If no archived data, filter current data by date range
            const filteredExpenses = expenses.filter(expense => {
              const expenseDate = new Date(expense.date);
              return expenseDate >= dateRange.start && expenseDate <= dateRange.end;
            });
            
            const filteredIncome = income.filter(item => {
              const incomeDate = new Date(item.date);
              return incomeDate >= dateRange.start && incomeDate <= dateRange.end;
            });
            
            setHistoricalData({
              expenses: filteredExpenses,
              income: filteredIncome
            });
          }
        } catch (error) {
          console.error('Error loading historical data:', error);
        } finally {
          setIsLoadingHistorical(false);
        }
      } else {
        setHistoricalData(null);
      }
    };

    loadHistoricalData();
  }, [selectedDateRange, timeRange, customStartDate, customEndDate, expenses, income, getArchivedData]);

  // Determine which data to use
  const currentData = { expenses, income };
  const displayData = historicalData || currentData;

  if (isLoading) {
    return <PageSkeleton />;
  }

  const dateRange = getDateRange();
  const isHistorical = selectedDateRange !== 'current';

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Financial Analytics</h2>
        <p className="text-muted-foreground">
          Analyze your financial patterns across different time periods
        </p>
      </div>

      {/* Date Range Selector */}
      <DateRangeSelector
        selectedDateRange={selectedDateRange}
        setSelectedDateRange={setSelectedDateRange}
        timeRange={timeRange}
        setTimeRange={setTimeRange}
        customStartDate={customStartDate}
        setCustomStartDate={setCustomStartDate}
        customEndDate={customEndDate}
        setCustomEndDate={setCustomEndDate}
      />

      {/* Historical Data Alert */}
      {isHistorical && (
        <Alert className="border-blue-200 bg-blue-50">
          <Calendar className="h-4 w-4" />
          <AlertTitle>Historical Data View</AlertTitle>
          <AlertDescription>
            Viewing data from {format(dateRange.start, 'MMM dd, yyyy')} to {format(dateRange.end, 'MMM dd, yyyy')}
            {historicalData && ' (Archived data)'}
          </AlertDescription>
        </Alert>
      )}

      {/* Analytics Summary */}
      <AnalyticsSummary 
        expenses={displayData.expenses} 
        income={displayData.income}
        dateRange={dateRange}
        isLoading={isLoadingHistorical}
      />

      {/* Main Chart */}
      <EnhancedTrendsChart 
        expenses={displayData.expenses} 
        income={displayData.income}
        dateRange={dateRange}
        timeRange={timeRange}
        isLoading={isLoadingHistorical}
      />

      {/* Category Breakdown */}
      <CategoryBreakdown 
        expenses={displayData.expenses}
        isLoading={isLoadingHistorical}
      />

      {/* Multi-Month Comparison */}
      <MultiMonthComparison />
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <Skeleton className="h-8 w-64 mx-auto" />
        <Skeleton className="h-4 w-96 mx-auto" />
      </div>
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-96 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}