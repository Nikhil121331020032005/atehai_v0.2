
'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Home, PlusCircle, Wallet, ArrowLeftRight, Landmark, CalendarClock, Target, User, Info, Gem, Plus } from 'lucide-react';
import { Logo } from '@/components/logo';
import { AddExpenseDialog } from '@/components/add-expense-dialog';
import { CurrencySelector } from './currency-selector';
import { useAuth } from '@/context/auth-context';
import { useAppContext } from '@/context/app-context';
import { ThemeToggle } from './theme-toggle';
import { Card, CardContent } from './ui/card';

export default function AppLayout({ children, pageTitle }: { children: React.ReactNode; pageTitle: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { profile } = useAppContext();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const handleProfileClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      router.push('/login');
    }
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === '/'}>
                <Link href="/">
                  <Home />
                  Dashboard
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === '/budgets'}>
                <Link href="/budgets">
                  <Wallet />
                  Budgets
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === '/borrow-lend'}>
                <Link href="/borrow-lend">
                  <ArrowLeftRight />
                  Borrow & Lend
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === '/emis'}>
                <Link href="/emis">
                  <CalendarClock />
                  EMIs
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === '/income'}>
                <Link href="/income">
                  <Landmark />
                  Income
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === '/goals'}>
                <Link href="/goals">
                  <Target />
                  Goals
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === '/about'}>
                        <Link href="/about">
                            <Info />
                            About
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === '/profile'}>
                        <Link href="/profile" onClick={handleProfileClick}>
                            <User />
                            Profile
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center justify-between border-b p-4 flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <h1 className="text-2xl font-semibold tracking-tight">{pageTitle}</h1>
          </div>
          <div className="flex items-center gap-4 flex-wrap justify-end">
             <CurrencySelector />
             <ThemeToggle />
            <Button className="hidden md:flex" onClick={() => setIsDialogOpen(true)}>
              <PlusCircle className="mr-2" /> Add Expense
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
          <AddExpenseDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} />
        </main>
         {/* Floating Action Button for Mobile */}
        <Button
            className="md:hidden fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
            size="icon"
            onClick={() => setIsDialogOpen(true)}
        >
            <Plus className="h-6 w-6" />
            <span className="sr-only">Add Expense</span>
        </Button>
      </SidebarInset>
    </SidebarProvider>
  );
}
