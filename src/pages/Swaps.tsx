import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Check, X, Package, ArrowLeftRight, Clock } from 'lucide-react';
import Header from '@/components/Header';

interface SwapRequest {
  id: string;
  status: string;
  is_point_swap: boolean;
  message: string;
  created_at: string;
  requester_id: string;
  owner_id: string;
  requested_item: {
    id: string;
    title: string;
    images: string[];
    points_value: number;
  } | null;
  offered_item: {
    id: string;
    title: string;
    images: string[];
  } | null;
  requester: {
    full_name: string;
    avatar_url: string;
  } | null;
  owner: {
    full_name: string;
    avatar_url: string;
  } | null;
}

const Swaps = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSwapRequests();
    }
  }, [user]);

  const fetchSwapRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('swap_requests')
        .select(`
          *,
          requested_item:items!swap_requests_requested_item_id_fkey(id, title, images, points_value),
          offered_item:items!swap_requests_offered_item_id_fkey(id, title, images),
          requester:profiles!swap_requests_requester_id_fkey(full_name, avatar_url),
          owner:profiles!swap_requests_owner_id_fkey(full_name, avatar_url)
        `)
        .or(`requester_id.eq.${user?.id},owner_id.eq.${user?.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching swap requests:', error);
      } else {
        setSwapRequests((data as any) || []);
      }
    } catch (error) {
      console.error('Error fetching swap requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwapAction = async (swapId: string, action: 'accept' | 'decline') => {
    try {
      const { error } = await supabase
        .from('swap_requests')
        .update({ status: action === 'accept' ? 'accepted' : 'declined' })
        .eq('id', swapId);

      if (error) {
        throw error;
      }

      // Create notification for requester
      const swapRequest = swapRequests.find(s => s.id === swapId);
      if (swapRequest) {
        await supabase
          .from('notifications')
          .insert({
            user_id: swapRequest.requester_id,
            title: `Swap Request ${action === 'accept' ? 'Accepted' : 'Declined'}`,
            message: `Your swap request for "${swapRequest.requested_item?.title}" has been ${action}ed`,
            type: action === 'accept' ? 'swap_accepted' : 'swap_declined',
            related_id: swapId
          });
      }

      toast({
        title: "Success!",
        description: `Swap request ${action}ed successfully`
      });

      fetchSwapRequests();
    } catch (error: any) {
      console.error(`Error ${action}ing swap:`, error);
      toast({
        title: "Error",
        description: error.message || `Failed to ${action} swap request`,
        variant: "destructive"
      });
    }
  };

  const completeSwap = async (swapId: string) => {
    try {
      const { error } = await supabase.rpc('complete_swap', {
        swap_request_id: swapId
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Success!",
        description: "Swap completed successfully!"
      });

      fetchSwapRequests();
    } catch (error: any) {
      console.error('Error completing swap:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to complete swap",
        variant: "destructive"
      });
    }
  };

  const getSwapRequestsByStatus = (status: string) => {
    return swapRequests.filter(swap => swap.status === status);
  };

  const getIncomingRequests = () => {
    return swapRequests.filter(swap => 
      swap.owner_id === user?.id && swap.status === 'pending'
    );
  };

  const getOutgoingRequests = () => {
    return swapRequests.filter(swap => 
      swap.requester_id === user?.id
    );
  };

  const renderSwapCard = (swap: SwapRequest, showActions = false) => (
    <Card key={swap.id} className="mb-4">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
            {swap.requested_item?.images && swap.requested_item.images.length > 0 ? (
              <img 
                src={swap.requested_item.images[0]} 
                alt={swap.requested_item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold truncate">{swap.requested_item?.title}</h3>
              <Badge variant={
                swap.status === 'pending' ? 'secondary' :
                swap.status === 'accepted' ? 'default' :
                swap.status === 'completed' ? 'default' : 'destructive'
              }>
                {swap.status}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4 mb-3">
              <div className="flex items-center space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={
                    swap.owner_id === user?.id ? swap.requester?.avatar_url : swap.owner?.avatar_url
                  } />
                  <AvatarFallback>
                    {(swap.owner_id === user?.id ? swap.requester?.full_name : swap.owner?.full_name)?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">
                  {swap.owner_id === user?.id ? 'From' : 'To'}: {
                    swap.owner_id === user?.id ? swap.requester?.full_name : swap.owner?.full_name
                  }
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                {new Date(swap.created_at).toLocaleDateString()}
              </span>
            </div>
            
            <div className="flex items-center space-x-2 mb-3">
              {swap.is_point_swap ? (
                <div className="flex items-center space-x-2">
                  <ArrowLeftRight className="h-4 w-4 text-primary" />
                  <span className="text-sm">Point swap ({swap.requested_item?.points_value} pts)</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <ArrowLeftRight className="h-4 w-4 text-primary" />
                  <span className="text-sm">Item swap</span>
                  {swap.offered_item && (
                    <span className="text-sm text-muted-foreground">
                      for "{swap.offered_item.title}"
                    </span>
                  )}
                </div>
              )}
            </div>
            
            {swap.message && (
              <p className="text-sm text-muted-foreground mb-3 italic">
                "{swap.message}"
              </p>
            )}
            
            {showActions && swap.status === 'pending' && swap.owner_id === user?.id && (
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  onClick={() => handleSwapAction(swap.id, 'accept')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Accept
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleSwapAction(swap.id, 'decline')}
                >
                  <X className="h-4 w-4 mr-1" />
                  Decline
                </Button>
              </div>
            )}
            
            {swap.status === 'accepted' && (
              <Button 
                size="sm" 
                onClick={() => completeSwap(swap.id)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Mark as Completed
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

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
          <h1 className="text-3xl font-bold mb-2">Swap Requests</h1>
          <p className="text-muted-foreground">Manage your incoming and outgoing swap requests</p>
        </div>

        <Tabs defaultValue="incoming" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="incoming">
              Incoming ({getIncomingRequests().length})
            </TabsTrigger>
            <TabsTrigger value="outgoing">
              Outgoing ({getOutgoingRequests().length})
            </TabsTrigger>
            <TabsTrigger value="active">
              Active ({getSwapRequestsByStatus('accepted').length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({getSwapRequestsByStatus('completed').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="incoming" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Incoming Requests</CardTitle>
                <CardDescription>People who want to swap for your items</CardDescription>
              </CardHeader>
              <CardContent>
                {getIncomingRequests().length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No incoming swap requests</p>
                  </div>
                ) : (
                  getIncomingRequests().map(swap => renderSwapCard(swap, true))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="outgoing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Outgoing Requests</CardTitle>
                <CardDescription>Your requests to swap for other people's items</CardDescription>
              </CardHeader>
              <CardContent>
                {getOutgoingRequests().length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No outgoing swap requests</p>
                  </div>
                ) : (
                  getOutgoingRequests().map(swap => renderSwapCard(swap))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Swaps</CardTitle>
                <CardDescription>Accepted swaps ready to be completed</CardDescription>
              </CardHeader>
              <CardContent>
                {getSwapRequestsByStatus('accepted').length === 0 ? (
                  <div className="text-center py-8">
                    <ArrowLeftRight className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No active swaps</p>
                  </div>
                ) : (
                  getSwapRequestsByStatus('accepted').map(swap => renderSwapCard(swap))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Completed Swaps</CardTitle>
                <CardDescription>Your swap history</CardDescription>
              </CardHeader>
              <CardContent>
                {getSwapRequestsByStatus('completed').length === 0 ? (
                  <div className="text-center py-8">
                    <Check className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No completed swaps yet</p>
                  </div>
                ) : (
                  getSwapRequestsByStatus('completed').map(swap => renderSwapCard(swap))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Swaps;