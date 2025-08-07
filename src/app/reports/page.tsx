
"use client";

import { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/data";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { DollarSign, Package, ShoppingCart } from 'lucide-react';

const salesData = [
  { id: "SALE001", customer: "John Doe", date: "2024-07-28", total: 4550.00, status: "Paid" },
  { id: "SALE002", customer: "Jane Smith", date: "2024-07-28", total: 12000.00, status: "Paid" },
  { id: "SALE003", customer: "Walk-in", date: "2024-07-27", total: 1575.00, status: "Paid" },
  { id: "SALE004", customer: "Robert Brown", date: "2024-07-27", total: 8820.00, status: "Refunded" },
  { id: "SALE005", customer: "Walk-in", date: "2024-07-26", total: 3210.00, status: "Paid" },
  { id: "SALE006", customer: "Emily Davis", date: "2024-07-26", total: 5500.00, status: "Paid" },
  { id: "SALE007", customer: "Walk-in", date: "2024-07-25", total: 1250.00, status: "Paid" },

];


export default function ReportsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  
  useEffect(() => {
    const productsCollection = collection(db, "products");
    const unsubscribe = onSnapshot(productsCollection, (snapshot) => {
        const productsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Product[];
        setProducts(productsData);
    });
    return () => unsubscribe();
  }, []);

  const totalRevenue = useMemo(() => {
    return salesData
      .filter(sale => sale.status === 'Paid')
      .reduce((acc, sale) => acc + sale.total, 0);
  }, []);

  const totalSales = useMemo(() => {
     return salesData.filter(sale => sale.status === 'Paid').length;
  }, []);

  const chartData = useMemo(() => {
    const dailySales: {[key: string]: number} = {};
    salesData.forEach(sale => {
      if (sale.status === 'Paid') {
        const date = new Date(sale.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (!dailySales[date]) {
          dailySales[date] = 0;
        }
        dailySales[date] += sale.total;
      }
    });
    return Object.keys(dailySales).map(date => ({
      date,
      total: dailySales[date]
    })).reverse();
  }, []);


  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Reports Dashboard</h1>
        <p className="text-muted-foreground">An overview of your business performance.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KSH {totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">Based on all-time paid sales</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalSales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Number of paid transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products in Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">Distinct products in inventory</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
             <CardDescription>A chart showing total sales per day.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
             <ChartContainer config={{}} className="h-[300px] w-full">
               <ResponsiveContainer>
                  <BarChart data={chartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tickFormatter={(value) => value.slice(0, 6)}
                    />
                    <YAxis
                       tickFormatter={(value) => `KSH ${Number(value) / 1000}k`}
                       tickLine={false}
                       axisLine={false}
                    />
                    <Tooltip
                        cursor={false}
                        content={<ChartTooltipContent 
                           formatter={(value) => `KSH ${Number(value).toLocaleString()}`} 
                           indicator="dot"
                        />}
                    />
                    <Bar dataKey="total" fill="var(--color-primary)" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>A log of the most recent transactions.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesData.slice(0, 5).map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>
                          <div className="font-medium">{sale.customer}</div>
                          <div className="text-sm text-muted-foreground">{new Date(sale.date).toLocaleDateString()}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant={sale.status === 'Paid' ? 'secondary' : 'destructive'} className="mr-2">{sale.status}</Badge>
                          KSH {sale.total.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
