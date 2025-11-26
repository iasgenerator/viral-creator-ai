import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Video, Sparkles, TrendingUp, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${heroBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-hero" />
        
        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Créez des vidéos virales avec{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                l'IA
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Générez automatiquement des TikToks et Reels Instagram monétisables à partir de vos thèmes
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" asChild>
                <Link to="/dashboard">
                  Commencer gratuitement
                </Link>
              </Button>
              <Button variant="outline" size="lg">
                Voir une démo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Pourquoi choisir notre plateforme ?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tout ce dont vous avez besoin pour créer du contenu viral
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 hover:shadow-card transition-shadow duration-300">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">IA Créative</h3>
              <p className="text-muted-foreground">
                Génération automatique de scripts et visuels captivants
              </p>
            </Card>

            <Card className="p-6 hover:shadow-card transition-shadow duration-300">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                <Video className="text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Multi-plateforme</h3>
              <p className="text-muted-foreground">
                Publication automatique sur TikTok et Instagram
              </p>
            </Card>

            <Card className="p-6 hover:shadow-card transition-shadow duration-300">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Monétisation</h3>
              <p className="text-muted-foreground">
                Optimisé pour maximiser vos revenus
              </p>
            </Card>

            <Card className="p-6 hover:shadow-card transition-shadow duration-300">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                <Zap className="text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Rapide</h3>
              <p className="text-muted-foreground">
                Créez des vidéos en quelques minutes
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Prêt à créer du contenu viral ?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers de créateurs qui génèrent déjà des revenus avec notre plateforme
          </p>
          <Button variant="hero" size="lg" asChild>
            <Link to="/dashboard">
              Commencer maintenant
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
