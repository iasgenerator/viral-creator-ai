import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Create = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [platform, setPlatform] = useState("");
  const [duration, setDuration] = useState("");
  const [voiceType, setVoiceType] = useState("alloy");
  const [voiceTone, setVoiceTone] = useState("neutral");
  const [videoType, setVideoType] = useState("real");
  const [hasSubtitles, setHasSubtitles] = useState(true);
  const [language, setLanguage] = useState("fr");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      }
    });
  }, [navigate]);

  const handleGenerate = async () => {
    if (!theme || !title || !description || !platform || !duration) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    
    setLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Vous devez être connecté");
        navigate("/auth");
        return;
      }

      // Create project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          user_id: session.user.id,
          title,
          theme,
          description,
          platform,
          duration: parseInt(duration),
          voice_type: voiceType,
          voice_tone: voiceTone,
          video_type: videoType,
          has_subtitles: hasSubtitles,
          language: language
        })
        .select()
        .single();

      if (projectError) throw projectError;

      toast.success("Projet créé!", {
        description: "Génération de 10 vidéos en cours..."
      });

      // Trigger video generation
      const { data: functionData, error: functionError } = await supabase.functions.invoke('generate-videos', {
        body: { projectId: project.id }
      });

      if (functionError) throw functionError;

      toast.success("Vidéos générées!", {
        description: "10 vidéos seront publiées automatiquement aux heures optimales"
      });

      navigate("/dashboard");
    } catch (error: any) {
      console.error('Error:', error);
      toast.error("Erreur", {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
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
                <Label htmlFor="title">Titre du projet *</Label>
                <Input
                  id="title"
                  placeholder="Ex: Série productivité 2025"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

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

              <div className="space-y-4 pt-2 border-t">
                <h3 className="font-semibold text-sm">Options avancées</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="language">Langue du contenu</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">🇫🇷 Français</SelectItem>
                      <SelectItem value="en">🇬🇧 English</SelectItem>
                      <SelectItem value="es">🇪🇸 Español</SelectItem>
                      <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
                      <SelectItem value="it">🇮🇹 Italiano</SelectItem>
                      <SelectItem value="pt">🇵🇹 Português</SelectItem>
                      <SelectItem value="nl">🇳🇱 Nederlands</SelectItem>
                      <SelectItem value="pl">🇵🇱 Polski</SelectItem>
                      <SelectItem value="ru">🇷🇺 Русский</SelectItem>
                      <SelectItem value="ja">🇯🇵 日本語</SelectItem>
                      <SelectItem value="zh">🇨🇳 中文</SelectItem>
                      <SelectItem value="ar">🇸🇦 العربية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="voiceType">Type de voix IA</Label>
                    <Select value={voiceType} onValueChange={setVoiceType}>
                      <SelectTrigger id="voiceType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alloy">Alloy (Neutre)</SelectItem>
                        <SelectItem value="echo">Echo (Masculine)</SelectItem>
                        <SelectItem value="fable">Fable (Britannique)</SelectItem>
                        <SelectItem value="onyx">Onyx (Profonde)</SelectItem>
                        <SelectItem value="nova">Nova (Féminine)</SelectItem>
                        <SelectItem value="shimmer">Shimmer (Douce)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="voiceTone">Ton de la voix</Label>
                    <Select value={voiceTone} onValueChange={setVoiceTone}>
                      <SelectTrigger id="voiceTone">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="neutral">Neutre</SelectItem>
                        <SelectItem value="enthusiastic">Enthousiaste</SelectItem>
                        <SelectItem value="calm">Calme</SelectItem>
                        <SelectItem value="energetic">Énergique</SelectItem>
                        <SelectItem value="professional">Professionnel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="videoType">Type de vidéo</Label>
                    <Select value={videoType} onValueChange={setVideoType}>
                      <SelectTrigger id="videoType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="real">Vidéo réelle d'arrière-plan</SelectItem>
                        <SelectItem value="ai-generated">Générée par IA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subtitles">Sous-titres</Label>
                    <Select value={hasSubtitles ? "yes" : "no"} onValueChange={(v) => setHasSubtitles(v === "yes")}>
                      <SelectTrigger id="subtitles">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Avec sous-titres</SelectItem>
                        <SelectItem value="no">Sans sous-titres</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  variant="hero" 
                  size="lg" 
                  className="w-full"
                  onClick={handleGenerate}
                  disabled={loading}
                >
                  <Sparkles className="mr-2" />
                  {loading ? "Génération en cours..." : "Générer 10 vidéos avec l'IA"}
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  10 vidéos seront créées et publiées automatiquement aux heures optimales
                </p>
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
