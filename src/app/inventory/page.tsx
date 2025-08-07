"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { collection, addDoc, getDocs, doc, updateDoc, onSnapshot, DocumentData, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreHorizontal, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { Product } from "@/lib/data";
import { uploadImage } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { suggestCategory } from "@/ai/flows/suggest-category-flow";
import { generateProductImage } from "@/ai/flows/generate-product-image-flow";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, } from "@/components/ui/alert-dialog"

// Helper function to convert data URI to File
async function dataUriToFile(dataUrl: string, fileName: string): Promise<File> {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], fileName, { type: blob.type });
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuggestingCategory, setIsSuggestingCategory] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const { toast } = useToast();
  
  // State for the "Add Product" dialog
  const [newProductName, setNewProductName] = useState("");
  const [newProductBrand, setNewProductBrand] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [newProductCategory, setNewProductCategory] = useState("");
  const [newProductStock, setNewProductStock] = useState("");
  const [newProductUnit, setNewProductUnit] = useState("");
  const [newProductImage, setNewProductImage] = useState<File | null>(null);
  const [newProductImagePreview, setNewProductImagePreview] = useState<string | null>(null);
  const [generatedImageDataUri, setGeneratedImageDataUri] = useState<string | null>(null);
  
  // State for the "Edit Product" dialog
  const [editProductName, setEditProductName] = useState("");
  const [editProductBrand, setEditProductBrand] = useState("");
  const [editProductPrice, setEditProductPrice] = useState("");
  const [editProductCategory, setEditProductCategory] = useState("");
  const [editProductStock, setEditProductStock] = useState("");
  const [editProductUnit, setEditProductUnit] = useState("");
  const [editProductImage, setEditProductImage] = useState<File | null>(null);
  const [editProductImagePreview, setEditProductImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const productsCollection = collection(db, "products");
    const unsubscribe = onSnapshot(productsCollection, (snapshot) => {
        const productsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Product[];
        setProducts(productsData);
        setIsLoading(false);
    }, (error) => {
        console.error("Error fetching products:", error);
        toast({
            variant: "destructive",
            title: "Failed to load products",
            description: "Could not fetch product data from the database.",
        });
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);
  
  useEffect(() => {
    if (newProductName.length > 3) {
      const timer = setTimeout(async () => {
        setIsSuggestingCategory(true);
        try {
          const result = await suggestCategory({ productName: newProductName });
          if (result.category) {
            setNewProductCategory(result.category);
          }
        } catch (error) {
          console.error("Failed to suggest category:", error);
        } finally {
          setIsSuggestingCategory(false);
        }
      }, 500); // Debounce for 500ms
      return () => clearTimeout(timer);
    }
  }, [newProductName]);

  useEffect(() => {
    if (newProductName.length > 3 && newProductBrand.length > 2) {
      const timer = setTimeout(async () => {
        setIsGeneratingImage(true);
        try {
          const result = await generateProductImage({ productName: newProductName, brand: newProductBrand });
          if (result.imageUrl) {
            setNewProductImagePreview(result.imageUrl);
            setGeneratedImageDataUri(result.imageUrl);
          }
        } catch (error) {
          console.error("Failed to generate image:", error);
        } finally {
          setIsGeneratingImage(false);
        }
      }, 1000); // Debounce for 1s
      return () => clearTimeout(timer);
    }
  }, [newProductName, newProductBrand]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, isEditing: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      if (isEditing) {
        setEditProductImage(file);
        setEditProductImagePreview(URL.createObjectURL(file));
      } else {
        setNewProductImage(file);
        setNewProductImagePreview(URL.createObjectURL(file));
        setGeneratedImageDataUri(null); // Clear generated image if user uploads one
      }
    }
  };

  const resetAddForm = () => {
    setNewProductName("");
    setNewProductBrand("");
    setNewProductPrice("");
    setNewProductCategory("");
    setNewProductStock("");
    setNewProductUnit("");
    setNewProductImage(null);
    setNewProductImagePreview(null);
    setGeneratedImageDataUri(null);
    setIsAddDialogOpen(false);
  };

  const handleAddProduct = async () => {
    if (!newProductName || !newProductBrand || !newProductPrice || !newProductCategory || !newProductStock || !newProductUnit) {
        toast({
            variant: "destructive",
            title: "Missing Fields",
            description: "Please fill out all product details.",
        });
        return;
    }
    
    setIsUploading(true);
    let imageUrl = "https://placehold.co/300x300";
    let imageFileToUpload = newProductImage;

    // If there's a generated image and the user hasn't uploaded a different one, use the generated one.
    if (generatedImageDataUri && !newProductImage) {
        try {
            imageFileToUpload = await dataUriToFile(generatedImageDataUri, `${newProductName.replace(/\s+/g, '-')}.png`);
        } catch (error) {
             toast({
                variant: "destructive",
                title: "Image Processing Failed",
                description: "Could not process the generated image.",
            });
            setIsUploading(false);
            return;
        }
    }

    if (imageFileToUpload) {
        try {
            const formData = new FormData();
            formData.append("file", imageFileToUpload);
            const result = await uploadImage(formData);
            if (result.url) {
                imageUrl = result.url;
            } else {
                 throw new Error(result.error || "Image upload failed.");
            }
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Image Upload Failed",
                description: error.message || "Could not upload image. Please try again.",
            });
            setIsUploading(false);
            return;
        }
    }

    const newProductData = {
        name: newProductName,
        brand: newProductBrand,
        price: parseFloat(newProductPrice),
        category: newProductCategory,
        stock: parseInt(newProductStock, 10),
        unit: newProductUnit,
        image: imageUrl,
        hint: `${newProductName.toLowerCase()} ${newProductBrand.toLowerCase()}`,
    };
    
    try {
        await addDoc(collection(db, "products"), newProductData);
        toast({
            title: "Product Added",
            description: `${newProductName} has been added to the inventory.`,
        });
        resetAddForm();
    } catch (error) {
        console.error("Error adding product:", error);
        toast({
            variant: "destructive",
            title: "Save Failed",
            description: "Could not save the new product to the database.",
        });
    } finally {
        setIsUploading(false);
    }
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setEditProductName(product.name);
    setEditProductBrand(product.brand);
    setEditProductPrice(product.price.toString());
    setEditProductCategory(product.category);
    setEditProductStock(product.stock.toString());
    setEditProductUnit(product.unit);
    setEditProductImage(null);
    setEditProductImagePreview(product.image);
    setIsEditDialogOpen(true);
  };
  
  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    setIsUploading(true);
    let imageUrl = editingProduct.image;

    if (editProductImage) {
      try {
        const formData = new FormData();
        formData.append("file", editProductImage);
        const result = await uploadImage(formData);
        if (result.url) {
          imageUrl = result.url;
        } else {
          throw new Error(result.error || "Image upload failed.");
        }
      } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Image Upload Failed",
            description: error.message || "Could not upload image. Please try again.",
        });
        setIsUploading(false);
        return;
      }
    }

    const updatedProductData = {
      name: editProductName,
      brand: editProductBrand,
      price: parseFloat(editProductPrice),
      category: editProductCategory,
      stock: parseInt(editProductStock, 10),
      unit: editProductUnit,
      image: imageUrl,
      hint: `${editProductName.toLowerCase()} ${editProductBrand.toLowerCase()}`,
    };

    try {
        const productRef = doc(db, "products", editingProduct.id);
        await updateDoc(productRef, updatedProductData);
        toast({
            title: "Product Updated",
            description: "The product details have been saved.",
        });
        setEditingProduct(null);
        setIsEditDialogOpen(false);
    } catch (error) {
         console.error("Error updating product:", error);
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: "Could not save the product changes.",
        });
    } finally {
        setIsUploading(false);
    }
  };
  
  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteDoc(doc(db, "products", productId));
      toast({
        title: "Product Deleted",
        description: "The product has been removed from the inventory.",
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "Could not delete the product.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="space-y-1">
          <h1 className="font-headline text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">Manage your stock and inventory here.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
                 <Label className="text-right">Image</Label>
                 <div className="col-span-3">
                   <Input id="image" type="file" className="hidden" onChange={(e) => handleImageChange(e, false)} accept="image/*"/>
                   <Label htmlFor="image" className="cursor-pointer">
                        <div className="w-full aspect-video rounded-md border-2 border-dashed border-muted-foreground/50 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 relative">
                           {newProductImagePreview ? (
                                <Image src={newProductImagePreview} alt="Product preview" width={150} height={84} className="object-cover rounded-md"/>
                           ) : (
                                <>
                                 <ImagePlus className="h-10 w-10 mb-2"/>
                                 <p>Upload Image</p>
                                </>
                           )}
                           {isGeneratingImage && (
                                <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                                    <p className="text-sm text-muted-foreground mt-2">Generating Image...</p>
                                </div>
                            )}
                        </div>
                   </Label>
                 </div>
              </div>
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
                 <div className="relative col-span-3">
                  <Input id="category" value={newProductCategory} onChange={(e) => setNewProductCategory(e.target.value)} placeholder="e.g. Grains" />
                  {isSuggestingCategory && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />}
                </div>
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
              <Button type="button" variant="outline" onClick={resetAddForm}>Cancel</Button>
              <Button type="submit" onClick={handleAddProduct} disabled={isUploading || isGeneratingImage}>
                {(isUploading || isGeneratingImage) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Product
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update the details of the product.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                 <Label className="text-right">Image</Label>
                 <div className="col-span-3">
                   <Input id="edit-image" type="file" className="hidden" onChange={(e) => handleImageChange(e, true)} accept="image/*"/>
                   <Label htmlFor="edit-image" className="cursor-pointer">
                        <div className="w-full aspect-video rounded-md border-2 border-dashed border-muted-foreground/50 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50">
                           {editProductImagePreview ? (
                                <Image src={editProductImagePreview} alt="Product preview" width={150} height={84} className="object-cover rounded-md"/>
                           ) : (
                                <>
                                 <ImagePlus className="h-10 w-10 mb-2"/>
                                 <p>Upload Image</p>
                                </>
                           )}
                        </div>
                   </Label>
                 </div>
              </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">Name</Label>
              <Input id="edit-name" value={editProductName} onChange={(e) => setEditProductName(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-brand" className="text-right">Brand</Label>
              <Input id="edit-brand" value={editProductBrand} onChange={(e) => setEditProductBrand(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-price" className="text-right">Price (KSH)</Label>
              <Input id="edit-price" type="number" value={editProductPrice} onChange={(e) => setEditProductPrice(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-category" className="text-right">Category</Label>
              <Input id="edit-category" value={editProductCategory} onChange={(e) => setEditProductCategory(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-stock" className="text-right">Stock</Label>
              <Input id="edit-stock" type="number" value={editProductStock} onChange={(e) => setEditProductStock(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-unit" className="text-right">Unit</Label>
              <Input id="edit-unit" value={editProductUnit} onChange={(e) => setEditProductUnit(e.target.value)} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
             <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button type="submit" onClick={handleUpdateProduct} disabled={isUploading}>
              {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>A list of all products in your inventory.</CardDescription>
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
                      <Image
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
                          <DropdownMenuItem onClick={() => openEditDialog(product)}>Edit</DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                                <span className="text-destructive">Delete</span>
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the product
                                  from your inventory.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteProduct(product.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
