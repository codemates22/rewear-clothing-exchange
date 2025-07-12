import { Button } from "@/components/ui/button";
import { Heart, Search, User, Plus, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <Heart className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            ReWear
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/browse" className="text-foreground hover:text-primary transition-colors">
            Browse
          </Link>
          {user && (
            <>
              <Link to="/dashboard" className="text-foreground hover:text-primary transition-colors">
                Dashboard
              </Link>
              <Link to="/swaps" className="text-foreground hover:text-primary transition-colors">
                Swaps
              </Link>
            </>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link to="/add-item">
                <Button variant="heroOutline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  List Item
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => signOut()}>
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button>Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;