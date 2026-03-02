import { Product } from "@/lib/products";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface PlanCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

const PlanCard = ({ product, onSelect }: PlanCardProps) => {
  const isHighlight = product.highlight;

  return (
    <Card
      className={`relative flex flex-col transition-all duration-300 hover:-translate-y-2 border-border/50 bg-card/80 backdrop-blur-sm ${
        isHighlight
          ? "border-neon-purple/50 shadow-[0_0_30px_hsl(265_90%_60%/0.15)]"
          : "hover:border-neon-blue/30"
      }`}
    >
      {isHighlight && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-neon-purple to-neon-blue text-xs font-display font-bold tracking-wider text-primary-foreground">
          POPULAR
        </div>
      )}

      <CardHeader className="text-center pb-2">
        <CardTitle className="font-display text-2xl tracking-wider text-foreground">
          {product.name}
        </CardTitle>
        <CardDescription className="text-muted-foreground font-body">
          {product.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 items-center gap-6">
        <div className="text-center">
          <span className="text-4xl font-display font-black bg-gradient-to-r from-neon-purple to-neon-blue bg-clip-text text-transparent">
            R$ {product.price.toFixed(2).replace(".", ",")}
          </span>
        </div>

        {product.features && (
          <ul className="space-y-2 w-full">
            {product.features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground font-body">
                <Check className="w-4 h-4 text-neon-cyan shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        )}

        <Button
          onClick={() => onSelect(product)}
          className={`w-full mt-auto font-display tracking-wider ${
            isHighlight
              ? "bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 text-primary-foreground"
              : "bg-muted hover:bg-muted/80 text-foreground"
          }`}
        >
          COMPRAR
        </Button>
      </CardContent>
    </Card>
  );
};

export default PlanCard;
