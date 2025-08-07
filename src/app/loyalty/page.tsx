"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const initialLoyaltyMembers = [
  { id: "CUST001", name: "John Doe", email: "john.doe@example.com", points: 1250 },
  { id: "CUST002", name: "Jane Smith", email: "jane.smith@example.com", points: 850 },
  { id: "CUST003", name: "Alice Johnson", email: "alice.j@example.com", points: 2400 },
  { id: "CUST004", name: "Robert Brown", email: "robert.brown@example.com", points: 450 },
  { id: "CUST005", name: "Emily Davis", email: "emily.d@example.com", points: 3000 },
];

export default function LoyaltyPage() {
  const [loyaltyMembers, setLoyaltyMembers] = useState(initialLoyaltyMembers);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddMember = () => {
    if (newMemberName && newMemberEmail) {
      const newId = `CUST${(loyaltyMembers.length + 1).toString().padStart(3, '0')}`;
      const newMember = {
        id: newId,
        name: newMemberName,
        email: newMemberEmail,
        points: 0,
      };
      setLoyaltyMembers([...loyaltyMembers, newMember]);
      setNewMemberName("");
      setNewMemberEmail("");
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="font-headline text-3xl font-bold tracking-tight">Loyalty Program</h1>
          <p className="text-muted-foreground">Manage your customer loyalty program here.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Loyalty Member</DialogTitle>
              <DialogDescription>
                Enter the details of the new member to enroll them in the loyalty program.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g. john.doe@example.com"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleAddMember}>Save Member</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
