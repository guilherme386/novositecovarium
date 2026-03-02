import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Loader2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function StaffManager() {
    const { toast } = useToast();
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ name: "", role: "", minecraft_nick: "", photo_url: "" });

    const fetchStaff = async () => {
        try {
            const res = await fetch("/api/staff");
            if (res.ok) {
                const textData = await res.text();
                setMembers(textData ? JSON.parse(textData) : []);
            }
        } catch {
            toast({ title: "Erro ao buscar equipe", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/staff", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });
            if (res.ok) {
                toast({ title: "Membro adicionado!" });
                setForm({ name: "", role: "", minecraft_nick: "", photo_url: "" });
                fetchStaff();
            }
        } catch {
            toast({ title: "Erro ao adicionar", variant: "destructive" });
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Excluir membro da equipe?")) return;
        try {
            const res = await fetch(`/api/staff/${id}`, { method: "DELETE" });
            if (res.ok) fetchStaff();
        } catch { }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-display font-bold">Gerenciar Equipe</h2>

            <form onSubmit={handleAdd} className="flex gap-4 items-end bg-muted/20 p-4 rounded-lg border border-border/50">
                <div className="flex-1 space-y-1">
                    <label className="text-xs text-muted-foreground">Nome</label>
                    <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nome" required />
                </div>
                <div className="flex-1 space-y-1">
                    <label className="text-xs text-muted-foreground">Cargo (ex: Admin, Mod)</label>
                    <Input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="Cargo" required />
                </div>
                <div className="flex-1 space-y-1">
                    <label className="text-xs text-muted-foreground">Nick Mine</label>
                    <Input value={form.minecraft_nick} onChange={e => setForm({ ...form, minecraft_nick: e.target.value })} placeholder="Notch" required />
                </div>
                <div className="flex-1 space-y-1">
                    <label className="text-xs text-muted-foreground">URL da Foto (opcional)</label>
                    <Input value={form.photo_url} onChange={e => setForm({ ...form, photo_url: e.target.value })} placeholder="https://..." />
                </div>
                <Button type="submit"><Plus className="w-4 h-4 mr-2" /> Adicionar</Button>
            </form>

            {loading ? <Loader2 className="animate-spin text-neon-purple mx-auto" /> : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nick</TableHead>
                            <TableHead>Nome</TableHead>
                            <TableHead>Cargo</TableHead>
                            <TableHead>Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {members.map((m) => (
                            <TableRow key={m.id}>
                                <TableCell>
                                    <img src={m.photo_url || `https://minotar.net/helm/${m.minecraft_nick}/24.png`} className="w-6 h-6 inline-block mr-2 rounded object-cover" />
                                    {m.minecraft_nick}
                                </TableCell>
                                <TableCell>{m.name}</TableCell>
                                <TableCell className="text-neon-cyan font-bold">{m.role}</TableCell>
                                <TableCell>
                                    <Button size="sm" variant="destructive" onClick={() => handleDelete(m.id)}>
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
