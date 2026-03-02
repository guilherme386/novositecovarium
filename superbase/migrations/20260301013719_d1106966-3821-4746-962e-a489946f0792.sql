
-- Categories table
CREATE TABLE public.product_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  display_title text NOT NULL,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Products table
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id uuid NOT NULL REFERENCES public.product_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  price numeric NOT NULL,
  description text,
  features text[] NOT NULL DEFAULT '{}',
  highlight boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Anyone can read active products/categories
CREATE POLICY "Anyone can view categories" ON public.product_categories FOR SELECT USING (true);
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);

-- Only admins can manage
CREATE POLICY "Admins can insert categories" ON public.product_categories FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update categories" ON public.product_categories FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete categories" ON public.product_categories FOR DELETE USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert products" ON public.products FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update products" ON public.products FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Trigger for updated_at on products
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial data
INSERT INTO public.product_categories (name, slug, display_title, description, sort_order) VALUES
  ('VIP', 'vip', 'PLANOS VIP', 'Escolha o plano ideal para você — compra única, eterno!', 0),
  ('ClanTag', 'clantag', 'CLANTAG', 'Crie sua tag personalizada', 1),
  ('Serviços', 'services', 'SERVIÇOS', 'Unban e Unmute — Minecraft e Discord', 2);

INSERT INTO public.products (category_id, name, slug, price, description, features, highlight, sort_order) VALUES
  ((SELECT id FROM public.product_categories WHERE slug = 'vip'), 'VIP', 'vip', 20, 'Plano básico para começar com vantagens', ARRAY['Acesso VIP no servidor', 'Kit exclusivo', 'Tag no chat'], false, 0),
  ((SELECT id FROM public.product_categories WHERE slug = 'vip'), 'Plus', 'plus', 25, 'Mais vantagens e benefícios extras', ARRAY['Tudo do VIP', 'Kit Plus exclusivo', 'Prioridade na fila'], true, 1),
  ((SELECT id FROM public.product_categories WHERE slug = 'vip'), 'Plus+', 'plus-plus', 35, 'O plano mais completo do servidor', ARRAY['Tudo do Plus', 'Kit Plus+ exclusivo', 'Fly no lobby', 'Suporte prioritário'], false, 2),
  ((SELECT id FROM public.product_categories WHERE slug = 'clantag'), 'ClanTag', 'clantag', 12, 'Personalize sua tag no servidor', ARRAY['Tag personalizada', 'Até 12 caracteres', 'Visível no chat'], false, 0),
  ((SELECT id FROM public.product_categories WHERE slug = 'services'), 'Unban', 'unban', 40, 'Remova seu ban do Minecraft e Discord', ARRAY['Unban no Minecraft', 'Unban no Discord'], false, 0),
  ((SELECT id FROM public.product_categories WHERE slug = 'services'), 'Unmute', 'unmute', 20, 'Remova seu mute do Minecraft e Discord', ARRAY['Unmute no Minecraft', 'Unmute no Discord'], false, 1);
