import { useState } from "react";
import { Product, FORBIDDEN_TAGS } from "@/lib/products";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface PurchaseDialogProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
  onAddToCart: (minecraftNick: string, discordNick: string, clanTag?: string, tip?: number, message?: string) => void;
}

const PurchaseDialog = ({ product, open, onClose, onAddToCart }: PurchaseDialogProps) => {
  const [mcNick, setMcNick] = useState("");
  const [dcNick, setDcNick] = useState("");
  const [tag, setTag] = useState("");
  const [tip, setTip] = useState(0);
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  if (!product) return null;

  const isClanTag = product.id === "clantag" || product.is_clan_tag;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMc = mcNick.trim();
    const trimmedDc = dcNick.trim();
    const trimmedTag = tag.trim();

    if (!trimmedMc || !trimmedDc) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }

    if (isClanTag) {
      if (!trimmedTag) {
        toast({ title: "Digite a tag desejada", variant: "destructive" });
        return;
      }
      if (trimmedTag.length > 12) {
        toast({ title: "A tag deve ter no máximo 12 caracteres", variant: "destructive" });
        return;
      }
      if (FORBIDDEN_TAGS.includes(trimmedTag.toLowerCase())) {
        toast({ title: "Essa tag não é permitida", description: "Não pode usar nomes de planos VIP", variant: "destructive" });
        return;
      }
    }

    onAddToCart(trimmedMc, trimmedDc, isClanTag ? trimmedTag : undefined, tip > 0 ? tip : undefined, message.trim() || undefined);

    // Clear fields but DON'T close manually, usually the parent will handle or keep it open for multiple
    setMcNick("");
    setDcNick("");
    setTag("");
    setTip(0);
    setMessage("");
    onClose();
    toast({ title: "Adicionado ao carrinho! 🛒" });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-card border-border/50 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display tracking-wider text-foreground">
            {product.name} — R$ {product.price.toFixed(2).replace(".", ",")}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Preencha os dados do jogador que receberá o produto
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* ... existing fields ... */}
          <div className="space-y-2">
            <Label className="text-foreground font-body">Nick do Minecraft</Label>
            <Input
              placeholder="SeuNick"
              value={mcNick}
              onChange={(e) => setMcNick(e.target.value)}
              className="bg-muted border-border"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-foreground font-body">Nick do Discord</Label>
            <Input
              placeholder="SeuNick#1234"
              value={dcNick}
              onChange={(e) => setDcNick(e.target.value)}
              className="bg-muted border-border"
            />
          </div>

          {isClanTag && (
            <div className="space-y-2">
              <Label className="text-foreground font-body">Tag desejada (máx. 12 caracteres)</Label>
              <Input
                placeholder="MinhaTag"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                maxLength={12}
                className="bg-muted border-border"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-foreground font-body">Gorjeta (opcional)</Label>
            <div className="flex gap-2">
              {[0, 2, 5, 10].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setTip(v)}
                  className={`flex-1 py-2 rounded-lg text-sm font-display transition-all ${tip === v
                    ? "bg-gradient-to-r from-neon-purple to-neon-blue text-primary-foreground"
                    : "bg-muted border border-border text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {v === 0 ? "Sem" : `R$${v}`}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground font-body">Mensagem (opcional)</Label>
            <textarea
              placeholder="Deixe uma mensagem..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex w-full rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground focus-visible:ring-neon-purple resize-none h-20"
            />
          </div>

          <Button
            type="submit"
            className="w-full font-display tracking-wider bg-gradient-to-r from-neon-purple to-neon-blue text-primary-foreground hover:opacity-90"
          >
            ADICIONAR AO CARRINHO 🛒
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseDialog;
