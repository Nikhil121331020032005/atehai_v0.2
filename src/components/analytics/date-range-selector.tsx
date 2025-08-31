'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, CalendarDays } from "lucide-react";

interface DateRangeSelectorProps {
  selectedDateRange: 'current' | 'previous' | 'custom';
  setSelectedDateRange: (range: 'current' | 'previous' | 'custom') => void;
  timeRange: 'weekly' | 'monthly' | 'yearly';
  setTimeRange: (range: 'weekly' | 'monthly' | 'yearly') => void;
  customStartDate: string;
  setCustomStartDate: (date: string) => void;
  customEndDate: string;
  setCustomEndDate: (date: string) => void;
}

export function DateRangeSelector({
  selectedDateRange,
  setSelectedDateRange,
  timeRange,
  setTimeRange,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
}: DateRangeSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Date Range Selection
        </CardTitle>
        <CardDescription>
          Choose the time period you want to analyze
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Time Range Buttons */}
        <div className="space-y-2">
          <Label>Time Range</Label>
          <div className="flex gap-2">
            {(['weekly', 'monthly', 'yearly'] as const).map(range => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(range)}
                className="capitalize"
              >
                {range}
              </Button>
            ))}
          </div>
        </div>

        {/* Date Range Selection */}
        <div className="space-y-2">
          <Label>Date Range</Label>
          <div className="flex gap-2">
            <Button
              variant={selectedDateRange === 'current' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedDateRange('current')}
              className="flex items-center gap-1"
            >
              <Clock className="h-4 w-4" />
              Current
            </Button>
            <Button
              variant={selectedDateRange === 'previous' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedDateRange('previous')}
              className="flex items-center gap-1"
            >
              <CalendarDays className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant={selectedDateRange === 'custom' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedDateRange('custom')}
              className="flex items-center gap-1"
            >
              <Calendar className="h-4 w-4" />
              Custom
            </Button>
          </div>
        </div>

        {/* Custom Date Inputs */}
        {selectedDateRange === 'custom' && (
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
