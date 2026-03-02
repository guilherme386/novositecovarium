import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Trash2, Loader2, Plus, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

export default function NewsManager() {
    const { toast } = useToast();
    const [news, setNews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ title: "", description: "", is_event: false, event_time: "", expires_at: "" });

    const fetchNews = async () => {
        try {
            const res = await fetch("/api/news");
            if (res.ok) {
                const textData = await res.text();
                setNews(textData ? JSON.parse(textData) : []);
            }
        } catch {
            toast({ title: "Erro ao buscar notícias", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title || !form.description) {
            toast({ title: "Título e descrição são obrigatórios", variant: "destructive" });
            return;
        }

        // Convert empty strings to null for the backend
        const payload = {
            ...form,
            event_time: form.event_time ? new Date(form.event_time).toISOString() : null,
            expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
        };

        try {
            const res = await fetch("/api/news", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                toast({ title: "Notícia adicionada!" });
                setForm({ title: "", description: "", is_event: false, event_time: "", expires_at: "" });
                fetchNews();
            }
        } catch {
            toast({ title: "Erro ao adicionar", variant: "destructive" });
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Excluir notícia?")) return;
        try {
            const res = await fetch(`/api/news/${id}`, { method: "DELETE" });
            if (res.ok) fetchNews();
        } catch { }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-display font-bold">Gerenciar Notícias / Eventos</h2>

            <form onSubmit={handleAdd} className="bg-muted/20 p-4 rounded-lg border border-border/50 space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 space-y-1">
                        <label className="text-xs text-muted-foreground">Título</label>
                        <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Título da notícia" required />
                    </div>
                    <div className="flex-1 space-y-1 flex items-center gap-3 pt-6">
                        <label className="text-sm">É um evento?</label>
                        <Switch checked={form.is_event} onCheckedChange={(c) => setForm({ ...form, is_event: c })} />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Descrição</label>
                    <Textarea
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                        placeholder="Conteúdo..."
                        rows={3}
                        required
                    />
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 space-y-1">
                        <label className="text-xs text-muted-foreground">Horário do Evento (Opcional)</label>
                        <Input
                            type="datetime-local"
                            value={form.event_time}
                            onChange={e => setForm({ ...form, event_time: e.target.value })}
                        />
                    </div>
                    <div className="flex-1 space-y-1">
                        <label className="text-xs text-muted-foreground">Expira em / Sai da loja em (Opcional)</label>
                        <Input
                            type="datetime-local"
                            value={form.expires_at}
                            onChange={e => setForm({ ...form, expires_at: e.target.value })}
                        />
                    </div>
                    <div className="flex items-end">
                        <Button type="submit"><Plus className="w-4 h-4 mr-2" /> Publicar</Button>
                    </div>
                </div>
            </form>

            {loading ? <Loader2 className="animate-spin text-neon-blue mx-auto" /> : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Notícia</TableHead>
                            <TableHead>Criada em</TableHead>
                            <TableHead>Expira em</TableHead>
                            <TableHead>Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {news.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    <div className="flex items-center gap-2 mb-1">
                                        {item.is_event ? <Badge className="bg-neon-purple text-white text-[10px]">EVENTO</Badge> : <Badge className="bg-neon-blue text-white text-[10px]">NOTÍCIA</Badge>}
                                        <span className="font-bold">{item.title}</span>
                                    </div>
                                    {item.event_time && <span className="text-xs text-neon-cyan flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(item.event_time).toLocaleString("pt-BR")}</span>}
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleDateString("pt-BR")}</TableCell>
                                <TableCell className="text-xs text-muted-foreground">{item.expires_at ? new Date(item.expires_at).toLocaleString("pt-BR") : "Nunca"}</TableCell>
                                <TableCell>
                                    <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    );
}
