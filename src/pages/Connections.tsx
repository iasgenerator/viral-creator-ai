import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Youtube, Instagram, Video, Unlink } from "lucide-react";
import { toast } from "sonner";

interface PlatformConnection {
  id: string;
  platform: "youtube" | "tiktok" | "instagram";
  account_name: string | null;
  is_active: boolean | null;
  created_at: string;
}

export default function Connections() {
  const navigate = useNavigate();
  const [connections, setConnections] = useState<PlatformConnection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    fetchConnections();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
    }
  };

  const fetchConnections = async () => {
    try {
      const { data, error } = await supabase
        .from("platform_connections")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setConnections(data || []);
    } catch (error: any) {
      toast.error("Erreur lors du chargement des connexions");
    } finally {
      setLoading(false);
    }
  };

  const connectPlatform = async (platform: "youtube" | "tiktok" | "instagram") => {
    try {
      const { data, error } = await supabase.functions.invoke("oauth-connect", {
        body: { platform }
      });

      if (error) throw error;
      
      if (data?.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (error: any) {
      toast.error(`Erreur lors de la connexion à ${platform}`);
    }
  };

  const disconnectPlatform = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from("platform_connections")
        .delete()
        .eq("id", connectionId);

      if (error) throw error;
      
      toast.success("Compte déconnecté");
      fetchConnections();
    } catch (error: any) {
      toast.error("Erreur lors de la déconnexion");
    }
  };

  const platforms = [
    {
      id: "youtube" as const,
      name: "YouTube",
      icon: Youtube,
      color: "text-red-500",
      description: "Connectez votre chaîne YouTube pour publier automatiquement vos Shorts"
    },
    {
      id: "tiktok" as const,
      name: "TikTok",
      icon: Video,
      color: "text-pink-500",
      description: "Connectez votre compte TikTok pour publier vos vidéos"
    },
    {
      id: "instagram" as const,
      name: "Instagram",
      icon: Instagram,
      color: "text-purple-500",
      description: "Connectez votre compte Instagram pour publier vos Reels"
    }
  ];

  const isConnected = (platformId: string) => {
    return connections.find(c => c.platform === platformId && c.is_active);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Connexions</h1>
            <p className="text-muted-foreground">
              Connectez vos comptes pour publier automatiquement vos vidéos
            </p>
          </div>

          <div className="grid gap-6">
            {platforms.map((platform) => {
              const connection = isConnected(platform.id);
              const Icon = platform.icon;

              return (
                <Card key={platform.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className={`h-8 w-8 ${platform.color}`} />
                        <div>
                          <CardTitle>{platform.name}</CardTitle>
                          <CardDescription>{platform.description}</CardDescription>
                        </div>
                      </div>
                      {connection && (
                        <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                          Connecté
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {connection ? (
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          Compte: {connection.account_name || "Non spécifié"}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => disconnectPlatform(connection.id)}
                        >
                          <Unlink className="h-4 w-4 mr-2" />
                          Déconnecter
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => connectPlatform(platform.id)}
                        className="w-full"
                      >
                        Connecter {platform.name}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
