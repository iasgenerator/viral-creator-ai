import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus, TrendingUp, Video, Calendar, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, scheduled: 0, published: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check auth
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      }
    });

    loadData();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadData = async () => {
    try {
      // Load projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;
      setProjects(projectsData || []);

      // Load stats
      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select('status');

      if (videosError) throw videosError;

      const stats = {
        total: videosData?.length || 0,
        scheduled: videosData?.filter(v => v.status === 'scheduled').length || 0,
        published: videosData?.filter(v => v.status === 'published').length || 0
      };
      setStats(stats);
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </Button>
            <Button asChild variant="hero">
              <Link to="/create">
                <Plus className="mr-2" />
                Nouveau projet
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="mb-8">
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Vidéos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Video className="text-primary" />
                  <div className="text-3xl font-bold">{stats.total}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  En attente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Calendar className="text-primary" />
                  <div className="text-3xl font-bold">{stats.scheduled}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Publiées
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className="text-primary" />
                  <div className="text-3xl font-bold">{stats.published}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Projects List */}
        <Card>
          <CardHeader>
            <CardTitle>Mes Projets</CardTitle>
            <CardDescription>
              Gérez vos projets de contenu viral
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                Chargement...
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>Aucun projet pour le moment</p>
                <p className="text-sm mt-2">Créez votre premier projet pour commencer</p>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{project.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{project.theme}</p>
                        <div className="flex gap-2 mt-2 text-xs">
                          <span className="px-2 py-1 bg-primary/10 text-primary rounded">
                            {project.platform}
                          </span>
                          <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded">
                            {project.duration}s
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(project.created_at).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
