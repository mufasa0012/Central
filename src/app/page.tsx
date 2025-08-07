
"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { collection, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, runTransaction } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScanLine, Search, PlusCircle, MinusCircle, Trash2, X, CreditCard, Landmark, Smartphone, UserPlus, Award, Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import type { Product, LoyaltyMember } from "@/lib/data";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


type CartItem = Product & { quantity: number; useWholesale: boolean };

export default function CashierPOSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loyaltyMembers, setLoyaltyMembers] = useState<LoyaltyMember[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [activeCustomer, setActiveCustomer] = useState<LoyaltyMember | null>(null);
  const [cashGiven, setCashGiven] = useState("");
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const productsCollection = collection(db, "products");
    const unsubscribeProducts = onSnapshot(productsCollection, (snapshot) => {
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

    const loyaltyCollection = collection(db, "loyaltyMembers");
    const unsubscribeLoyalty = onSnapshot(loyaltyCollection, (snapshot) => {
      const loyaltyData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as LoyaltyMember[];
      setLoyaltyMembers(loyaltyData);
    });


    return () => {
        unsubscribeProducts();
        unsubscribeLoyalty();
    };
  }, [toast]);
  

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        if(existingItem.quantity >= product.stock) {
            toast({
                variant: "destructive",
                title: "Stock limit reached",
                description: `Cannot add more ${product.name} to the cart.`,
            });
            return prevCart;
        }
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
        if(product.stock < 1) {
            toast({
                variant: "destructive",
                title: "Out of stock",
                description: `${product.name} is currently out of stock.`,
            });
            return prevCart;
        }
      return [...prevCart, { ...product, quantity: 1, useWholesale: false }];
    });
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
     const productInCart = cart.find(item => item.id === productId);
     if (productInCart && newQuantity > productInCart.stock) {
        toast({
            variant: "destructive",
            title: "Stock limit reached",
            description: `Only ${productInCart.stock} units of ${productInCart.name} available.`,
        });
        return;
     }

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
  
  const togglePrice = (productId: string) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, useWholesale: !item.useWholesale } : item
      )
    );
  };
  
  const clearCart = () => {
    setCart([]);
    setActiveCustomer(null);
    setCashGiven("");
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
  }, [customerSearch, loyaltyMembers]);

  const { subtotal, total } = useMemo(() => {
    const subtotalValue = cart.reduce((acc, item) => {
        const price = item.useWholesale && item.wholesalePrice ? item.wholesalePrice : item.price;
        return acc + price * item.quantity;
    }, 0);
    const totalValue = subtotalValue;
    return { subtotal: subtotalValue, total: totalValue };
  }, [cart]);
  
  const change = useMemo(() => {
    const cash = parseFloat(cashGiven);
    if (!cash || cash < total) return 0;
    return cash - total;
  }, [cashGiven, total]);

  useEffect(() => {
    if(!isPaymentDialogOpen) {
      // Keep cashGiven when dialog is closed to show change on main screen
    }
  }, [isPaymentDialogOpen]);

  const handleCompletePayment = async (paymentMethod: 'Cash' | 'Card' | 'M-Pesa') => {
    setIsLoading(true);
    try {
        // Use a transaction to ensure atomic updates
        await runTransaction(db, async (transaction) => {
            const saleItems = cart.map(item => {
                const price = item.useWholesale && item.wholesalePrice ? item.wholesalePrice : item.price;
                return {
                    productId: item.id,
                    name: item.name,
                    brand: item.brand,
                    quantity: item.quantity,
                    price: price,
                    total: price * item.quantity
                }
            });

            // 1. Decrement stock for each product
            for (const item of cart) {
                const productRef = doc(db, "products", item.id);
                const productDoc = await transaction.get(productRef);
                if (!productDoc.exists()) {
                    throw new Error(`Product ${item.name} not found.`);
                }
                const newStock = productDoc.data().stock - item.quantity;
                if (newStock < 0) {
                    throw new Error(`Not enough stock for ${item.name}.`);
                }
                transaction.update(productRef, { stock: newStock });
            }
            
            // 2. Add loyalty points if a customer is selected
            let newPoints = 0;
            if (activeCustomer) {
                const loyaltyRef = doc(db, "loyaltyMembers", activeCustomer.id);
                const loyaltyDoc = await transaction.get(loyaltyRef);
                 if (!loyaltyDoc.exists()) {
                    throw new Error(`Loyalty member ${activeCustomer.name} not found.`);
                }
                // Award 1 point for every KSH 100 spent
                const pointsEarned = Math.floor(total / 100);
                newPoints = loyaltyDoc.data().points + pointsEarned;
                transaction.update(loyaltyRef, { points: newPoints });
            }

            // 3. Create a new sale record
            const salesCollection = collection(db, "sales");
            transaction.set(doc(salesCollection), {
                items: saleItems,
                subtotal,
                total,
                paymentMethod,
                status: 'Paid',
                customer: activeCustomer ? { id: activeCustomer.id, name: activeCustomer.name } : { id: 'Walk-in', name: 'Walk-in' },
                createdAt: serverTimestamp()
            });
        });

        toast({ title: "Success", description: "Payment completed." });
        clearCart();
        setIsPaymentDialogOpen(false);

    } catch (error: any) {
        console.error("Payment failed:", error);
        toast({
            variant: "destructive",
            title: "Payment Failed",
            description: error.message || "An unexpected error occurred."
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start h-full">
        {/* Products Section */}
        <div className="lg:col-span-2 flex flex-col gap-6 h-full order-last md:order-first">
          <div className="flex-1 flex flex-col gap-6 min-h-0">
            <h1 className="font-headline text-3xl font-bold tracking-tight">Cashier POS</h1>
            <Card>
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

            <div className="flex-1 min-h-0">
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
                <ScrollArea className="h-full">
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pr-4">
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
                </ScrollArea>
              )}
            </div>
          </div>
        </div>

        {/* Cart Section */}
        <div className="lg:col-span-1 h-full flex flex-col order-first md:order-last">
          <Card className="shadow-lg flex-1 flex flex-col">
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
            <CardContent className="flex-1 flex flex-col gap-4">
                {activeCustomer ? (
                  <div className="bg-accent/20 border border-accent/50 rounded-lg p-3 text-sm">
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
                       <Button variant="outline" className="w-full">
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
              <ScrollArea className="flex-grow h-0 pr-4 -mr-4">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <p>Your cart is empty</p>
                    <p className="text-xs">Add products to get started</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                   <TooltipProvider>
                    {cart.map((item) => {
                      const price = item.useWholesale && item.wholesalePrice ? item.wholesalePrice : item.price;
                      const hasWholesale = item.wholesalePrice !== undefined && item.wholesalePrice > 0;
                      return (
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
                             {hasWholesale && (
                                <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => togglePrice(item.id)}>
                                      <RefreshCw className="h-3 w-3" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Switch to {item.useWholesale ? 'Retail' : 'Wholesale'} Price</p>
                                </TooltipContent>
                                </Tooltip>
                             )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">KSH {(price * item.quantity).toFixed(2)}</p>
                          <Badge variant={item.useWholesale ? "secondary" : "outline"} className="text-xs px-1 py-0">{item.useWholesale ? "Wholesale" : "Retail"}</Badge>
                        </div>

                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-7 w-7" onClick={() => removeFromCart(item.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      )
                    })}
                    </TooltipProvider>
                  </div>
                )}
              </ScrollArea>
              {cart.length > 0 && (
                <>
                  <Separator className="my-2" />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <p>Subtotal</p>
                      <p className="font-medium">KSH {subtotal.toFixed(2)}</p>
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
                     <div className="grid grid-cols-2 items-center gap-4 mt-4">
                       <Label htmlFor="cash-given" className="text-right">Cash Given</Label>
                       <Input 
                        id="cash-given" 
                        type="number" 
                        placeholder="e.g. 5000" 
                        value={cashGiven}
                        onChange={(e) => setCashGiven(e.target.value)}
                       />
                    </div>
                     {change > 0 && (
                      <div className="flex justify-between text-lg font-bold text-accent pt-2">
                        <p>Change</p>
                        <p>KSH {change.toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
            {cart.length > 0 && (
            <CardFooter>
              <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="w-full text-lg" disabled={isLoading}>
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
                        {change > 0 && (
                          <div className="text-center text-lg">
                            <p className="text-muted-foreground">Change due:</p>
                            <p className="font-bold text-2xl">KSH {change.toFixed(2)}</p>
                          </div>
                        )}
                         
                        <Button className="w-full" size="lg" onClick={() => handleCompletePayment('Cash')} disabled={parseFloat(cashGiven) < total || isLoading}>
                          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                          Confirm Payment
                        </Button>
                      </div>
                    </TabsContent>
                     <TabsContent value="card">
                       <div className="space-y-4">
                        <p className="text-center text-muted-foreground">Waiting for card terminal...</p>
                         <Button className="w-full" size="lg" onClick={() => handleCompletePayment('Card')} disabled={isLoading}>
                           {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                           Confirm Payment
                         </Button>
                      </div>
                    </TabsContent>
                     <TabsContent value="mpesa">
                       <div className="space-y-4">
                        <p className="text-center text-muted-foreground">Send payment request to customer's phone.</p>
                         <Button className="w-full" size="lg" onClick={() => handleCompletePayment('M-Pesa')} disabled={isLoading}>
                          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                           Confirm Payment
                         </Button>
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
  );
}
