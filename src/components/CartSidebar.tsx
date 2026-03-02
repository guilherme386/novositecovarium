import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "./CartContext";
import { Button } from "./ui/button";
import { ShoppingCart, Trash2, Plus, Minus, CreditCard, Wallet } from "lucide-react";
import { Separator } from "./ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const CartSidebar = () => {
    const { items, removeItem, updateQuantity, total, clearCart } = useCart();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const handleCheckout = async (useWallet: boolean) => {
        const token = localStorage.getItem("covarium_token");
        if (!token) {
            toast({ title: "Faça login para continuar", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ items, useWallet })
            });

            const data = await res.json();
            if (res.ok) {
                toast({ title: useWallet ? "Compra realizada com sucesso! ✅" : "Pedidos gerados! Aguardando pagamento." });
                clearCart();
                // Redirect to profile or payment screen if needed
                if (!useWallet) {
                    // Here we could show a global payment screen for the multiple orders
                    // For now, let's just confirm they were generated
                }
            } else {
                throw new Error(data.error);
            }
        } catch (e: any) {
            toast({ title: "Erro no checkout", description: e.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative group">
                    <ShoppingCart className="w-5 h-5 group-hover:text-neon-cyan transition-colors" />
                    {items.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-neon-purple text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                            {items.length}
                        </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md bg-card border-border/50 flex flex-col">
                <SheetHeader className="pb-4">
                    <SheetTitle className="font-display tracking-wider flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-neon-purple" /> MEU CARRINHO
                    </SheetTitle>
                </SheetHeader>

                <Separator className="bg-border/50" />

                <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                                <ShoppingCart className="w-8 h-8" />
                            </div>
                            <p className="font-body text-muted-foreground">Seu carrinho está vazio.</p>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={`${item.id}-${item.mcNick}`} className="p-4 bg-muted/30 border border-border/50 rounded-xl space-y-3 group">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-display font-bold text-sm text-foreground">{item.name}</h4>
                                        <p className="text-[10px] text-muted-foreground font-body uppercase tracking-tighter">Para: {item.mcNick}</p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500" onClick={() => removeItem(item.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 bg-background/50 rounded-lg p-1 border border-border/50">
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                                            <Minus className="w-3 h-3" />
                                        </Button>
                                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                            <Plus className="w-3 h-3" />
                                        </Button>
                                    </div>
                                    <span className="font-display font-bold text-neon-purple text-sm">
                                        R$ {((item.price + (item.tip || 0)) * item.quantity).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {items.length > 0 && (
                    <div className="pt-6 space-y-4 border-t border-border/50">
                        <div className="flex justify-between items-center px-2">
                            <span className="font-display text-sm tracking-wider text-muted-foreground font-bold">TOTAL</span>
                            <span className="font-display text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-cyan">
                                R$ {total.toFixed(2).replace('.', ',')}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                variant="outline"
                                className="font-display text-[10px] tracking-widest h-12 flex flex-col items-center justify-center border-border/50 hover:bg-muted"
                                onClick={() => handleCheckout(false)}
                                disabled={loading}
                            >
                                <CreditCard className="w-4 h-4 mb-1" />
                                DEMAIS PAGAMENTOS
                            </Button>
                            <Button
                                className="font-display text-[10px] tracking-widest h-12 flex flex-col items-center justify-center bg-gradient-to-r from-neon-purple to-neon-blue"
                                onClick={() => handleCheckout(true)}
                                disabled={loading}
                            >
                                <Wallet className="w-4 h-4 mb-1" />
                                PAGAR COM CARTEIRA
                            </Button>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
};
