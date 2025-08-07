import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const loyaltyMembers = [
  { id: "CUST001", name: "John Doe", email: "john.doe@example.com", points: 1250 },
  { id: "CUST002", name: "Jane Smith", email: "jane.smith@example.com", points: 850 },
  { id: "CUST003", name: "Alice Johnson", email: "alice.j@example.com", points: 2400 },
  { id: "CUST004", name: "Robert Brown", email: "robert.brown@example.com", points: 450 },
  { id: "CUST005", name: "Emily Davis", email: "emily.d@example.com", points: 3000 },
];

export default function LoyaltyPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="font-headline text-3xl font-bold tracking-tight">Loyalty Program</h1>
          <p className="text-muted-foreground">Manage your customer loyalty program here.</p>
        </div>
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Member
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Loyalty Members</CardTitle>
          <CardDescription>A list of customers enrolled in the loyalty program.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Loyalty Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loyaltyMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.id}</TableCell>
                  <TableCell>{member.name}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary">{member.points.toLocaleString()}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
