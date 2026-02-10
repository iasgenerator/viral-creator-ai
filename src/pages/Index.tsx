import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Video, Sparkles, TrendingUp, Zap, ArrowRight, Play, Star } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">
        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary/10 blur-3xl animate-float" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-accent/10 blur-3xl animate-float" style={{ animationDelay: "3s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-hero opacity-50" />
        </div>

        <div className="relative container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div className="opacity-0 animate-fade-up inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-sm text-primary font-medium">
              <Sparkles className="h-4 w-4" />
              Propulsé par l'intelligence artificielle
            </div>

            {/* Title */}
            <h1 className="opacity-0 animate-fade-up-delay-1 text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[0.9]">
              Créez des vidéos{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                virales
              </span>
              <br />
              en quelques clics
            </h1>

            {/* Subtitle */}
            <p className="opacity-0 animate-fade-up-delay-2 text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Générez automatiquement des TikToks et YouTube Shorts monétisables grâce à l'IA
            </p>

            {/* CTA Buttons */}
            <div className="opacity-0 animate-fade-up-delay-3 flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button variant="hero" size="lg" className="group text-lg px-8 py-6 animate-pulse-glow" asChild>
                <Link to="/dashboard">
                  Commencer gratuitement
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 group" asChild>
                <Link to="/create">
                  <Play className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                  Voir une démo
                </Link>
              </Button>
            </div>

            {/* Social proof */}
            <div className="opacity-0 animate-fade-up-delay-3 flex items-center justify-center gap-6 pt-8 text-sm text-muted-foreground">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-gradient-primary" />
                ))}
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <span>+2 000 créateurs actifs</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 md:py-36">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20 space-y-4">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
              Fonctionnalités
            </span>
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight">
              Tout pour devenir{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">viral</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Des outils puissants pour créer, optimiser et publier du contenu qui cartonne
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Sparkles,
                title: "IA Créative",
                desc: "Scripts et visuels générés automatiquement pour captiver votre audience",
                delay: "0",
              },
              {
                icon: Video,
                title: "Multi-plateforme",
                desc: "Publication automatique sur YouTube, TikTok et Instagram",
                delay: "1",
              },
              {
                icon: TrendingUp,
                title: "Monétisation",
                desc: "Algorithme optimisé pour maximiser vos vues et revenus",
                delay: "2",
              },
              {
                icon: Zap,
                title: "Ultra Rapide",
                desc: "De l'idée à la vidéo publiée en moins de 5 minutes",
                delay: "3",
              },
            ].map((feature) => (
              <Card
                key={feature.title}
                className="group relative p-8 border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-glow hover:border-primary/30 transition-all duration-500 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 rounded-lg transition-opacity duration-500" />
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                    <feature.icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-border/40">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "10K+", label: "Vidéos créées" },
              { value: "2K+", label: "Créateurs actifs" },
              { value: "50M+", label: "Vues générées" },
              { value: "98%", label: "Satisfaction" },
            ].map((stat) => (
              <div key={stat.label} className="text-center space-y-2">
                <div className="text-4xl md:text-5xl font-extrabold bg-gradient-primary bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 md:py-36 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-hero" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-3xl animate-float" />
        </div>
        <div className="relative container mx-auto px-4 text-center space-y-8">
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Prêt à créer du contenu{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">viral</span> ?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Rejoignez des milliers de créateurs qui génèrent déjà des revenus avec notre plateforme
          </p>
          <Button variant="hero" size="lg" className="group text-lg px-10 py-7 animate-pulse-glow" asChild>
            <Link to="/dashboard">
              Commencer maintenant
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Video className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold">ViralAI</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link to="/cgu" className="hover:text-foreground transition-colors">CGU</Link>
            <Link to="/politique-confidentialite" className="hover:text-foreground transition-colors">Confidentialité</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
