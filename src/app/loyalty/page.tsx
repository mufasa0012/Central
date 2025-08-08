
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import type { LoyaltyMember } from "@/lib/data";
import { collection, addDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

export default function LoyaltyPage() {
  const [loyaltyMembers, setLoyaltyMembers] = useState<LoyaltyMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberPhone, setNewMemberPhone] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = onSnapshot(collection(db, "loyaltyMembers"), (snapshot) => {
      const members = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as LoyaltyMember[];
      setLoyaltyMembers(members);
      setIsLoading(false);
    }, (error) => {
        console.error("Error fetching loyalty members:", error);
        toast({
            variant: "destructive",
            title: "Failed to load members",
            description: "Could not fetch loyalty member data from the database.",
        });
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const resetForm = () => {
      setNewMemberName("");
      setNewMemberEmail("");
      setNewMemberPhone("");
  }

  const handleAddMember = async () => {
    if (!newMemberName || !newMemberPhone) {
        toast({
            variant: "destructive",
            title: "Missing Fields",
            description: "Please enter the member's name and phone number.",
        });
        return;
    }
    
    setIsSaving(true);
    try {
      const newMember = {
        name: newMemberName,
        email: newMemberEmail,
        phone: newMemberPhone,
        points: 0,
        debt: 0,
      };
      await addDoc(collection(db, "loyaltyMembers"), newMember);
      toast({
        title: "Member Added",
        description: `${newMemberName} has been added to the loyalty program.`,
      });
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
        console.error("Error adding loyalty member:", error);
        toast({
            variant: "destructive",
            title: "Save Failed",
            description: "Could not add the new loyalty member.",
        });
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
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
          <DialogContent className="sm:max-w-md">
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
                <Label htmlFor="phone" className="text-right">
                  Phone
                </Label>
                <Input
                  id="phone"
                  value={newMemberPhone}
                  onChange={(e) => setNewMemberPhone(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g. 0712345678"
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
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" onClick={handleAddMember} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                Save Member
              </Button>
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
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </div>
          ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Phone</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead className="text-right">Loyalty Points</TableHead>
                  <TableHead className="text-right">Debt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loyaltyMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.id}</TableCell>
                    <TableCell>{member.name}</TableCell>
                    <TableCell className="hidden sm:table-cell">{member.phone}</TableCell>
                    <TableCell className="hidden sm:table-cell">{member.email}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary">{(member.points || 0).toLocaleString()}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={member.debt > 0 ? "destructive" : "outline"}>
                        KSH {(member.debt || 0).toFixed(2)}
                      </Badge>
                    </TableCell>
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
