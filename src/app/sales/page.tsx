
"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import type { Sale } from "@/lib/data";

export default function SalesPage() {
    const [sales, setSales] = useState<Sale[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const salesQuery = query(collection(db, "sales"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(salesQuery, (snapshot) => {
            const salesData = snapshot.docs.map(doc => {
                 const data = doc.data();
                 return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate() // Convert Timestamp to Date
                 } as Sale
            });
            setSales(salesData);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

  const getStatusVariant = (status: string) => {
    switch (status) {
        case 'Paid':
            return 'secondary';
        case 'Unpaid':
            return 'destructive';
        case 'Refunded':
            return 'outline';
        default:
            return 'default';
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Sales History</h1>
        <p className="text-muted-foreground">View all past transactions.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Sales</CardTitle>
          <CardDescription>A log of all completed sales transactions.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </div>
          ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sale ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead className="hidden sm:table-cell">Payment Method</TableHead>
                  <TableHead className="hidden sm:table-cell text-center">Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium truncate max-w-[100px]">{sale.id}</TableCell>
                    <TableCell>{sale.customer.name}</TableCell>
                    <TableCell className="hidden sm:table-cell">{sale.createdAt?.toLocaleString()}</TableCell>
                    <TableCell className="hidden sm:table-cell">{sale.paymentMethod}</TableCell>
                    <TableCell className="hidden sm:table-cell text-center">
                       <Badge variant={getStatusVariant(sale.status)}>{sale.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">KSH {sale.total.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
