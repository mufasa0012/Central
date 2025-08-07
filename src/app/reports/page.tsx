import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">View your sales and inventory reports here.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Advanced Reporting</CardTitle>
          <CardDescription>Coming soon...</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Detailed reports on sales, products, and profits will be available.</p>
        </CardContent>
      </Card>
    </div>
  );
}
