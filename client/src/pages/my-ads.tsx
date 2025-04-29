import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreateAdModal } from '@/components/modals/CreateAdModal';
import { useNostrAuth } from '@/hooks/useNostrAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Ad } from '@shared/schema';
import { PlusCircle, Edit, Trash2, ExternalLink } from 'lucide-react';

export default function MyAdsPage() {
  const [, setLocation] = useLocation();
  const { user } = useNostrAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  
  // Fetch user's ads
  const { data: ads, isLoading } = useQuery({
    queryKey: ['/api/ads/user', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await fetch(`/api/ads/user/${user.id}`);
      if (!res.ok) throw new Error('Failed to fetch ads');
      return res.json();
    },
    enabled: !!user?.id,
  });
  
  // Delete ad mutation
  const deleteAdMutation = useMutation({
    mutationFn: async (adId: number) => {
      const res = await apiRequest('DELETE', `/api/ads/${adId}`);
      return res.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ads/user', user?.id] });
      toast({
        title: "Ad deleted",
        description: "Your ad has been successfully deleted",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error deleting ad",
        description: error instanceof Error ? error.message : "Failed to delete ad",
      });
    },
  });
  
  // Update ad status mutation
  const updateAdStatusMutation = useMutation({
    mutationFn: async ({ adId, status }: { adId: number, status: string }) => {
      const res = await apiRequest('PATCH', `/api/ads/${adId}`, { status });
      return res.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ads/user', user?.id] });
      toast({
        title: "Status updated",
        description: "Ad status has been updated",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error updating status",
        description: error instanceof Error ? error.message : "Failed to update status",
      });
    },
  });
  
  const handleDeleteAd = (adId: number) => {
    if (confirm('Are you sure you want to delete this ad?')) {
      deleteAdMutation.mutate(adId);
    }
  };
  
  const toggleAdStatus = (ad: Ad) => {
    const newStatus = ad.status === 'active' ? 'paused' : 'active';
    updateAdStatusMutation.mutate({ adId: ad.id, status: newStatus });
  };
  
  // Filter ads by status
  const activeAds = ads?.filter((ad: Ad) => ad.status === 'active') || [];
  const pendingAds = ads?.filter((ad: Ad) => ad.status === 'pending') || [];
  const pausedAds = ads?.filter((ad: Ad) => ad.status === 'paused' || ad.status === 'ended') || [];

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  
  const renderAdCard = (ad: Ad) => (
    <Card key={ad.id} className="mb-4">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row">
          <div className="sm:w-1/4 mb-3 sm:mb-0">
            <div className="w-full h-24 sm:h-20 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden flex items-center justify-center">
              {ad.imageUrl ? (
                <img 
                  src={ad.imageUrl} 
                  alt={ad.title} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <span className="text-gray-400 text-xl">{ad.title.charAt(0)}</span>
              )}
            </div>
          </div>
          
          <div className="sm:w-2/4 sm:px-4">
            <h3 className="font-medium">{ad.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {truncateText(ad.description, 100)}
            </p>
            <div className="flex mt-2">
              <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded mr-2">
                {ad.budget.toLocaleString()} sats
              </span>
              <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded mr-2">
                {ad.duration} days
              </span>
              {ad.tags && ad.tags.split(',').map((tag, i) => (
                <span key={i} className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded mr-2">
                  {tag.trim()}
                </span>
              ))}
            </div>
          </div>
          
          <div className="sm:w-1/4 mt-3 sm:mt-0 flex sm:flex-col sm:items-end justify-between">
            <div className="text-center sm:text-right">
              <div className="text-xs text-gray-500 dark:text-gray-400">Created on</div>
              <div className="text-sm">{formatDate(ad.createdAt)}</div>
            </div>
            
            <div className="flex sm:mt-auto">
              <Button
                variant="outline"
                size="sm"
                className="mr-1"
                onClick={() => window.open(ad.targetUrl, '_blank')}
              >
                <ExternalLink size={16} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="mr-1"
                onClick={() => console.log('Edit ad', ad.id)}
              >
                <Edit size={16} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteAd(ad.id)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex space-x-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Impressions</p>
              <p className="font-medium">{ad.impressions}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Clicks</p>
              <p className="font-medium">{ad.clicks}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">CTR</p>
              <p className="font-medium">
                {ad.impressions > 0 ? Math.round((ad.clicks / ad.impressions) * 100) : 0}%
              </p>
            </div>
          </div>
          
          <div>
            <Button 
              variant={ad.status === 'active' ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleAdStatus(ad)}
            >
              {ad.status === 'active' ? 'Pause Ad' : 'Activate Ad'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Ads</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your advertisements</p>
        </div>
        
        <Button 
          className="mt-4 md:mt-0 flex items-center" 
          onClick={() => setCreateModalOpen(true)}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Ad
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">
            All Ads <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{ads?.length || 0}</span>
          </TabsTrigger>
          <TabsTrigger value="active">
            Active <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{activeAds.length}</span>
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{pendingAds.length}</span>
          </TabsTrigger>
          <TabsTrigger value="paused">
            Paused <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{pausedAds.length}</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading your ads...</p>
            </div>
          ) : ads?.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">You don't have any ads yet. Create one to get started!</p>
                <Button 
                  className="mt-4" 
                  onClick={() => setCreateModalOpen(true)}
                >
                  Create First Ad
                </Button>
              </CardContent>
            </Card>
          ) : (
            ads?.map((ad: Ad) => renderAdCard(ad))
          )}
        </TabsContent>
        
        <TabsContent value="active">
          {activeAds.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">You don't have any active ads.</p>
                <Button 
                  className="mt-4" 
                  onClick={() => setCreateModalOpen(true)}
                >
                  Create New Ad
                </Button>
              </CardContent>
            </Card>
          ) : (
            activeAds.map((ad: Ad) => renderAdCard(ad))
          )}
        </TabsContent>
        
        <TabsContent value="pending">
          {pendingAds.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">You don't have any pending ads.</p>
              </CardContent>
            </Card>
          ) : (
            pendingAds.map((ad: Ad) => renderAdCard(ad))
          )}
        </TabsContent>
        
        <TabsContent value="paused">
          {pausedAds.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">You don't have any paused ads.</p>
              </CardContent>
            </Card>
          ) : (
            pausedAds.map((ad: Ad) => renderAdCard(ad))
          )}
        </TabsContent>
      </Tabs>
      
      <CreateAdModal 
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </DashboardLayout>
  );
}
