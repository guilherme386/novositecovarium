import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAdminProducts, DbProduct, DbCategory } from "@/hooks/useProducts";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Pencil,
  Trash2,
  FolderPlus,
  X,
  GripVertical,
  Star,
} from "lucide-react";

const ProductManager = () => {
  const { data, isLoading, refetch } = useAdminProducts();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [categoryDialog, setCategoryDialog] = useState(false);
  const [productDialog, setProductDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<DbCategory | null>(null);
  const [editingProduct, setEditingProduct] = useState<DbProduct | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "category" | "product"; id: string; name: string } | null>(null);

  // Category form
  const [catName, setCatName] = useState("");
  const [catDisplayTitle, setCatDisplayTitle] = useState("");
  const [catDescription, setCatDescription] = useState("");
  const [catSlug, setCatSlug] = useState("");

  // Product form
  const [prodName, setProdName] = useState("");
  const [prodSlug, setProdSlug] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodDescription, setProdDescription] = useState("");
  const [prodFeatures, setProdFeatures] = useState<string[]>([]);
  const [prodNewFeature, setProdNewFeature] = useState("");
  const [prodHighlight, setProdHighlight] = useState(false);
  const [prodActive, setProdActive] = useState(true);
  const [prodCategoryId, setProdCategoryId] = useState("");
  const [prodIsClanTag, setProdIsClanTag] = useState(false);
  const [prodTimerEnabled, setProdTimerEnabled] = useState(false);
  const [prodExpiresAt, setProdExpiresAt] = useState("");

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    queryClient.invalidateQueries({ queryKey: ["products-with-categories"] });
  };

  // --- Category CRUD ---
  const openNewCategory = () => {
    setEditingCategory(null);
    setCatName("");
    setCatDisplayTitle("");
    setCatDescription("");
    setCatSlug("");
    setCategoryDialog(true);
  };

  const openEditCategory = (cat: DbCategory) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatDisplayTitle(cat.display_title);
    setCatDescription(cat.description || "");
    setCatSlug(cat.slug);
    setCategoryDialog(true);
  };

  const saveCategory = async () => {
    if (!catName.trim() || !catSlug.trim() || !catDisplayTitle.trim()) {
      toast({ title: "Preencha nome, título e slug", variant: "destructive" });
      return;
    }
    const token = localStorage.getItem("covarium_token");
    const payload = {
      name: catName.trim(),
      slug: catSlug.trim().toLowerCase(),
      display_title: catDisplayTitle.trim(),
      description: catDescription.trim() || null,
      sort_order: editingCategory ? editingCategory.sort_order : (data?.categories.length || 0),
    };

    const url = editingCategory
      ? `/api/admin/categories/${editingCategory.id}`
      : `/api/admin/categories`;
    const method = editingCategory ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });

    if (!res.ok) { toast({ title: "Erro ao salvar categoria", variant: "destructive" }); return; }
    toast({ title: editingCategory ? "Categoria atualizada!" : "Categoria criada!" });
    setCategoryDialog(false);
    invalidate();
  };

  // --- Product CRUD ---
  const openNewProduct = (categoryId?: string) => {
    setEditingProduct(null);
    setProdName("");
    setProdSlug("");
    setProdPrice("");
    setProdDescription("");
    setProdFeatures([]);
    setProdNewFeature("");
    setProdHighlight(false);
    setProdActive(true);
    setProdCategoryId(categoryId || data?.categories[0]?.id || "");
    setProdIsClanTag(false);
    setProdTimerEnabled(false);
    setProdExpiresAt("");
    setProductDialog(true);
  };

  const openEditProduct = (prod: DbProduct) => {
    setEditingProduct(prod);
    setProdName(prod.name);
    setProdSlug(prod.slug);
    setProdPrice(String(prod.price));
    setProdDescription(prod.description || "");
    setProdFeatures([...prod.features]);
    setProdNewFeature("");
    setProdHighlight(prod.highlight);
    setProdActive(prod.is_active);
    setProdCategoryId(prod.category_id);

    // Find settings
    const settings = data?.settings?.find((s: any) => s.product_id === prod.id);
    setProdIsClanTag(settings?.is_clan_tag || false);
    setProdTimerEnabled(settings?.timer_enabled || false);
    const expiresAt = settings?.expires_at ? new Date(settings.expires_at).toISOString().slice(0, 16) : "";
    setProdExpiresAt(expiresAt);

    setProductDialog(true);
  };

  const saveProduct = async () => {
    if (!prodName.trim() || !prodSlug.trim() || !prodPrice || !prodCategoryId) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }
    const token = localStorage.getItem("covarium_token");
    const payload = {
      name: prodName.trim(),
      slug: prodSlug.trim().toLowerCase(),
      price: parseFloat(prodPrice),
      description: prodDescription.trim() || null,
      features: prodFeatures,
      highlight: prodHighlight,
      is_active: prodActive,
      category_id: prodCategoryId,
      sort_order: editingProduct ? editingProduct.sort_order : (data?.products.filter((p) => p.category_id === prodCategoryId).length || 0),
    };

    const url = editingProduct
      ? `/api/admin/products/${editingProduct.id}`
      : `/api/admin/products`;
    const method = editingProduct ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });

    if (!res.ok) { toast({ title: "Erro ao salvar produto", variant: "destructive" }); return; }
    const savedProd = await res.json();
    const productId = savedProd.id;

    if (productId) {
      try {
        await fetch("/api/products/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product_id: productId,
            is_clan_tag: prodIsClanTag,
            timer_enabled: prodTimerEnabled,
            expires_at: prodTimerEnabled && prodExpiresAt ? new Date(prodExpiresAt).toISOString() : null,
          }),
        });
        toast({ title: editingProduct ? "Produto atualizado!" : "Produto criado!" });
      } catch {
        toast({ title: "Erro ao salvar configurações avançadas do produto.", variant: "destructive" });
      }
    }

    setProductDialog(false);
    invalidate();
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    const token = localStorage.getItem("covarium_token");
    const url = deleteConfirm.type === "category"
      ? `/api/admin/categories/${deleteConfirm.id}`
      : `/api/admin/products/${deleteConfirm.id}`;

    const res = await fetch(url, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) { toast({ title: "Erro ao excluir", variant: "destructive" }); return; }
    toast({ title: `${deleteConfirm.name} excluído!` });
    setDeleteConfirm(null);
    invalidate();
  };

  const addFeature = () => {
    if (prodNewFeature.trim()) {
      setProdFeatures([...prodFeatures, prodNewFeature.trim()]);
      setProdNewFeature("");
    }
  };

  const removeFeature = (idx: number) => {
    setProdFeatures(prodFeatures.filter((_, i) => i !== idx));
  };

  if (isLoading) return <p className="text-center text-muted-foreground p-6">Carregando produtos...</p>;

  const categories = data?.categories || [];
  const products = data?.products || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-bold tracking-wider text-foreground">GERENCIAR PRODUTOS</h2>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={openNewCategory} className="border-border/50 text-muted-foreground hover:text-foreground">
            <FolderPlus className="w-4 h-4 mr-1" /> Nova Categoria
          </Button>
          <Button size="sm" onClick={() => openNewProduct()} className="bg-gradient-to-r from-neon-purple to-neon-blue text-primary-foreground">
            <Plus className="w-4 h-4 mr-1" /> Novo Produto
          </Button>
        </div>
      </div>

      {categories.map((cat) => {
        const catProducts = products.filter((p) => p.category_id === cat.id);
        return (
          <Card key={cat.id} className="bg-card border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-display text-lg tracking-wider text-foreground">{cat.display_title}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">{cat.description}</p>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => openEditCategory(cat)} className="text-muted-foreground hover:text-foreground h-8 w-8 p-0">
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setDeleteConfirm({ type: "category", id: cat.id, name: cat.name })} className="text-muted-foreground hover:text-destructive h-8 w-8 p-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => openNewProduct(cat.id)} className="text-muted-foreground hover:text-foreground h-8 w-8 p-0">
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {catProducts.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhum produto nesta categoria</p>
              )}
              {catProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/30"
                >
                  <GripVertical className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-sm text-foreground font-bold">{prod.name}</span>
                      {prod.highlight && (
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                      )}
                      {!prod.is_active && (
                        <Badge variant="outline" className="text-xs text-muted-foreground border-muted-foreground/30">Inativo</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-neon-purple font-bold font-body">
                        R$ {Number(prod.price).toFixed(2).replace(".", ",")}
                      </span>
                      <span className="text-xs text-muted-foreground font-body truncate">{prod.description}</span>
                    </div>
                    {prod.features.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {prod.features.map((f, i) => (
                          <Badge key={i} variant="outline" className="text-[10px] text-muted-foreground border-border/50 px-1.5 py-0">
                            {f}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => openEditProduct(prod)} className="text-muted-foreground hover:text-foreground h-8 w-8 p-0">
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setDeleteConfirm({ type: "product", id: prod.id, name: prod.name })} className="text-muted-foreground hover:text-destructive h-8 w-8 p-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}

      {/* Category Dialog */}
      <Dialog open={categoryDialog} onOpenChange={setCategoryDialog}>
        <DialogContent className="bg-card border-border/50 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display tracking-wider text-foreground">
              {editingCategory ? "Editar Categoria" : "Nova Categoria"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label className="text-foreground font-body">Nome</Label>
              <Input value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="Ex: VIP" className="bg-muted border-border text-foreground" />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground font-body">Slug (identificador)</Label>
              <Input value={catSlug} onChange={(e) => setCatSlug(e.target.value)} placeholder="Ex: vip" className="bg-muted border-border text-foreground" />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground font-body">Título de exibição</Label>
              <Input value={catDisplayTitle} onChange={(e) => setCatDisplayTitle(e.target.value)} placeholder="Ex: PLANOS VIP" className="bg-muted border-border text-foreground" />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground font-body">Descrição (opcional)</Label>
              <Input value={catDescription} onChange={(e) => setCatDescription(e.target.value)} placeholder="Ex: Escolha o plano ideal..." className="bg-muted border-border text-foreground" />
            </div>
            <Button onClick={saveCategory} className="w-full bg-gradient-to-r from-neon-purple to-neon-blue text-primary-foreground">
              {editingCategory ? "Salvar" : "Criar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Product Dialog */}
      <Dialog open={productDialog} onOpenChange={setProductDialog}>
        <DialogContent className="bg-card border-border/50 sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display tracking-wider text-foreground">
              {editingProduct ? "Editar Produto" : "Novo Produto"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label className="text-foreground font-body">Categoria</Label>
              <select
                value={prodCategoryId}
                onChange={(e) => setProdCategoryId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-foreground font-body">Nome</Label>
                <Input value={prodName} onChange={(e) => setProdName(e.target.value)} placeholder="Ex: VIP" className="bg-muted border-border text-foreground" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground font-body">Slug</Label>
                <Input value={prodSlug} onChange={(e) => setProdSlug(e.target.value)} placeholder="Ex: vip" className="bg-muted border-border text-foreground" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground font-body">Preço (R$)</Label>
              <Input type="number" step="0.01" min="0" value={prodPrice} onChange={(e) => setProdPrice(e.target.value)} placeholder="20.00" className="bg-muted border-border text-foreground" />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground font-body">Descrição</Label>
              <Input value={prodDescription} onChange={(e) => setProdDescription(e.target.value)} placeholder="Descrição do produto" className="bg-muted border-border text-foreground" />
            </div>

            {/* Features */}
            <div className="space-y-2">
              <Label className="text-foreground font-body">Benefícios</Label>
              <div className="space-y-1.5">
                {prodFeatures.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded bg-muted/50 border border-border/30">
                    <span className="flex-1 text-sm text-foreground font-body">{f}</span>
                    <button onClick={() => removeFeature(i)} className="text-muted-foreground hover:text-destructive">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={prodNewFeature}
                  onChange={(e) => setProdNewFeature(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                  placeholder="Novo benefício..."
                  className="bg-muted border-border text-foreground"
                />
                <Button type="button" size="sm" variant="outline" onClick={addFeature} className="border-border/50 text-muted-foreground shrink-0">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch checked={prodHighlight} onCheckedChange={setProdHighlight} />
                <Label className="text-foreground font-body text-sm">Destaque</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={prodActive} onCheckedChange={setProdActive} />
                <Label className="text-foreground font-body text-sm">Ativo</Label>
              </div>
            </div>

            <div className="bg-muted/30 p-3 rounded-lg border border-border/50 space-y-3">
              <Label className="text-foreground font-display text-sm tracking-widest text-neon-blue">CONFIGURAÇÕES AVANÇADAS</Label>
              <div className="flex items-center gap-2">
                <Switch checked={prodIsClanTag} onCheckedChange={setProdIsClanTag} />
                <Label className="text-foreground font-body text-sm">Obrigar a informar Tag na compra (Clan Tag)</Label>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Switch checked={prodTimerEnabled} onCheckedChange={setProdTimerEnabled} />
                  <Label className="text-foreground font-body text-sm">Produto com Tempo Limitado</Label>
                </div>
                {prodTimerEnabled && (
                  <div className="pl-11 mt-1 space-y-1">
                    <Label className="text-xs text-muted-foreground mr-2">Sairá da loja em:</Label>
                    <Input
                      type="datetime-local"
                      value={prodExpiresAt}
                      onChange={(e) => setProdExpiresAt(e.target.value)}
                      className="bg-muted border-border"
                    />
                  </div>
                )}
              </div>
            </div>

            <Button onClick={saveProduct} className="w-full bg-gradient-to-r from-neon-purple to-neon-blue text-primary-foreground">
              {editingProduct ? "Salvar" : "Criar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={(v) => !v && setDeleteConfirm(null)}>
        <DialogContent className="bg-card border-border/50 sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display tracking-wider text-foreground">Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground font-body">
            Tem certeza que deseja excluir <strong className="text-foreground">{deleteConfirm?.name}</strong>?
            {deleteConfirm?.type === "category" && " Todos os produtos desta categoria serão excluídos."}
          </p>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="flex-1 border-border/50 text-muted-foreground">
              Cancelar
            </Button>
            <Button onClick={handleDelete} className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductManager;
