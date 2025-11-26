import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const Create = () => {
  const [theme, setTheme] = useState("");
  const [description, setDescription] = useState("");
  const [platform, setPlatform] = useState("");
  const [duration, setDuration] = useState("");

  const handleGenerate = () => {
    if (!theme || !description || !platform || !duration) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    
    toast.success("Génération en cours...", {
      description: "Votre vidéo sera prête dans quelques instants"
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="mr-2" />
              Retour
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Créer un nouveau projet
            </h1>
            <p className="text-muted-foreground">
              Définissez votre thème et laissez l'IA créer du contenu viral
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="text-primary" />
                Configuration du projet
              </CardTitle>
              <CardDescription>
                Remplissez les informations pour générer votre vidéo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="theme">Thème de la vidéo *</Label>
                <Input
                  id="theme"
                  placeholder="Ex: Astuces productivité, Recettes rapides, Faits insolites..."
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description détaillée *</Label>
                <Textarea
                  id="description"
                  placeholder="Décrivez en détail le type de contenu que vous souhaitez créer..."
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Plus la description est précise, meilleur sera le résultat
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="platform">Plateforme *</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger id="platform">
                      <SelectValue placeholder="Sélectionner une plateforme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="instagram">Instagram Reels</SelectItem>
                      <SelectItem value="both">Les deux</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Durée *</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger id="duration">
                      <SelectValue placeholder="Sélectionner la durée" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 secondes</SelectItem>
                      <SelectItem value="30">30 secondes</SelectItem>
                      <SelectItem value="60">60 secondes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  variant="hero" 
                  size="lg" 
                  className="w-full"
                  onClick={handleGenerate}
                >
                  <Sparkles className="mr-2" />
                  Générer la vidéo avec l'IA
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="mt-6 bg-gradient-hero border-primary/20">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">💡 Conseils pour de meilleurs résultats</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Soyez spécifique dans votre description</li>
                <li>• Mentionnez le ton souhaité (humoristique, éducatif, inspirant...)</li>
                <li>• Précisez votre audience cible</li>
                <li>• Ajoutez des mots-clés pertinents pour votre niche</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Create;
