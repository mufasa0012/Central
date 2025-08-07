"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreHorizontal } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { products as initialProducts } from "@/lib/data";

type Product = typeof initialProducts[0];

export default function InventoryPage() {
  const [products, setProducts] = useState(initialProducts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [newProductBrand, setNewProductBrand] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [newProductCategory, setNewProductCategory] = useState("");
  const [newProductStock, setNewProductStock] = useState("");
  const [newProductUnit, setNewProductUnit] = useState("");


  const handleAddProduct = () => {
    if (newProductName && newProductBrand && newProductPrice && newProductCategory && newProductStock && newProductUnit) {
      const newProduct = {
        id: products.length + 1,
        name: newProductName,
        brand: newProductBrand,
        price: parseFloat(newProductPrice),
        category: newProductCategory,
        stock: parseInt(newProductStock, 10),
        unit: newProductUnit,
        image: "https://placehold.co/300x300",
        hint: `${newProductName.toLowerCase()} ${newProductBrand.toLowerCase()}`,
      };
      setProducts([...products, newProduct]);
      setNewProductName("");
      setNewProductBrand("");
      setNewProductPrice("");
      setNewProductCategory("");
      setNewProductStock("");
      setNewProductUnit("");
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="space-y-1">
          <h1 className="font-headline text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">Manage your stock and inventory here.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Enter the details of the new product to add it to the inventory.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" value={newProductName} onChange={(e) => setNewProductName(e.target.value)} className="col-span-3" placeholder="e.g. Maize Flour" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="brand" className="text-right">Brand</Label>
                <Input id="brand" value={newProductBrand} onChange={(e) => setNewProductBrand(e.target.value)} className="col-span-3" placeholder="e.g. Soko" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">Price (KSH)</Label>
                <Input id="price" type="number" value={newProductPrice} onChange={(e) => setNewProductPrice(e.target.value)} className="col-span-3" placeholder="e.g. 210" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">Category</Label>
                <Input id="category" value={newProductCategory} onChange={(e) => setNewProductCategory(e.target.value)} className="col-span-3" placeholder="e.g. Grains" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="stock" className="text-right">Stock</Label>
                <Input id="stock" type="number" value={newProductStock} onChange={(e) => setNewProductStock(e.target.value)} className="col-span-3" placeholder="e.g. 100" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="unit" className="text-right">Unit</Label>
                <Input id="unit" value={newProductUnit} onChange={(e) => setNewProductUnit(e.target.value)} className="col-span-3" placeholder="e.g. 2kg, 1 Litre, piece" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleAddProduct}>Save Product</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>A list of all products in your inventory.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden w-[100px] sm:table-cell">
                    <span className="sr-only">Image</span>
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead className="hidden md:table-cell">Stock</TableHead>
                  <TableHead className="hidden md:table-cell">Unit</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="hidden sm:table-cell">
                      <img
                        alt={product.name}
                        className="aspect-square rounded-md object-cover"
                        height="64"
                        src={product.image}
                        width="64"
                        data-ai-hint={product.hint}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="font-medium">{product.brand}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline">{product.category}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{product.stock}</TableCell>
                    <TableCell className="hidden md:table-cell">{product.unit}</TableCell>
                    <TableCell className="text-right">KSH {product.price.toFixed(2)}</TableCell>
                     <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
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
