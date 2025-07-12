import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Star, ArrowRight } from "lucide-react";

// Mock data for featured items
const featuredItems = [
  {
    id: 1,
    title: "Vintage Denim Jacket",
    category: "Women",
    size: "M",
    condition: "Like New",
    points: 150,
    image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=500&fit=crop",
    user: "Sarah M.",
    rating: 4.9,
    tags: ["Vintage", "Denim", "Sustainable"]
  },
  {
    id: 2,
    title: "Designer Cotton Dress",
    category: "Women",
    size: "S",
    condition: "New",
    points: 200,
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=500&fit=crop",
    user: "Emma L.",
    rating: 5.0,
    tags: ["Designer", "Cotton", "Elegant"]
  },
  {
    id: 3,
    title: "Casual Polo Shirt",
    category: "Men",
    size: "L",
    condition: "Used",
    points: 80,
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=500&fit=crop",
    user: "Mike R.",
    rating: 4.7,
    tags: ["Casual", "Cotton", "Comfortable"]
  },
  {
    id: 4,
    title: "Knit Wool Sweater",
    category: "Women",
    size: "M",
    condition: "Like New",
    points: 120,
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=500&fit=crop",
    user: "Lisa K.",
    rating: 4.8,
    tags: ["Wool", "Cozy", "Winter"]
  }
];

const ItemCard = ({ item }: { item: typeof featuredItems[0] }) => {
  return (
    <div className="group relative bg-card rounded-xl overflow-hidden shadow-card hover:shadow-glow transition-all duration-300 transform hover:-translate-y-2">
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3">
          <Button variant="ghost" size="icon" className="bg-background/80 backdrop-blur-sm hover:bg-background/90">
            <Heart className="h-4 w-4" />
          </Button>
        </div>
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
            {item.condition}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg line-clamp-1">{item.title}</h3>
          <div className="text-lg font-bold text-primary">{item.points}pts</div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
          <span>{item.category} • Size {item.size}</span>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span>{item.rating}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {item.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">by {item.user}</span>
          <Button variant="default" size="sm">
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
};

const FeaturedItems = () => {
  return (
    <section className="py-16 bg-gradient-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Featured Items</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover amazing clothing pieces from our community members. 
            Each item tells a story and is ready for its next adventure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {featuredItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>

        <div className="text-center">
          <Button variant="heroOutline" size="lg">
            View All Items
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedItems;