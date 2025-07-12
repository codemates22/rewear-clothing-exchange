import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Heart, MapPin, Calendar, Package, ArrowLeftRight } from 'lucide-react';
import Header from '@/components/Header';

interface Item {
  id: string;
  title: string;
  description?: string;
  category: string;
  item_type: string;
  size: string;
  condition: string;
  tags: string[];
  images: string[];
  points_value: number;
  status: string;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string;
    location: string;
    avatar_url: string;
  } | null;
}

interface UserItem {
  id: string;
  title: string;
  images: string[];
}

const ItemDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [item, setItem] = useState<Item | null>(null);
  const [userItems, setUserItems] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [swapType, setSwapType] = useState<'item' | 'points'>('item');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      fetchItem();
      if (user) {
        fetchUserItems();
      }
    }
  }, [id, user]);

  const fetchItem = async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select(`
          *,
          profiles!items_user_id_fkey(full_name, location, avatar_url)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching item:', error);
        navigate('/browse');
      } else {
        setItem(data as any);
      }
    } catch (error) {
      console.error('Error fetching item:', error);
      navigate('/browse');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserItems = async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('id, title, images')
        .eq('user_id', user?.id)
        .eq('status', 'available');

      if (error) {
        console.error('Error fetching user items:', error);
      } else {
        setUserItems(data || []);
      }
    } catch (error) {
      console.error('Error fetching user items:', error);
    }
  };

  const handleSwapRequest = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to request swaps",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    if (item?.user_id === user.id) {
      toast({
        title: "Invalid action",
        description: "You cannot swap with your own item",
        variant: "destructive"
      });
      return;
    }

    if (swapType === 'item' && !selectedItemId) {
      toast({
        title: "Item required",
        description: "Please select an item to offer for swap",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('swap_requests')
        .insert({
          requester_id: user.id,
          owner_id: item?.user_id,
          requested_item_id: item?.id,
          offered_item_id: swapType === 'item' ? selectedItemId : null,
          is_point_swap: swapType === 'points',
          message: message.trim() || null
        });

      if (error) {
        throw error;
      }

      // Create notification for item owner
      await supabase
        .from('notifications')
        .insert({
          user_id: item?.user_id,
          title: 'New Swap Request',
          message: `Someone wants to swap for your item: ${item?.title}`,
          type: 'swap_request',
          related_id: item?.id
        });

      toast({
        title: "Success!",
        description: "Your swap request has been sent"
      });

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error creating swap request:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send swap request",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="h-96 bg-muted rounded"></div>
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-32 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Item not found</h3>
            <p className="text-muted-foreground mb-4">The item you're looking for doesn't exist</p>
            <Button onClick={() => navigate('/browse')}>Browse Items</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg">
              {item.images && item.images.length > 0 ? (
                <img
                  src={item.images[currentImageIndex]}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Package className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>
            
            {item.images && item.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {item.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-square overflow-hidden rounded border-2 ${
                      currentImageIndex === index ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${item.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Item Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{item.title}</h1>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary">{item.category}</Badge>
                <Badge variant="outline">{item.item_type}</Badge>
                <Badge variant="outline">Size {item.size}</Badge>
                <Badge variant={item.condition === 'new' ? 'default' : 'secondary'}>
                  {item.condition.replace('_', ' ')}
                </Badge>
              </div>
              
              <div className="flex items-center text-lg font-semibold text-primary mb-4">
                <Heart className="h-5 w-5 mr-2" />
                {item.points_value} Points
              </div>
            </div>

            {/* Owner Info */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={item.profiles?.avatar_url} />
                    <AvatarFallback>
                      {item.profiles?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{item.profiles?.full_name}</h3>
                    {item.profiles?.location && (
                      <p className="text-sm text-muted-foreground flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {item.profiles.location}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {item.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            )}

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Item Info */}
            <div className="text-sm text-muted-foreground">
              <div className="flex items-center mb-2">
                <Calendar className="h-4 w-4 mr-2" />
                Listed on {new Date(item.created_at).toLocaleDateString()}
              </div>
            </div>

            {/* Swap Actions */}
            {user && item.user_id !== user.id && item.status === 'available' && (
              <Card>
                <CardHeader>
                  <CardTitle>Request Swap</CardTitle>
                  <CardDescription>Choose how you'd like to swap for this item</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select value={swapType} onValueChange={(value: 'item' | 'points') => setSwapType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="item">Trade with my item</SelectItem>
                      <SelectItem value="points">Buy with points</SelectItem>
                    </SelectContent>
                  </Select>

                  {swapType === 'item' && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">Select your item to offer</label>
                      <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose an item to offer" />
                        </SelectTrigger>
                        <SelectContent>
                          {userItems.map((userItem) => (
                            <SelectItem key={userItem.id} value={userItem.id}>
                              {userItem.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {userItems.length === 0 && (
                        <p className="text-sm text-muted-foreground mt-1">
                          You don't have any available items to trade. 
                          <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/add-item')}>
                            Add an item
                          </Button>
                        </p>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium mb-2 block">Message (Optional)</label>
                    <Textarea
                      placeholder="Add a message to the item owner..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <Button 
                    onClick={handleSwapRequest} 
                    className="w-full" 
                    disabled={submitting || (swapType === 'item' && !selectedItemId)}
                  >
                    <ArrowLeftRight className="h-4 w-4 mr-2" />
                    {submitting ? 'Sending Request...' : 'Send Swap Request'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Status Messages */}
            {!user && (
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-muted-foreground mb-4">Sign in to request swaps</p>
                  <Button onClick={() => navigate('/auth')}>Sign In</Button>
                </CardContent>
              </Card>
            )}

            {user && item.user_id === user.id && (
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-muted-foreground">This is your item</p>
                </CardContent>
              </Card>
            )}

            {item.status !== 'available' && (
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-muted-foreground">This item is no longer available for swap</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;