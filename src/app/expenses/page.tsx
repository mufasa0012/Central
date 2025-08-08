
"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2, Calendar as CalendarIcon } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { Expense } from "@/lib/data";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Form state
  const [expenseName, setExpenseName] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState<Date>();

  useEffect(() => {
    const expensesQuery = query(collection(db, "expenses"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(expensesQuery, (snapshot) => {
      const expensesData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: (data.date as Timestamp).toDate() // Convert Firestore Timestamp to JS Date
        } as Expense;
      });
      setExpenses(expensesData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching expenses:", error);
      toast({
        variant: "destructive",
        title: "Failed to load expenses",
        description: "Could not fetch expense data from the database.",
      });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const resetForm = () => {
    setExpenseName("");
    setExpenseCategory("");
    setExpenseAmount("");
    setExpenseDate(undefined);
  };

  const handleAddExpense = async () => {
    if (!expenseName || !expenseCategory || !expenseAmount || !expenseDate) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please fill out all expense details.",
      });
      return;
    }
    
    setIsSaving(true);
    try {
      const newExpense = {
        name: expenseName,
        category: expenseCategory,
        amount: parseFloat(expenseAmount),
        date: expenseDate,
      };
      await addDoc(collection(db, "expenses"), newExpense);
      toast({
        title: "Expense Added",
        description: `${expenseName} has been added to your expenses.`,
      });
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error adding expense:", error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Could not add the new expense.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="font-headline text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">Track your business expenses here.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Expense</DialogTitle>
              <DialogDescription>
                Enter the details of the expense to add it to your records.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" value={expenseName} onChange={(e) => setExpenseName(e.target.value)} className="col-span-3" placeholder="e.g. Rent, Salaries, Electricity Bill"/>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">Category</Label>
                <Input id="category" value={expenseCategory} onChange={(e) => setExpenseCategory(e.target.value)} className="col-span-3" placeholder="e.g. Utilities, Payroll, Rent"/>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">Amount (KSH)</Label>
                <Input id="amount" type="number" value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} className="col-span-3" placeholder="e.g. 15000"/>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "col-span-3 justify-start text-left font-normal",
                        !expenseDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {expenseDate ? format(expenseDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={expenseDate}
                      onSelect={setExpenseDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" onClick={handleAddExpense} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                Save Expense
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Expense History</CardTitle>
          <CardDescription>A list of all recorded business expenses.</CardDescription>
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
                  <TableHead>Date</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{format(expense.date, "PPP")}</TableCell>
                    <TableCell className="font-medium">{expense.name}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell className="text-right">KSH {expense.amount.toFixed(2)}</TableCell>
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
