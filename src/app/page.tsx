"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScanLine, Search, PlusCircle, MinusCircle, Trash2, X, CreditCard, Landmark, Smartphone, UserPlus, Award, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/data";
import { loyaltyMembers as initialLoyaltyMembers } from "@/lib/data";

const loyaltyMembers = initialLoyaltyMembers;

type CartItem = Product & { quantity: number };
type LoyaltyCustomer = typeof loyaltyMembers[0];

export default function CashierPOSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [activeCustomer, setActiveCustomer] = useState<LoyaltyCustomer | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const productsCollection = collection(db, "products");
    const unsubscribe = onSnapshot(productsCollection, (snapshot) => {
      const productsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Product[];
      setProducts(productsData);
      setIsLoadingProducts(false);
    }, (error) => {
      console.error("Error fetching products:", error);
      toast({
        variant: "destructive",
        title: "Failed to load products",
        description: "Could not fetch product data from the database.",
      });
      setIsLoadingProducts(false);
    });
    return () => unsubscribe();
  }, [toast]);
  

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };
  
  const clearCart = () => {
    setCart([]);
    setActiveCustomer(null);
  }

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toString().includes(searchTerm)
    );
  }, [searchTerm, products]);

  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return loyaltyMembers;
    return loyaltyMembers.filter(
      (c) =>
        c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
        c.id.toLowerCase().includes(customerSearch.toLowerCase())
    );
  }, [customerSearch]);

  const { subtotal, tax, total } = useMemo(() => {
    const subtotalValue = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const taxValue = subtotalValue * 0.08; // 8% tax
    const totalValue = subtotalValue + taxValue;
    return { subtotal: subtotalValue, tax: taxValue, total: totalValue };
  }, [cart]);

  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="font-headline text-3xl font-bold tracking-tight">Cashier POS</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Scan barcode or search products..."
                  className="pl-10 h-12 text-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <ScanLine className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          {isLoadingProducts ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="relative aspect-square bg-muted animate-pulse" />
                  <div className="p-3 bg-card">
                    <div className="space-y-2">
                       <div className="h-4 bg-muted animate-pulse rounded-md" />
                       <div className="h-3 w-1/2 bg-muted animate-pulse rounded-md" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <Card 
                  key={product.id} 
                  className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200 group"
                  onClick={() => addToCart(product)}
                >
                  <div className="relative aspect-square">
                     <Image src={product.image} alt={product.name} fill className="object-cover" data-ai-hint={product.hint} />
                     <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center">
                        <PlusCircle className="h-10 w-10 text-white/70 group-hover:text-white transform group-hover:scale-110 transition-transform duration-200" />
                     </div>
                  </div>
                  <div className="p-3 bg-card">
                    <p className="font-semibold truncate">{product.name} <span className="text-sm text-muted-foreground">({product.brand})</span></p>
                    <p className="text-sm text-muted-foreground">KSH {product.price.toFixed(2)}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-8 shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-2xl flex justify-between items-center">
                Current Sale
                {cart.length > 0 && (
                  <Button variant="ghost" size="icon" onClick={clearCart} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-5 w-5" />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
                {activeCustomer ? (
                  <div className="bg-accent/20 border border-accent/50 rounded-lg p-3 mb-4 text-sm">
                    <div className="flex justify-between items-center">
                       <p className="font-semibold text-accent-foreground">{activeCustomer.name}</p>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setActiveCustomer(null)}>
                           <X className="h-4 w-4 text-muted-foreground"/>
                        </Button>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Award className="h-4 w-4 text-accent" />
                      <span>{activeCustomer.points.toLocaleString()} points</span>
                    </div>
                  </div>
                ) : (
                <Dialog>
                    <DialogTrigger asChild>
                       <Button variant="outline" className="w-full mb-4">
                        <UserPlus className="mr-2 h-4 w-4"/>
                        Add Loyalty Customer
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Find Loyalty Member</DialogTitle>
                      </DialogHeader>
                      <div className="relative mt-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                          placeholder="Search by name or ID..." 
                          className="pl-10"
                          value={customerSearch}
                          onChange={(e) => setCustomerSearch(e.target.value)}
                        />
                      </div>
                      <ScrollArea className="h-[200px] mt-4">
                        <div className="space-y-2">
                        {filteredCustomers.map(customer => (
                          <DialogClose asChild key={customer.id}>
                            <Button variant="ghost" className="w-full justify-start h-auto" onClick={() => setActiveCustomer(customer)}>
                                <div>
                                  <p>{customer.name}</p>
                                  <p className="text-xs text-muted-foreground">{customer.id}</p>
                                </div>
                            </Button>
                          </DialogClose>
                        ))}
                        </div>
                      </ScrollArea>
                    </DialogContent>
                </Dialog>
                )}
              <ScrollArea className="h-[250px] md:h-[300px] pr-4">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <p>Your cart is empty</p>
                    <p className="text-xs">Add products to get started</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <Image src={item.image} alt={item.name} width={48} height={48} className="rounded-md" data-ai-hint={item.hint}/>
                        <div className="flex-grow overflow-hidden">
                          <p className="font-medium truncate text-sm">{item.name} <span className="text-xs text-muted-foreground">({item.brand})</span></p>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                              <MinusCircle className="h-4 w-4" />
                            </Button>
                            <span className="text-sm">{item.quantity}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                              <PlusCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="font-semibold text-sm">KSH {(item.price * item.quantity).toFixed(2)}</p>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-7 w-7" onClick={() => removeFromCart(item.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              {cart.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <p>Subtotal</p>
                      <p className="font-medium">KSH {subtotal.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between">
                      <p>Tax (8%)</p>
                      <p className="font-medium">KSH {tax.toFixed(2)}</p>
                    </div>
                     <div className="flex justify-between text-muted-foreground">
                      <p>Discount</p>
                      <p className="font-medium">-KSH 0.00</p>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between text-lg font-bold">
                      <p>Total</p>
                      <p>KSH {total.toFixed(2)}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
            {cart.length > 0 && (
            <CardFooter>
              <Dialog onOpenChange={(open) => !open && cart.length === 0}>
                <DialogTrigger asChild>
                  <Button size="lg" className="w-full text-lg">
                    Charge KSH {total.toFixed(2)}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-sm">
                  <DialogHeader>
                    <DialogTitle className="font-headline text-2xl">Complete Payment</DialogTitle>
                  </DialogHeader>
                  <Tabs defaultValue="cash" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="cash"><Landmark className="mr-2 h-4 w-4"/>Cash</TabsTrigger>
                      <TabsTrigger value="card"><CreditCard className="mr-2 h-4 w-4"/>Card</TabsTrigger>
                      <TabsTrigger value="mpesa"><Smartphone className="mr-2 h-4 w-4"/>M-Pesa</TabsTrigger>
                    </TabsList>
                    <div className="py-4 text-center text-4xl font-bold tracking-tight">KSH {total.toFixed(2)}</div>
                    <TabsContent value="cash">
                      <div className="space-y-4">
                        <p className="text-center text-muted-foreground">Customer pays with cash.</p>
                         <DialogClose asChild>
                           <Button className="w-full" size="lg" onClick={() => {
                            toast({ title: "Success", description: "Payment completed."});
                            clearCart();
                           }}>Confirm Payment</Button>
                         </DialogClose>
                      </div>
                    </TabsContent>
                     <TabsContent value="card">
                       <div className="space-y-4">
                        <p className="text-center text-muted-foreground">Waiting for card terminal...</p>
                         <DialogClose asChild>
                           <Button className="w-full" size="lg" onClick={() => {
                            toast({ title: "Success", description: "Payment completed."});
                            clearCart();
                           }}>Confirm Payment</Button>
                         </DialogClose>
                      </div>
                    </TabsContent>
                     <TabsContent value="mpesa">
                       <div className="space-y-4">
                        <p className="text-center text-muted-foreground">Send payment request to customer's phone.</p>
                         <DialogClose asChild>
                           <Button className="w-full" size="lg" onClick={() => {
                            toast({ title: "Success", description: "Payment completed."});
                            clearCart();
                           }}>Confirm Payment</Button>
                         </DialogClose>
                      </div>
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
            </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
