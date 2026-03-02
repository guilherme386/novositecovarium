import { useState, useEffect, useRef } from "react";
import { PurchaseData, buildPixMessage } from "@/lib/products";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Copy, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { QRCodeSVG } from "qrcode.react";

interface PaymentScreenProps {
  data: PurchaseData;
  onBack: () => void;
}

const PaymentScreen = ({ data, onBack }: PaymentScreenProps) => {
  const { toast } = useToast();
  const [pixCode, setPixCode] = useState<string | null>(null);
  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const createPayment = async () => {
      try {
        setLoading(true);
        setError(null);

        const hostname = window.location.hostname;
        const isLocalHostOrIP =
          hostname === "localhost" ||
          hostname === "127.0.0.1" ||
          hostname === "[::1]" ||
          /^192\.168\./.test(hostname) ||
          /^10\./.test(hostname) ||
          /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname) ||
          hostname.endsWith(".local");

        if (isLocalHostOrIP) {
          // Mock successful pix generation
          setTimeout(() => {
            setPixCode("00020126580014br.gov.bcb.pix0136test-pix-code-b14beab5ab7a520400005303986540510.005802BR5915Teste Pagamento6009Sao Paulo62070503***630485CE");
            setCheckoutId("CHK-TEST-" + Math.floor(Math.random() * 1000));
            setLoading(false);
          }, 1500);
          return;
        }

        const message = buildPixMessage(data);

        const { data: result, error: fnError } = await supabase.functions.invoke("pixgg-proxy", {
          body: {
            nick: data.minecraftNick,
            message,
            amount: data.product.price,
          },
        });

        if (fnError) throw new Error(fnError.message);
        if (!result?.pixUrl) throw new Error("Não foi possível gerar o pagamento");

        setPixCode(result.pixUrl);
        setCheckoutId(result.checkoutId || null);

        // Update the order with transaction_id
        if (result.checkoutId) {
          await supabase
            .from("orders")
            .update({ transaction_id: result.checkoutId } as any)
            .eq("minecraft_nick", data.minecraftNick)
            .eq("product_name", data.product.name)
            .eq("status", "pending" as any)
            .order("created_at", { ascending: false })
            .limit(1);
        }
      } catch (err: any) {
        setError(err.message || "Erro ao gerar pagamento");
        toast({ title: "Erro ao gerar pagamento", description: err.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    createPayment();

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [data]);

  // Poll for payment status
  useEffect(() => {
    if (!checkoutId || paid) return;

    pollRef.current = setInterval(async () => {
      try {
        const hostname = window.location.hostname;
        const isLocalHostOrIP =
          hostname === "localhost" ||
          hostname === "127.0.0.1" ||
          hostname === "[::1]" ||
          /^192\.168\./.test(hostname) ||
          /^10\./.test(hostname) ||
          /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname) ||
          hostname.endsWith(".local");

        if (isLocalHostOrIP) {
          // Mock success after 5 seconds
          setPaid(true);
          if (pollRef.current) clearInterval(pollRef.current);
          toast({ title: "Pagamento confirmado! ✅" });
          return;
        }

        const { data: result } = await supabase.functions.invoke("pixgg-proxy", {
          body: { action: "check-status", checkoutId },
        });

        if (result?.status === "paid" || result?.status === "completed" || result?.paidAt) {
          setPaid(true);
          if (pollRef.current) clearInterval(pollRef.current);
          toast({ title: "Pagamento confirmado! ✅" });
        }
      } catch {
        // silently retry
      }
    }, 5000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [checkoutId, paid]);

  const handleCopyPix = () => {
    if (pixCode) {
      navigator.clipboard.writeText(pixCode);
      toast({ title: "Código PIX copiado!" });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-border/50">
        <CardContent className="p-6 space-y-6">
          <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>

          <div className="text-center space-y-2">
            <h2 className="font-display text-2xl tracking-wider text-foreground">Pagamento PIX</h2>
            <p className="text-muted-foreground font-body">
              {data.product.name} — <span className="text-neon-purple font-bold">R$ {data.product.price.toFixed(2).replace(".", ",")}</span>
            </p>
          </div>

          {/* Reference Code */}
          {data.referenceCode && (
            <div className="text-center p-3 rounded-lg bg-muted/80 border border-border/50">
              <p className="text-xs text-muted-foreground font-body mb-1">Seu código de referência (salve para suporte):</p>
              <div className="flex items-center justify-center gap-2">
                <span className="font-mono text-lg font-bold tracking-widest text-neon-cyan">{data.referenceCode}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(data.referenceCode!);
                    toast({ title: "Código copiado!" });
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Transaction ID */}
          {checkoutId && (
            <div className="text-center">
              <p className="text-xs text-muted-foreground font-body">
                ID da transação: <span className="font-mono text-foreground">{checkoutId}</span>
              </p>
            </div>
          )}

          {/* Paid confirmation */}
          {paid && (
            <div className="flex flex-col items-center gap-3 py-6">
              <CheckCircle className="w-16 h-16 text-green-400" />
              <h3 className="font-display text-xl tracking-wider text-green-400">PAGAMENTO CONFIRMADO!</h3>
              <p className="text-sm text-muted-foreground font-body text-center">
                Seu pagamento foi detectado. O serviço será ativado em breve.
              </p>
            </div>
          )}

          {loading && !paid && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="w-8 h-8 animate-spin text-neon-purple" />
              <p className="text-muted-foreground font-body text-sm">Gerando QR Code do PIX...</p>
            </div>
          )}

          {error && !paid && (
            <div className="text-center space-y-4 py-4">
              <p className="text-destructive font-body text-sm">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-lg font-display text-sm tracking-wider bg-gradient-to-r from-neon-purple to-neon-blue text-primary-foreground hover:opacity-90 transition-opacity"
              >
                TENTAR NOVAMENTE
              </button>
            </div>
          )}

          {pixCode && !loading && !paid && (
            <>
              <div className="flex flex-col items-center gap-4">
                <div className="bg-white p-4 rounded-xl">
                  <QRCodeSVG value={pixCode} size={220} level="M" />
                </div>
                <p className="text-sm text-muted-foreground font-body text-center">
                  Escaneie o QR Code com o app do seu banco
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-body">Pix Copia e Cola:</p>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted text-xs text-foreground font-body break-all">
                  <span className="flex-1 line-clamp-3">{pixCode}</span>
                  <button onClick={handleCopyPix} className="text-muted-foreground hover:text-foreground shrink-0">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground font-body">
                <Loader2 className="w-3 h-3 animate-spin" />
                Aguardando pagamento...
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentScreen;
