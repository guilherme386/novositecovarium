import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Ticket, Gift, Percent, Plus, Copy, Check } from "lucide-react";
import { Label } from "@/components/ui/label";

const CouponManager = () => {
    const [couponCode, setCouponCode] = useState("");
    const [discount, setDiscount] = useState("10");
    const [giftAmount, setGiftAmount] = useState("10");
    const [loading, setLoading] = useState(false);
    const [lastCreated, setLastCreated] = useState<string | null>(null);
    const { toast } = useToast();

    const handleCreateCoupon = async () => {
        if (!couponCode) return;
        setLoading(true);
        const token = localStorage.getItem("covarium_token");
        try {
            const res = await fetch("/api/admin/coupons", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ code: couponCode, discount_percentage: parseInt(discount) })
            });
            if (res.ok) {
                toast({ title: "Cupom criado com sucesso!" });
                setCouponCode("");
            }
        } catch (e) {
            toast({ title: "Erro ao criar cupom", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateGift = async () => {
        setLoading(true);
        const token = localStorage.getItem("covarium_token");
        try {
            const res = await fetch("/api/admin/gifts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ amount: parseFloat(giftAmount) })
            });
            if (res.ok) {
                const data = await res.json();
                setLastCreated(data.code);
                toast({ title: "Gift Card gerado!" });
            }
        } catch (e) {
            toast({ title: "Erro ao gerar Gift Card", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copiado para a área de transferência!" });
    };

    return (
        <div className="grid md:grid-cols-2 gap-6">
            {/* Coupon Generator */}
            <Card className="bg-card border-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Ticket className="w-5 h-5 text-neon-purple" /> Cupons de Desconto
                    </CardTitle>
                    <CardDescription>Crie códigos de desconto para usar na loja.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Código do Cupom</Label>
                        <Input
                            placeholder="EX: PROMO2026"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Porcentagem de Desconto (%)</Label>
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                value={discount}
                                onChange={(e) => setDiscount(e.target.value)}
                            />
                            <Button className="bg-neon-purple hover:bg-neon-purple/80" onClick={handleCreateCoupon} disabled={loading}>
                                <Plus className="w-4 h-4 mr-2" /> Criar
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Gift Generator */}
            <Card className="bg-card border-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Gift className="w-5 h-5 text-neon-cyan" /> Gerador de Gifts (Manual)
                    </CardTitle>
                    <CardDescription>Gere códigos de saldo para sorteios ou presentes.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Valor em R$</Label>
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                value={giftAmount}
                                onChange={(e) => setGiftAmount(e.target.value)}
                            />
                            <Button className="bg-neon-cyan text-primary-foreground hover:bg-neon-cyan/80" onClick={handleCreateGift} disabled={loading}>
                                <Plus className="w-4 h-4 mr-2" /> Gerar
                            </Button>
                        </div>
                    </div>

                    {lastCreated && (
                        <div className="mt-6 p-4 bg-muted border border-neon-cyan/30 rounded-lg animate-in fade-in slide-in-from-top-2">
                            <Label className="text-xs text-muted-foreground uppercase">Código Gerado:</Label>
                            <div className="flex items-center justify-between gap-4 mt-1">
                                <span className="text-xl font-mono font-bold text-neon-cyan tracking-widest">{lastCreated}</span>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => copyToClipboard(lastCreated)}>
                                    <Copy className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default CouponManager;
