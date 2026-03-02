import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ForumManager() {
    const { toast } = useToast();
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPosts = async () => {
        try {
            const res = await fetch("/api/forum");
            if (res.ok) {
                const textData = await res.text();
                setPosts(textData ? JSON.parse(textData) : []);
            }
        } catch {
            toast({ title: "Erro ao buscar fórum", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm("Tem certeza que deseja excluir este post?")) return;
        try {
            const res = await fetch(`/api/forum/${id}`, { method: "DELETE" });
            if (res.ok) {
                toast({ title: "Post excluído!" });
                fetchPosts();
            }
        } catch {
            toast({ title: "Erro ao excluir", variant: "destructive" });
        }
    };

    if (loading) return <Loader2 className="animate-spin text-neon-purple mx-auto my-8" />;

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-display font-bold">Gerenciar Fórum</h2>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Autor</TableHead>
                        <TableHead>Título</TableHead>
                        <TableHead>Mensagem</TableHead>
                        <TableHead>Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {posts.map((post) => (
                        <TableRow key={post.id}>
                            <TableCell>
                                <Badge variant="outline" className={post.type === "denuncia" ? "text-red-400" : "text-neon-cyan"}>
                                    {post.type.toUpperCase()}
                                </Badge>
                            </TableCell>
                            <TableCell>{post.author}</TableCell>
                            <TableCell className="max-w-[150px] truncate">{post.title}</TableCell>
                            <TableCell className="max-w-[250px] truncate text-xs text-muted-foreground">{post.content}</TableCell>
                            <TableCell>
                                <Button size="sm" variant="destructive" onClick={() => handleDelete(post.id)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                    {posts.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground py-8">Nenhum post no fórum</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
