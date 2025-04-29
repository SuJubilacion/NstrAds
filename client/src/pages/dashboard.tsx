import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreateAdModal } from '@/components/modals/CreateAdModal';
import { useNostrAuth } from '@/hooks/useNostrAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Ad } from '@shared/schema';
import { LayoutDashboard, Eye, MousePointer, Percent, PlusCircle, Edit, Trash2 } from 'lucide-react';

export default function DashboardPage() {
  const [, setLocation] = useLocation();
  const { user } = useNostrAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  
  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      setLocation('/login');
    }
  }, [user, setLocation]);
  
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
  
  const handleDeleteAd = (adId: number) => {
    // In a real app, show confirmation dialog
    if (confirm('Are you sure you want to delete this ad?')) {
      deleteAdMutation.mutate(adId);
    }
  };
  
  // Calculate stats
  const stats = {
    activeAds: ads?.filter(ad => ad.status === 'active')?.length || 0,
    totalImpressions: ads?.reduce((sum, ad) => sum + ad.impressions, 0) || 0,
    totalClicks: ads?.reduce((sum, ad) => sum + ad.clicks, 0) || 0,
    ctr: ads?.reduce((sum, ad) => sum + ad.clicks, 0) > 0 
      ? Math.round((ads?.reduce((sum, ad) => sum + ad.clicks, 0) / ads?.reduce((sum, ad) => sum + ad.impressions, 0)) * 100) 
      : 0
  };
  
  const truncateNpub = (npub: string) => {
    if (!npub) return '';
    return npub.substring(0, 8) + '...' + npub.substring(npub.length - 4);
  };
  
  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };
  
  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          {user && <p className="text-gray-600 dark:text-gray-400">{truncateNpub(user.npub)}</p>}
        </div>
        
        <Button 
          className="mt-4 md:mt-0 flex items-center" 
          onClick={() => setCreateModalOpen(true)}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Ad
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Active Ads</p>
                <h3 className="text-2xl font-bold mt-1">{stats.activeAds}</h3>
              </div>
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <LayoutDashboard className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-sm text-green-600 dark:text-green-400 mt-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 15l-6-6-6 6"/>
              </svg>
              Updated now
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Total Impressions</p>
                <h3 className="text-2xl font-bold mt-1">{stats.totalImpressions.toLocaleString()}</h3>
              </div>
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 15l-6-6-6 6"/>
              </svg>
              Refreshes automatically
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Total Clicks</p>
                <h3 className="text-2xl font-bold mt-1">{stats.totalClicks.toLocaleString()}</h3>
              </div>
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <MousePointer className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <p className="text-sm text-purple-600 dark:text-purple-400 mt-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 15l-6-6-6 6"/>
              </svg>
              Refreshes automatically
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">CTR Rate</p>
                <h3 className="text-2xl font-bold mt-1">{stats.ctr}%</h3>
              </div>
              <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <Percent className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <p className="text-sm text-green-600 dark:text-green-400 mt-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 15l-6-6-6 6"/>
              </svg>
              Calculated in real-time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Ads */}
      <h2 className="text-xl font-bold mb-4">Your Recent Ads</h2>
      <Card className="overflow-hidden">
        {isLoading ? (
          <CardContent className="p-8 text-center">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading your ads...</p>
          </CardContent>
        ) : ads?.length === 0 ? (
          <CardContent className="p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">You don't have any ads yet. Create one to get started!</p>
            <Button 
              className="mt-4" 
              onClick={() => setCreateModalOpen(true)}
            >
              Create First Ad
            </Button>
          </CardContent>
        ) : (
          <div>
            {ads?.map((ad: Ad) => (
              <div key={ad.id} className="border-b border-gray-200 dark:border-gray-700 last:border-0">
                <div className="p-4 flex flex-col md:flex-row md:items-center">
                  <div className="flex items-center md:w-1/3">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded flex-shrink-0 overflow-hidden flex items-center justify-center">
                      {ad.imageUrl ? (
                        <img 
                          src={ad.imageUrl} 
                          alt={ad.title} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <span className="text-gray-400">{ad.title.charAt(0)}</span>
                      )}
                    </div>
                    <div className="ml-3">
                      <h3 className="font-medium">{ad.title}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Created {formatDate(ad.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-3 md:mt-0 md:w-1/3 flex md:justify-center">
                    <div className="mr-4">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Impressions</p>
                      <p className="font-medium">{ad.impressions}</p>
                    </div>
                    <div className="mr-4">
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
                  
                  <div className="mt-3 md:mt-0 md:w-1/3 flex justify-between md:justify-end items-center">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      ad.status === 'active' 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                        : ad.status === 'pending' 
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                    }`}>
                      {ad.status.charAt(0).toUpperCase() + ad.status.slice(1)}
                    </span>
                    <div className="flex">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => console.log('Edit ad', ad.id)}
                        className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                      >
                        <Edit size={18} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteAd(ad.id)}
                        className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      
      <CreateAdModal 
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </DashboardLayout>
  );
}
