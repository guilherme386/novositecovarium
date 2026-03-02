import { useQuery } from "@tanstack/react-query";

export interface DbProduct {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  price: number;
  description: string | null;
  features: string[];
  highlight: boolean;
  is_active: boolean;
  sort_order: number;
  is_clan_tag?: boolean;
  expires_at?: string | null;
}

export interface DbCategory {
  id: string;
  name: string;
  slug: string;
  display_title: string;
  description: string | null;
  sort_order: number;
}

export interface CategoryWithProducts extends DbCategory {
  products: DbProduct[];
}

export function useProducts() {
  return useQuery({
    queryKey: ["products-with-categories"],
    queryFn: async (): Promise<CategoryWithProducts[]> => {
      const res = await fetch("/api/products/all");
      if (!res.ok) throw new Error("Erro ao buscar produtos");
      return res.json();
    },
  });
}

export function useAdminProducts() {
  return useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const token = localStorage.getItem("covarium_token");
      const [catRes, prodRes, settingsRes] = await Promise.all([
        fetch("/api/admin/categories", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/products", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/products/settings")
      ]);

      if (!catRes.ok || !prodRes.ok) throw new Error("Erro ao buscar dados do admin");

      const categories: DbCategory[] = await catRes.json();
      const products: DbProduct[] = await prodRes.json();
      const settings: any[] = settingsRes.ok ? await settingsRes.json() : [];

      return { categories, products, settings };
    },
  });
}
