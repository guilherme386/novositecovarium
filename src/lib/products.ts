export type ProductType = "vip" | "plus" | "plus+" | "clantag" | "unban" | "unmute";

export interface Product {
  id: ProductType | string;
  name: string;
  price: number;
  description: string;
  features?: string[];
  highlight?: boolean;
  is_clan_tag?: boolean;
  expires_at?: string | null;
  category_id?: string;
}

export interface PurchaseData {
  product: Product;
  minecraftNick: string;
  discordNick: string;
  clanTag?: string;
  tip?: number;
  message?: string;
  referenceCode?: string;
}

export const PRODUCTS: Record<string, Product[]> = {
  vip: [
    {
      id: "vip",
      name: "VIP",
      price: 20,
      description: "Plano básico para começar com vantagens",
      features: ["Acesso VIP no servidor", "Kit exclusivo", "Tag no chat"],
    },
    {
      id: "plus",
      name: "Plus",
      price: 25,
      description: "Mais vantagens e benefícios extras",
      features: ["Tudo do VIP", "Kit Plus exclusivo", "Prioridade na fila"],
      highlight: true,
    },
    {
      id: "plus+",
      name: "Plus+",
      price: 35,
      description: "O plano mais completo do servidor",
      features: ["Tudo do Plus", "Kit Plus+ exclusivo", "Fly no lobby", "Suporte prioritário"],
    },
  ],
  clantag: [
    {
      id: "clantag",
      name: "ClanTag",
      price: 12,
      description: "Personalize sua tag no servidor",
      features: ["Tag personalizada", "Até 12 caracteres", "Visível no chat"],
    },
  ],
  services: [
    {
      id: "unban",
      name: "Unban",
      price: 40,
      description: "Remova seu ban do Minecraft e Discord",
      features: ["Unban no Minecraft", "Unban no Discord"],
    },
    {
      id: "unmute",
      name: "Unmute",
      price: 20,
      description: "Remova seu mute do Minecraft e Discord",
      features: ["Unmute no Minecraft", "Unmute no Discord"],
    },
  ],
};

export const FORBIDDEN_TAGS = ["vip", "plus", "plus+"];

export function buildPixMessage(data: PurchaseData): string {
  if (data.product.id === "clantag" && data.clanTag) {
    return `clantag, tag: ${data.clanTag} mine: ${data.minecraftNick} dc: ${data.discordNick}`;
  }
  return `mine: ${data.minecraftNick} dc: ${data.discordNick} - ${data.product.name}`;
}
