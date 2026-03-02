import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StaffMember {
    id: number;
    name: string;
    role: string;
    minecraft_nick: string;
    photo_url?: string;
}

const Staff = () => {
    const { toast } = useToast();
    const [members, setMembers] = useState<StaffMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchStaff = async () => {
        try {
            const res = await fetch("/api/staff");
            if (!res.ok) throw new Error("Erro ao carregar a equipe");
            const textData = await res.text();
            const data = textData ? JSON.parse(textData) : [];
            if (Array.isArray(data)) {
                setMembers(data);
            } else {
                throw new Error(data.error || "Erro ao carregar a equipe");
            }
        } catch (error: any) {
            toast({ title: "Erro", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    return (
        <div className="min-h-screen bg-background pt-24 px-4 pb-20">
            <div className="max-w-5xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                    <ShieldCheck className="w-16 h-16 mx-auto text-neon-purple animate-pulse" />
                    <h1 className="text-4xl md:text-5xl font-display font-bold tracking-wider text-foreground">
                        EQUIPE COVARIUM
                    </h1>
                    <p className="text-muted-foreground font-body max-w-2xl mx-auto">
                        Conheça os responsáveis por manter a ordem e a diversão no servidor.
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="w-8 h-8 animate-spin text-neon-purple" />
                    </div>
                ) : members.length === 0 ? (
                    <div className="text-center p-12 border border-border/50 border-dashed rounded-xl bg-muted/20">
                        <p className="text-muted-foreground font-body">Nenhum membro da equipe foi cadastrado ainda.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {members.map((member) => (
                            <Card key={member.id} className="border-border/50 bg-card hover:-translate-y-2 hover:border-neon-purple/50 transition-all duration-300 text-center relative overflow-hidden group">
                                {/* Background glow based on hover */}
                                <div className="absolute inset-0 bg-gradient-to-t from-neon-purple/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <CardHeader className="pt-8 pb-2 relative z-10">
                                    <div className="mx-auto w-24 h-24 mb-4 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.5)] border-2 border-border/50 group-hover:border-neon-purple/50 transition-colors">
                                        <img
                                            src={member.photo_url || `https://minotar.net/helm/${member.minecraft_nick}/100.png`}
                                            alt={member.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <CardTitle className="font-display text-xl tracking-wider text-foreground">
                                        {member.name}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pb-8 relative z-10">
                                    <span className="inline-block px-4 py-1 rounded-full bg-neon-purple/20 text-neon-purple text-xs font-display font-bold tracking-wider uppercase">
                                        {member.role}
                                    </span>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Staff;
