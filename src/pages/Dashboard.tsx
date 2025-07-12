import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Heart, Package, ArrowLeftRight, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';

interface Profile {
  id: string;
  full_name: string;
  avatar_url: string;
  location: string;
  points: number;
}

interface Item {
  id: string;
  title: string;
  category: string;
  condition: string;
  status: string;
  points_value: number;
  images: string[];
  created_at: string;
}

interface SwapRequest {
  id: string;
  status: string;
  is_point_swap: boolean;
  message: string;
  created_at: string;
  requested_item: {
    title: string;
    images: string[];
  } | null;
  requester: {
    full_name: string;
  } | null;
  owner: {
    full_name: string;
  } | null;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userItems, setUserItems] = useState<Item[]>([]);
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      } else {
        setProfile(profileData);
      }

      // Fetch user items
      const { data: itemsData, error: itemsError } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (itemsError) {
        console.error('Error fetching items:', itemsError);
      } else {
        setUserItems(itemsData || []);
      }

      // Fetch swap requests
      const { data: swapsData, error: swapsError } = await supabase
        .from('swap_requests')
        .select(`
          *,
          requested_item:items!swap_requests_requested_item_id_fkey(title, images),
          requester:profiles!swap_requests_requester_id_fkey(full_name),
          owner:profiles!swap_requests_owner_id_fkey(full_name)
        `)
        .or(`requester_id.eq.${user?.id},owner_id.eq.${user?.id}`)
        .order('created_at', { ascending: false });

      if (swapsError) {
        console.error('Error fetching swaps:', swapsError);
      } else {
        setSwapRequests((swapsData as any) || []);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {profile?.full_name || 'User'}!</h1>
          <p className="text-muted-foreground">Manage your items and track your swaps</p>
        </div>

        {/* Profile Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback>
                    {profile?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{profile?.full_name}</h3>
                  <p className="text-sm text-muted-foreground">{profile?.location || 'Location not set'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Heart className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{profile?.points || 0}</p>
                  <p className="text-sm text-muted-foreground">Points</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Package className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{userItems.length}</p>
                  <p className="text-sm text-muted-foreground">Items Listed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <ArrowLeftRight className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{swapRequests.filter(s => s.status === 'completed').length}</p>
                  <p className="text-sm text-muted-foreground">Completed Swaps</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Your Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Your Items</CardTitle>
                <Link to="/add-item">
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </Link>
              </div>
              <CardDescription>Manage your listed items</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {userItems.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No items listed yet</p>
                  <Link to="/add-item">
                    <Button className="mt-4">Add Your First Item</Button>
                  </Link>
                </div>
              ) : (
                userItems.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden">
                      {item.images && item.images.length > 0 ? (
                        <img 
                          src={item.images[0]} 
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{item.title}</h4>
                      <p className="text-sm text-muted-foreground capitalize">
                        {item.category} • {item.condition}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={item.status === 'available' ? 'default' : 'secondary'}>
                        {item.status}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">{item.points_value} pts</p>
                    </div>
                  </div>
                ))
              )}
              {userItems.length > 3 && (
                <div className="text-center pt-4">
                  <Link to="/my-items">
                    <Button variant="outline">View All Items</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Swap Requests */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Swap Requests</CardTitle>
              <CardDescription>Your latest swap activity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {swapRequests.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No swap requests yet</p>
                  <Link to="/browse">
                    <Button className="mt-4">Browse Items</Button>
                  </Link>
                </div>
              ) : (
                swapRequests.slice(0, 3).map((swap) => (
                  <div key={swap.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden">
                      {swap.requested_item?.images && swap.requested_item.images.length > 0 ? (
                        <img 
                          src={swap.requested_item.images[0]} 
                          alt={swap.requested_item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{swap.requested_item?.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {swap.is_point_swap ? 'Point swap' : 'Item swap'}
                      </p>
                    </div>
                    <Badge variant={
                      swap.status === 'pending' ? 'secondary' :
                      swap.status === 'accepted' ? 'default' :
                      swap.status === 'completed' ? 'default' : 'destructive'
                    }>
                      {swap.status}
                    </Badge>
                  </div>
                ))
              )}
              {swapRequests.length > 3 && (
                <div className="text-center pt-4">
                  <Link to="/swaps">
                    <Button variant="outline">View All Swaps</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;