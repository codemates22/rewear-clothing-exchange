import { Button } from "@/components/ui/button";
import { Recycle, Users, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-background/90" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Sustainable Fashion{" "}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              Reimagined
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join our community of eco-conscious fashion lovers. Swap, share, and discover 
            amazing clothing while reducing textile waste.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button variant="hero" size="lg" className="text-lg px-8 py-3">
              <Sparkles className="h-5 w-5" />
              Start Swapping
            </Button>
            <Button variant="heroOutline" size="lg" className="text-lg px-8 py-3">
              Browse Items
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <Recycle className="h-8 w-8 text-primary" />
              </div>
              <div className="text-3xl font-bold text-primary">2,500+</div>
              <div className="text-muted-foreground">Items Exchanged</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <div className="text-3xl font-bold text-primary">1,200+</div>
              <div className="text-muted-foreground">Community Members</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <div className="text-3xl font-bold text-primary">95%</div>
              <div className="text-muted-foreground">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;