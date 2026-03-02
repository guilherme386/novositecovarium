import { useState } from "react";
import PlanCard from "@/components/PlanCard";
import PurchaseDialog from "@/components/PurchaseDialog";
import { Product, FORBIDDEN_TAGS } from "@/lib/products";
import { useProducts, DbProduct } from "@/hooks/useProducts";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useCart } from "@/components/CartContext";

// Convert DB product to the Product type used by existing components
const toProduct = (p: DbProduct): Product => ({
  id: p.slug as any,
  name: p.name,
  price: p.price,
  description: p.description || "",
  features: p.features,
  highlight: p.highlight,
  is_clan_tag: p.is_clan_tag,
  expires_at: p.expires_at,
  category_id: p.category_id,
});

const Index = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const { data: categories, isLoading } = useProducts();
  const { addItem } = useCart();

  const handleSelect = (product: Product) => {
    setSelectedProduct(product);
    setDialogOpen(true);
  };

  const handleAddToCart = (mcNick: string, dcNick: string, clanTag?: string, tip?: number, message?: string) => {
    if (!selectedProduct) return;
    setDialogOpen(false);

    addItem({
      ...selectedProduct,
      quantity: 1,
      mcNick,
      dcNick,
      clanTag,
      tip,
      message,
    });

    setSelectedProduct(null);
  };

  // Virtual Gift Card products
  const giftProducts: DbProduct[] = [
    { id: 'gift-10', category_id: 'gift', name: 'R$ 10,00 de Saldo (Gift)', slug: 'gift-10', price: 10, description: 'Gera um código de R$ 10,00 para resgate.', highlight: false, sort_order: 0, features: ['Uso único', 'Pode ser enviado para amigos', 'Resgate imediato'], is_active: true },
    { id: 'gift-50', category_id: 'gift', name: 'R$ 50,00 de Saldo (Gift)', slug: 'gift-50', price: 50, description: 'Gera um código de R$ 50,00 para resgate.', highlight: true, sort_order: 1, features: ['Uso único', 'Melhor custo benefício', 'Resgate imediato'], is_active: true },
    { id: 'gift-100', category_id: 'gift', name: 'R$ 100,00 de Saldo (Gift)', slug: 'gift-100', price: 100, description: 'Gera um código de R$ 100,00 para resgate.', highlight: false, sort_order: 2, features: ['Uso único', 'Presente Premium', 'Resgate imediato'], is_active: true },
  ];

  const processedCategories = categories ? [
    ...categories,
    {
      id: 'gift',
      name: 'GIFT CARDS',
      slug: 'gift-cards',
      display_title: 'PRESENTES E SALDO',
      description: 'Compre saldo para sua carteira ou para presentear amigos.',
      products: giftProducts,
      sort_order: 99
    }
  ] : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-neon-purple" />
      </div>
    );
  }

  return (
    <div className="w-full pb-20">
      <header className="py-12 text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-cyan italic">
          LOJA COVARIUM
        </h1>
        <p className="max-w-2xl mx-auto text-muted-foreground font-body">
          Melhore sua experiência no servidor com itens exclusivos e planos VIP.
        </p>
      </header>

      {processedCategories.map((cat, idx) => (
        <section
          key={cat.id}
          id={cat.slug}
          className={`py-20 px-4 ${idx % 2 === 1 ? "bg-muted/30" : ""}`}
        >
          <div className={`mx-auto ${cat.products.length <= 1 ? "max-w-md" : cat.products.length === 2 ? "max-w-3xl" : "max-w-5xl"}`}>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-2 tracking-wider text-foreground uppercase italic pb-8">
              {cat.display_title || cat.name}
            </h2>
            {cat.description && (
              <p className="text-center text-muted-foreground mb-12 font-body">
                {cat.description}
              </p>
            )}
            <div className={`grid gap-6 ${cat.products.length === 1 ? "" : cat.products.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
              {cat.products.filter(p => !p.expires_at || new Date(p.expires_at) > new Date()).map((p) => (
                <PlanCard key={p.id} product={toProduct(p as any)} onSelect={handleSelect} />
              ))}
            </div>
          </div>
        </section>
      ))}

      <footer className="py-8 px-4 border-t border-border/30 text-center">
        <p className="text-sm text-muted-foreground font-body uppercase tracking-widest opacity-50">
          © 2026 Covarium — Todos os direitos reservados
        </p>
      </footer>

      <PurchaseDialog
        product={selectedProduct}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
};

export default Index;
