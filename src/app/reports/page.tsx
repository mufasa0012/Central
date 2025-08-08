
"use client";

import { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Product, Sale, SaleItem } from "@/lib/data";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { DollarSign, Package, ShoppingCart, Loader2, TrendingUp, PackageX } from 'lucide-react';
import Image from 'next/image';


const formatDateForChart = (date: Date) => {
    // Split the date to avoid timezone issues between server and client
    const [year, month, day] = date.toISOString().split('T')[0].split('-');
    const utcDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
    return utcDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}


export default function ReportsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const productsCollection = collection(db, "products");
    const unsubscribeProducts = onSnapshot(productsCollection, (snapshot) => {
        const productsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Product[];
        setProducts(productsData);
    });

    const salesQuery = query(collection(db, "sales"), orderBy("createdAt", "desc"));
    const unsubscribeSales = onSnapshot(salesQuery, (snapshot) => {
        const salesData = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate() // Convert Firestore Timestamp to JS Date
            } as Sale;
        });
        setSales(salesData);
        setIsLoading(false);
    });

    return () => {
        unsubscribeProducts();
        unsubscribeSales();
    };
  }, []);

  const { totalRevenue, totalSales, recentSales } = useMemo(() => {
    const paidSales = sales.filter(sale => sale.status === 'Paid');
    const revenue = paidSales.reduce((acc, sale) => acc + sale.total, 0);
    return {
        totalRevenue: revenue,
        totalSales: paidSales.length,
        recentSales: sales.slice(0, 5) // Use the full sorted sales list
    };
  }, [sales]);

  const chartData = useMemo(() => {
    const dailySales: {[key: string]: number} = {};
    sales.forEach(sale => {
      if (sale.status === 'Paid' && sale.createdAt) {
        const chartDate = formatDateForChart(sale.createdAt);
        if (!dailySales[chartDate]) {
          dailySales[chartDate] = 0;
        }
        dailySales[chartDate] += sale.total;
      }
    });
    // Sort dates chronologically for the chart
    return Object.keys(dailySales).map(date => ({
      date,
      total: dailySales[date]
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [sales]);

  const topSellingProducts = useMemo(() => {
    const productSales: { [key: string]: { name: string; brand: string; quantity: number, image: string } } = {};

    sales.forEach(sale => {
        sale.items.forEach(item => {
            if (!productSales[item.productId]) {
                const product = products.find(p => p.id === item.productId);
                productSales[item.productId] = { 
                    name: item.name, 
                    brand: item.brand, 
                    quantity: 0,
                    image: product?.image || 'https://placehold.co/64x64'
                };
            }
            productSales[item.productId].quantity += item.quantity;
        });
    });

    return Object.values(productSales)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);
  }, [sales, products]);

  const outOfStockProducts = useMemo(() => {
      return products.filter(product => product.stock <= 0).slice(0, 5);
  }, [products]);


  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Reports Dashboard</h1>
        <p className="text-muted-foreground">An overview of your business performance.</p>
      </div>
      
       {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
      <>
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
                    {recentSales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>
                          <div className="font-medium">{sale.customer.name}</div>
                          <div className="text-sm text-muted-foreground">{sale.createdAt?.toLocaleDateString('en-CA')}</div>
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

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Selling Products</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableBody>
                        {topSellingProducts.map((product, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    <Image src={product.image} alt={product.name} width={40} height={40} className="rounded-md" />
                                </TableCell>
                                <TableCell>
                                    <p className="font-medium">{product.name}</p>
                                    <p className="text-xs text-muted-foreground">{product.brand}</p>
                                </TableCell>
                                <TableCell className="text-right">
                                    <p className="font-bold">{product.quantity}</p>
                                    <p className="text-xs text-muted-foreground">units sold</p>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                 </Table>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Products Out of Stock</CardTitle>
                <PackageX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableBody>
                         {outOfStockProducts.length > 0 ? outOfStockProducts.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell>
                                     <Image src={product.image} alt={product.name} width={40} height={40} className="rounded-md" />
                                </TableCell>
                                <TableCell>
                                    <p className="font-medium">{product.name}</p>
                                    <p className="text-xs text-muted-foreground">{product.brand}</p>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Badge variant="destructive">Out of Stock</Badge>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center text-muted-foreground">
                                    All products are in stock.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                 </Table>
            </CardContent>
        </Card>
      </div>

      </>
      )}
    </div>
  );
}

