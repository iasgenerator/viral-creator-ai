import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Video, LayoutDashboard, Link2, Plus } from "lucide-react";

const Navbar = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/create", label: "Créer", icon: Plus },
    { path: "/connections", label: "Connexions", icon: Link2 },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Video className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">ViralAI</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant={isActive(item.path) ? "secondary" : "ghost"}
              size="sm"
              asChild
            >
              <Link to={item.path} className="flex items-center gap-2">
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="hero" size="sm" asChild>
            <Link to="/dashboard">Commencer</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
