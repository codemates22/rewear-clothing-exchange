import { Upload, Search, RefreshCw, Coins } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "List Your Items",
    description: "Upload photos and details of clothing items you no longer wear. Each listing earns you points."
  },
  {
    icon: Search,
    title: "Browse & Discover",
    description: "Explore our community marketplace to find unique pieces that match your style and size."
  },
  {
    icon: RefreshCw,
    title: "Swap or Redeem",
    description: "Send swap requests for direct exchanges or use your points to claim items instantly."
  },
  {
    icon: Coins,
    title: "Earn & Enjoy",
    description: "Build your sustainable wardrobe while earning points for every successful exchange."
  }
];

const HowItWorks = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">How ReWear Works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join the sustainable fashion revolution in four simple steps. 
            It's easy, rewarding, and makes a positive impact.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto bg-gradient-primary rounded-full flex items-center justify-center shadow-card group-hover:shadow-glow transition-all duration-300">
                  <step.icon className="h-10 w-10 text-primary-foreground" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center text-sm font-bold text-accent-foreground">
                  {index + 1}
                </div>
              </div>
              
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;