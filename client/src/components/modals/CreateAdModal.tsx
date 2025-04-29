import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useNostrAuth } from '@/hooks/useNostrAuth';
import { apiRequest } from '@/lib/queryClient';
import { useQueryClient } from '@tanstack/react-query';
import { X, Upload, Check } from 'lucide-react';

interface CreateAdModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateAdModal({ isOpen, onClose }: CreateAdModalProps) {
  const { user } = useNostrAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [budget, setBudget] = useState('10000');
  const [duration, setDuration] = useState('7');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setImageUrl('');
    setTargetUrl('');
    setBudget('10000');
    setDuration('7');
    setTags('');
  };
  
  const handleClose = () => {
    onClose();
    // Don't reset immediately for better UX
    setTimeout(resetForm, 300);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!title) {
      toast({
        variant: "destructive",
        title: "Missing title",
        description: "Please enter an ad title",
      });
      return;
    }
    
    if (!targetUrl) {
      toast({
        variant: "destructive",
        title: "Missing URL",
        description: "Please enter a destination URL",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Create ad object
      const adData = {
        userId: user?.id || 1, // Fallback if no ID yet
        title,
        description,
        imageUrl,
        targetUrl,
        budget: parseInt(budget),
        duration: parseInt(duration),
        tags,
        status: 'pending',
      };
      
      const response = await apiRequest('POST', '/api/ads', adData);
      
      if (response.ok) {
        // Invalidate any existing ad queries
        queryClient.invalidateQueries({ queryKey: ['/api/ads'] });
        queryClient.invalidateQueries({ queryKey: [`/api/ads/user/${user?.id}`] });
        
        toast({
          title: "Ad created",
          description: "Your ad has been created successfully",
        });
        
        handleClose();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create ad');
      }
    } catch (error) {
      console.error('Error creating ad:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create ad. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Create New Ad</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="adTitle">Ad Title</Label>
            <Input
              id="adTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Lightning Coffee Shop"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="adDescription">Ad Description</Label>
            <Textarea
              id="adDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe your ad"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="adImage">Ad Image URL</Label>
            <Input
              id="adImage"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-xs text-muted-foreground">
              Enter a URL for your image. Recommended size: 600x300px
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="adUrl">Destination URL</Label>
            <Input
              id="adUrl"
              type="url"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="adBudget">Budget (sats)</Label>
              <Input
                id="adBudget"
                type="number"
                min="1000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="10000"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="adDuration">Duration (days)</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger id="adDuration">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="adTags">Tags (comma separated)</Label>
            <Input
              id="adTags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="bitcoin, lightning, coffee"
            />
          </div>
          
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Ad'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
