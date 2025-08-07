"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { LayoutGrid, Boxes, BarChart3, Banknote, Settings, Award } from 'lucide-react';

export function AppShell() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-accent"><path d="M7 21a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7z"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><path d="M12 14v-4"/><path d="M10 12h4"/></svg>
          <h1 className="font-headline text-2xl font-bold text-white">Shop Central</h1>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton href="/" tooltip="POS" asChild isActive={pathname === '/'}>
              <Link href="/"><LayoutGrid /><span>POS</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton href="/inventory" tooltip="Inventory" asChild isActive={pathname === '/inventory'}>
              <Link href="/inventory"><Boxes /><span>Inventory</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton href="/reports" tooltip="Reports" asChild isActive={pathname === '/reports'}>
              <Link href="/reports"><BarChart3 /><span>Reports</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton href="/loyalty" tooltip="Loyalty" asChild isActive={pathname === '/loyalty'}>
              <Link href="/loyalty"><Award /><span>Loyalty</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton href="/expenses" tooltip="Expenses" asChild isActive={pathname === '/expenses'}>
              <Link href="/expenses"><Banknote /><span>Expenses</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton href="/settings" tooltip="Settings" asChild isActive={pathname === '/settings'}>
              <Link href="/settings"><Settings /><span>Settings</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
