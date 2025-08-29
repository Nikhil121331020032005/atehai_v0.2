'use client';

import { useState, useMemo } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { useAppContext } from '@/context/app-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Eye, EyeOff } from 'lucide-react';
import { SpendingChart } from './spending-chart';
import { RecentExpenses } from './recent-expenses';
import { NetWorthWidget } from './net-worth-widget';
import { GoalsWidget } from './goals-widget';
import { EmisWidget } from './emis-widget';
import { IncomeWidget } from './income-widget';
import { SavingsWidget } from './savings-widget';
import { DebtsWidget } from './debts-widget';
import { TrendsChart } from './trends-chart';
import type { DashboardWidget } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const ResponsiveGridLayout = WidthProvider(Responsive);

export function CustomizableDashboard() {
  const { dashboardWidgets, updateDashboardWidgets, expenses, income, assets, liabilities, goals, emis } = useAppContext();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const visibleWidgets = useMemo(() => 
    dashboardWidgets.filter(w => w.isVisible), 
    [dashboardWidgets]
  );

  const layouts = useMemo(() => ({
    lg: visibleWidgets.map(w => ({ i: w.id, ...w.position })),
    md: visibleWidgets.map(w => ({ i: w.id, ...w.position, w: Math.min(w.position.w, 8) })),
    sm: visibleWidgets.map(w => ({ i: w.id, x: 0, y: w.position.y, w: 12, h: w.position.h })),
  }), [visibleWidgets]);

  const handleLayoutChange = (layout: any[]) => {
    if (!isEditMode) return;
    
    const updatedWidgets = dashboardWidgets.map(widget => {
      const layoutItem = layout.find(l => l.i === widget.id);
      if (layoutItem) {
        return {
          ...widget,
          position: { x: layoutItem.x, y: layoutItem.y, w: layoutItem.w, h: layoutItem.h }
        };
      }
      return widget;
    });
    
    updateDashboardWidgets(updatedWidgets);
  };

  const toggleWidgetVisibility = (widgetId: string) => {
    const updatedWidgets = dashboardWidgets.map(w => 
      w.id === widgetId ? { ...w, isVisible: !w.isVisible } : w
    );
    updateDashboardWidgets(updatedWidgets);
  };

  const renderWidget = (widget: DashboardWidget) => {
    const commonProps = {
      className: isEditMode ? 'cursor-move border-2 border-dashed border-primary/50' : '',
    };

    switch (widget.type) {
      case 'expenses':
        return (
          <Card {...commonProps}>
            <CardHeader>
              <CardTitle className="text-lg">{widget.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentExpenses expenses={expenses} />
            </CardContent>
          </Card>
        );
      
      case 'spending-chart':
        return (
          <div {...commonProps}>
            <SpendingChart expenses={expenses} />
          </div>
        );
      
      case 'net-worth':
        return (
          <div {...commonProps}>
            <NetWorthWidget assets={assets} liabilities={liabilities} />
          </div>
        );
      
      case 'goals':
        return (
          <div {...commonProps}>
            <GoalsWidget goals={goals} />
          </div>
        );
      
      case 'emis':
        return (
          <div {...commonProps}>
            <EmisWidget emis={emis} />
          </div>
        );
      
      case 'income':
        return (
          <div {...commonProps}>
            <IncomeWidget income={income} />
          </div>
        );
      
      case 'savings':
        return (
          <div {...commonProps}>
            <SavingsWidget assets={assets.filter(a => a.type === 'savings')} />
          </div>
        );
      
      case 'debts':
        return (
          <div {...commonProps}>
            <DebtsWidget liabilities={liabilities} />
          </div>
        );
      
      default:
        return (
          <Card {...commonProps}>
            <CardContent className="p-6">
              <p>Widget: {widget.title}</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Financial Dashboard</h2>
        <div className="flex gap-2">
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Customize
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Dashboard Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Widget Visibility</h4>
                  {dashboardWidgets.map(widget => (
                    <div key={widget.id} className="flex items-center justify-between">
                      <Label htmlFor={widget.id} className="text-sm">{widget.title}</Label>
                      <Switch
                        id={widget.id}
                        checked={widget.isVisible}
                        onCheckedChange={() => toggleWidgetVisibility(widget.id)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button
            variant={isEditMode ? "default" : "outline"}
            size="sm"
            onClick={() => setIsEditMode(!isEditMode)}
          >
            {isEditMode ? 'Save Layout' : 'Edit Layout'}
          </Button>
        </div>
      </div>

      {isEditMode && (
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Edit Mode:</strong> Drag widgets to rearrange them. Resize by dragging the corners.
          </p>
        </div>
      )}

      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        onLayoutChange={handleLayoutChange}
        breakpoints={{ lg: 1200, md: 996, sm: 768 }}
        cols={{ lg: 12, md: 8, sm: 12 }}
        rowHeight={60}
        isDraggable={isEditMode}
        isResizable={isEditMode}
        margin={[16, 16]}
        containerPadding={[0, 0]}
      >
        {visibleWidgets.map(widget => (
          <div key={widget.id}>
            {renderWidget(widget)}
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
}