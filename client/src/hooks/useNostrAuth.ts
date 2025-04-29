import { useState, useEffect } from 'react';
import { 
  generateKeyPair, 
  verifyKeyPair, 
  getNostrExtensionPublicKey, 
  hasNostrExtension
} from '@/lib/nostr';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface AuthUser {
  id?: number;
  npub: string;
  username?: string;
}

export function useNostrAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Check for stored user on mount
  useEffect(() => {
    const storedNpub = sessionStorage.getItem('npub');
    if (storedNpub) {
      setUser({ npub: storedNpub });
    }
    setLoading(false);
  }, []);

  // Check if extension is available
  const extensionAvailable = hasNostrExtension();

  // Manual login with npub and nsec
  const loginWithKeys = async (npub: string, nsec: string) => {
    setLoading(true);
    setError(null);

    try {
      // Verify the key pair is valid
      const isValid = verifyKeyPair(npub, nsec);
      if (!isValid) {
        throw new Error('Invalid key pair. Please check your npub and nsec.');
      }

      // Save user info
      const authUser = { npub };
      sessionStorage.setItem('npub', npub);
      setUser(authUser);

      // Try to register/login the user with the API
      try {
        const response = await apiRequest('POST', '/api/auth/login', { npub });
        const userData = await response.json();
        setUser(userData);
      } catch (apiError) {
        // If the user doesn't exist in our database yet, that's okay
        // They're still authenticated via their Nostr keys
        console.log('User not found in database, continuing as guest');
      }

      toast({
        title: "Login successful",
        description: "You are now logged in with your Nostr keys.",
      });
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to login';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: errorMessage,
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Login with NIP-07 extension
  const loginWithExtension = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!extensionAvailable) {
        throw new Error('No Nostr extension detected.');
      }

      // Get public key from extension
      const npub = await getNostrExtensionPublicKey();
      
      // Save user info
      const authUser = { npub };
      sessionStorage.setItem('npub', npub);
      setUser(authUser);

      // Try to register/login the user with the API
      try {
        const response = await apiRequest('POST', '/api/auth/login', { npub });
        const userData = await response.json();
        setUser(userData);
      } catch (apiError) {
        // If the user doesn't exist in our database yet, that's okay
        console.log('User not found in database, continuing as guest');
      }

      toast({
        title: "Login successful",
        description: "You are now logged in with your Nostr extension.",
      });
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to login with extension';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Extension login failed",
        description: errorMessage,
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Generate a random key pair and login
  const loginWithRandomKeys = async () => {
    setLoading(true);
    setError(null);

    try {
      // Generate new key pair
      const keyPair = generateKeyPair();
      
      // Save user info
      const authUser = { npub: keyPair.npub };
      sessionStorage.setItem('npub', keyPair.npub);
      setUser(authUser);

      // Try to register the user with the API
      try {
        // Generate a random username based on npub
        const username = `user_${keyPair.npub.substring(5, 12)}`;
        const response = await apiRequest('POST', '/api/auth/register', { 
          npub: keyPair.npub,
          username,
          password: 'randomPassword' // For API compatibility, not used for auth
        });
        const userData = await response.json();
        setUser(userData);
      } catch (apiError) {
        // If registration fails, continue as guest
        console.log('User registration failed, continuing as guest');
      }

      toast({
        title: "Random keys generated",
        description: "You are now logged in with newly generated keys.",
      });
      
      return keyPair;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate random keys';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Key generation failed",
        description: errorMessage,
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    sessionStorage.removeItem('npub');
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  return {
    user,
    loading,
    error,
    extensionAvailable,
    loginWithKeys,
    loginWithExtension,
    loginWithRandomKeys,
    logout
  };
}
