import { Swords, Crown, Shield } from "lucide-react";

const HeroBanner = () => {
  return (
    <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden px-4">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-neon-purple/10 via-background to-background" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-blue/10 rounded-full blur-[120px]" />

      <div className="relative z-10 text-center space-y-6">
        <div className="flex items-center justify-center gap-4 mb-4">
          <Shield className="w-10 h-10 text-neon-purple animate-float" />
          <Crown className="w-14 h-14 text-neon-blue animate-float" style={{ animationDelay: "1s" }} />
          <Swords className="w-10 h-10 text-neon-cyan animate-float" style={{ animationDelay: "2s" }} />
        </div>

        <h1 className="text-5xl md:text-7xl font-display font-black tracking-wider bg-gradient-to-r from-neon-purple via-neon-blue to-neon-cyan bg-clip-text text-transparent">
          COVARIUM
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground font-body max-w-md mx-auto">
          Loja oficial do servidor — Planos VIP, ClanTags e mais
        </p>

        <div className="flex gap-4 justify-center mt-4">
          <a
            href="#planos"
            className="inline-block px-8 py-3 rounded-lg font-display text-sm font-bold tracking-wider bg-gradient-to-r from-neon-purple to-neon-blue text-primary-foreground hover:opacity-90 transition-opacity animate-glow-pulse"
          >
            VER PLANOS
          </a>
          <a
            href="/forum"
            className="inline-block px-8 py-3 rounded-lg font-display text-sm font-bold tracking-wider border border-neon-purple/50 bg-background/50 backdrop-blur text-foreground hover:bg-neon-purple/10 transition-colors"
          >
            FÓRUM
          </a>
          <a
            href="/equipe"
            className="inline-block px-8 py-3 rounded-lg font-display text-sm font-bold tracking-wider border border-neon-cyan/50 bg-background/50 backdrop-blur text-foreground hover:bg-neon-cyan/10 transition-colors"
          >
            EQUIPE
          </a>
          <a
            href="/noticias"
            className="inline-block px-8 py-3 rounded-lg font-display text-sm font-bold tracking-wider border border-neon-blue/50 bg-background/50 backdrop-blur text-foreground hover:bg-neon-blue/10 transition-colors"
          >
            NOTÍCIAS
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
