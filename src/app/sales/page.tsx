
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const salesData = [
  { id: "SALE001", customer: "John Doe", date: "2024-07-28", total: 4550.00, status: "Paid" },
  { id: "SALE002", customer: "Jane Smith", date: "2024-07-28", total: 12000.00, status: "Paid" },
  { id: "SALE003", customer: "Walk-in", date: "2024-07-27", total: 1575.00, status: "Paid" },
  { id: "SALE004", customer: "Robert Brown", date: "2024-07-27", total: 8820.00, status: "Refunded" },
  { id: "SALE005", customer: "Walk-in", date: "2024-07-26", total: 3210.00, status: "Paid" },
];

export default function SalesPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Sales History</h1>
        <p className="text-muted-foreground">View all past transactions.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Sales</CardTitle>
          <CardDescription>A log of all completed sales transactions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sale ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead className="hidden sm:table-cell text-center">Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesData.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">{sale.id}</TableCell>
                    <TableCell>{sale.customer}</TableCell>
                    <TableCell className="hidden sm:table-cell">{sale.date}</TableCell>
                    <TableCell className="hidden sm:table-cell text-center">
                       <Badge variant={sale.status === 'Paid' ? 'secondary' : 'destructive'}>{sale.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">KSH {sale.total.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
