import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Inventory</h1>
        <p className="text-muted-foreground">Manage your stock and inventory here.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Inventory Management</CardTitle>
          <CardDescription>Coming soon...</CardDescription>
        </CardHeader>
        <CardContent>
          <p>A full-featured inventory management system will be available here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
