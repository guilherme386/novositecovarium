import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { LogOut, CheckCircle, XCircle, Clock, ShoppingBag, Package } from "lucide-react";
import ProductManager from "@/components/admin/ProductManager";
import ForumManager from "@/components/admin/ForumManager";
import StaffManager from "@/components/admin/StaffManager";
import NewsManager from "@/components/admin/NewsManager";
import UserManager from "@/components/admin/UserManager";
import CouponManager from "@/components/admin/CouponManager";
import { MessageSquare, ShieldCheck, Newspaper, Users, Ticket } from "lucide-react";

interface Order {
  id: string;
  minecraft_nick: string;
  discord_nick: string;
  product_id: string;
  product_name: string;
  price: number;
  clan_tag: string | null;
  tip: number;
  message: string | null;
  transaction_id: string | null;
  status: "pending" | "confirmed" | "cancelled";
  created_at: string;
}

const AdminDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "cancelled">("pending");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    fetchOrders();
  }, []);

  const checkAuth = () => {
    const userStr = localStorage.getItem("covarium_user");
    if (!userStr) {
      navigate("/login");
      return;
    }
    try {
      const user = JSON.parse(userStr);
      if (user.role !== 'admin') {
        toast({ title: "Acesso negado", description: "Apenas administradores podem acessar esta página.", variant: "destructive" });
        navigate("/");
      }
    } catch (e) {
      navigate("/login");
    }
  };

  const fetchOrders = async () => {
    const token = localStorage.getItem("covarium_token");
    try {
      const res = await fetch("/api/admin/orders", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data || []);
      } else {
        toast({ title: "Erro ao carregar pedidos", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Erro de conexão", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: "confirmed" | "cancelled") => {
    const token = localStorage.getItem("covarium_token");
    try {
      const res = await fetch(`/api/admin/orders/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        toast({ title: status === "confirmed" ? "Serviço confirmado!" : "Pedido cancelado" });
        fetchOrders();
      } else {
        toast({ title: "Erro ao atualizar", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Erro de conexão", variant: "destructive" });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("covarium_token");
    localStorage.removeItem("covarium_user");
    navigate("/login");
  };

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const statusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="text-yellow-400 border-yellow-400/50"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
      case "confirmed":
        return <Badge variant="outline" className="text-green-400 border-green-400/50"><CheckCircle className="w-3 h-3 mr-1" />Confirmado</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="text-red-400 border-red-400/50"><XCircle className="w-3 h-3 mr-1" />Cancelado</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-display font-bold tracking-wider text-foreground">
            PAINEL ADMIN
          </h1>
          <Button variant="ghost" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
            <LogOut className="w-4 h-4 mr-2" /> Sair
          </Button>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="bg-muted/50 border border-border/50 flex flex-wrap h-auto p-1">
            <TabsTrigger value="orders" className="font-display text-xs tracking-wider data-[state=active]:bg-gradient-to-r data-[state=active]:from-neon-purple data-[state=active]:to-neon-blue data-[state=active]:text-primary-foreground min-w-[100px]">
              <ShoppingBag className="w-4 h-4 mr-1.5" /> Pedidos
            </TabsTrigger>
            <TabsTrigger value="products" className="font-display text-xs tracking-wider data-[state=active]:bg-gradient-to-r data-[state=active]:from-neon-purple data-[state=active]:to-neon-blue data-[state=active]:text-primary-foreground min-w-[100px]">
              <Package className="w-4 h-4 mr-1.5" /> Produtos
            </TabsTrigger>
            <TabsTrigger value="users" className="font-display text-xs tracking-wider data-[state=active]:bg-gradient-to-r data-[state=active]:from-neon-purple data-[state=active]:to-neon-blue data-[state=active]:text-primary-foreground min-w-[100px]">
              <Users className="w-4 h-4 mr-1.5" /> Usuários
            </TabsTrigger>
            <TabsTrigger value="coupons" className="font-display text-xs tracking-wider data-[state=active]:bg-gradient-to-r data-[state=active]:from-neon-purple data-[state=active]:to-neon-blue data-[state=active]:text-primary-foreground min-w-[100px]">
              <Ticket className="w-4 h-4 mr-1.5" /> Cupons & Gifts
            </TabsTrigger>
            <TabsTrigger value="forum" className="font-display text-xs tracking-wider data-[state=active]:bg-gradient-to-r data-[state=active]:from-neon-purple data-[state=active]:to-neon-blue data-[state=active]:text-primary-foreground min-w-[100px]">
              <MessageSquare className="w-4 h-4 mr-1.5" /> Fórum
            </TabsTrigger>
            <TabsTrigger value="staff" className="font-display text-xs tracking-wider data-[state=active]:bg-gradient-to-r data-[state=active]:from-neon-purple data-[state=active]:to-neon-blue data-[state=active]:text-primary-foreground min-w-[100px]">
              <ShieldCheck className="w-4 h-4 mr-1.5" /> Equipe
            </TabsTrigger>
            <TabsTrigger value="news" className="font-display text-xs tracking-wider data-[state=active]:bg-gradient-to-r data-[state=active]:from-neon-purple data-[state=active]:to-neon-blue data-[state=active]:text-primary-foreground min-w-[100px]">
              <Newspaper className="w-4 h-4 mr-1.5" /> Notícias
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Pendentes", count: orders.filter((o) => o.status === "pending").length, color: "text-yellow-400" },
                { label: "Confirmados", count: orders.filter((o) => o.status === "confirmed").length, color: "text-green-400" },
                { label: "Cancelados", count: orders.filter((o) => o.status === "cancelled").length, color: "text-red-400" },
                { label: "Total", count: orders.length, color: "text-neon-blue" },
              ].map((s) => (
                <Card key={s.label} className="bg-card border-border/50">
                  <CardContent className="p-4 text-center">
                    <p className={`text-2xl font-display font-bold ${s.color}`}>{s.count}</p>
                    <p className="text-xs text-muted-foreground font-body">{s.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
              {(["pending", "confirmed", "cancelled", "all"] as const).map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(f)}
                  className={filter === f ? "bg-gradient-to-r from-neon-purple to-neon-blue text-primary-foreground" : "border-border/50 text-muted-foreground"}
                >
                  {f === "pending" ? "Pendentes" : f === "confirmed" ? "Confirmados" : f === "cancelled" ? "Cancelados" : "Todos"}
                </Button>
              ))}
            </div>

            {/* Orders Table */}
            <Card className="bg-card border-border/50">
              <CardContent className="p-0">
                {loading ? (
                  <p className="p-6 text-center text-muted-foreground font-body">Carregando...</p>
                ) : filtered.length === 0 ? (
                  <p className="p-6 text-center text-muted-foreground font-body">Nenhum pedido encontrado</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border/50">
                          <TableHead className="text-muted-foreground font-display text-xs tracking-wider">Produto</TableHead>
                          <TableHead className="text-muted-foreground font-display text-xs tracking-wider">TX ID</TableHead>
                          <TableHead className="text-muted-foreground font-display text-xs tracking-wider">Minecraft</TableHead>
                          <TableHead className="text-muted-foreground font-display text-xs tracking-wider">Discord</TableHead>
                          <TableHead className="text-muted-foreground font-display text-xs tracking-wider">Tag</TableHead>
                          <TableHead className="text-muted-foreground font-display text-xs tracking-wider">Valor</TableHead>
                          <TableHead className="text-muted-foreground font-display text-xs tracking-wider">Gorjeta</TableHead>
                          <TableHead className="text-muted-foreground font-display text-xs tracking-wider">Mensagem</TableHead>
                          <TableHead className="text-muted-foreground font-display text-xs tracking-wider">Status</TableHead>
                          <TableHead className="text-muted-foreground font-display text-xs tracking-wider">Data</TableHead>
                          <TableHead className="text-muted-foreground font-display text-xs tracking-wider">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filtered.map((order) => (
                          <TableRow key={order.id} className="border-border/30">
                            <TableCell className="font-body font-bold text-foreground">{order.product_name}</TableCell>
                            <TableCell className="font-body text-muted-foreground font-mono text-xs max-w-[100px] truncate" title={order.transaction_id || ""}>{order.transaction_id || "—"}</TableCell>
                            <TableCell className="font-body text-foreground">{order.minecraft_nick}</TableCell>
                            <TableCell className="font-body text-foreground">{order.discord_nick}</TableCell>
                            <TableCell className="font-body text-muted-foreground">{order.clan_tag || "—"}</TableCell>
                            <TableCell className="font-body text-neon-purple font-bold">R$ {Number(order.price).toFixed(2).replace(".", ",")}</TableCell>
                            <TableCell className="font-body text-muted-foreground">{order.tip > 0 ? `R$ ${Number(order.tip).toFixed(2).replace(".", ",")}` : "—"}</TableCell>
                            <TableCell className="font-body text-muted-foreground text-xs max-w-[150px] truncate" title={order.message || ""}>{order.message || "—"}</TableCell>
                            <TableCell>{statusBadge(order.status)}</TableCell>
                            <TableCell className="font-body text-muted-foreground text-xs">
                              {new Date(order.created_at).toLocaleDateString("pt-BR")}
                            </TableCell>
                            <TableCell>
                              {order.status === "pending" && (
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    onClick={() => updateStatus(order.id, "confirmed")}
                                    className="bg-green-600 hover:bg-green-700 text-primary-foreground text-xs h-7 px-2"
                                  >
                                    <CheckCircle className="w-3 h-3 mr-1" /> Confirmar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateStatus(order.id, "cancelled")}
                                    className="border-destructive/50 text-destructive hover:bg-destructive/10 text-xs h-7 px-2"
                                  >
                                    <XCircle className="w-3 h-3 mr-1" /> Cancelar
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <ProductManager />
          </TabsContent>

          <TabsContent value="users">
            <UserManager />
          </TabsContent>

          <TabsContent value="coupons">
            <CouponManager />
          </TabsContent>

          <TabsContent value="forum">
            <Card className="bg-card border-border/50 p-6">
              <ForumManager />
            </Card>
          </TabsContent>
          <TabsContent value="staff">
            <Card className="bg-card border-border/50 p-6">
              <StaffManager />
            </Card>
          </TabsContent>
          <TabsContent value="news">
            <Card className="bg-card border-border/50 p-6">
              <NewsManager />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
