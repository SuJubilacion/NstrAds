import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { useNostrAuth } from '@/hooks/useNostrAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Bolt, Copy, Check, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { 
    user, 
    loading, 
    extensionAvailable, 
    loginWithKeys, 
    loginWithExtension, 
    loginWithRandomKeys 
  } = useNostrAuth();
  const { toast } = useToast();
  
  const [npubInput, setNpubInput] = useState('');
  const [nsecInput, setNsecInput] = useState('');
  const [npubError, setNpubError] = useState(false);
  const [nsecError, setNsecError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [generatedKeys, setGeneratedKeys] = useState<{npub: string, nsec: string} | null>(null);
  const [copyStates, setCopyStates] = useState({ npub: false, nsec: false });
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      setLocation('/dashboard');
    }
  }, [user, setLocation]);
  
  const validateInputs = () => {
    let valid = true;
    
    if (!npubInput.trim().startsWith('npub1')) {
      setNpubError(true);
      valid = false;
    } else {
      setNpubError(false);
    }
    
    if (!nsecInput.trim().startsWith('nsec1')) {
      setNsecError(true);
      valid = false;
    } else {
      setNsecError(false);
    }
    
    return valid;
  };
  
  const handleManualLogin = async () => {
    if (!validateInputs()) return;
    
    const success = await loginWithKeys(npubInput.trim(), nsecInput.trim());
    if (success) {
      setLocation('/dashboard');
    }
  };
  
  const handleExtensionLogin = async () => {
    const success = await loginWithExtension();
    if (success) {
      setLocation('/dashboard');
    }
  };
  
  const handleGenerateRandomKeys = async () => {
    const keyPair = await loginWithRandomKeys();
    if (keyPair) {
      setGeneratedKeys(keyPair);
    }
  };
  
  const copyToClipboard = async (type: 'npub' | 'nsec') => {
    if (!generatedKeys) return;
    
    const textToCopy = type === 'npub' ? generatedKeys.npub : generatedKeys.nsec;
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopyStates({ ...copyStates, [type]: true });
      
      // Reset the copy confirmation after 2 seconds
      setTimeout(() => {
        setCopyStates({ ...copyStates, [type]: false });
      }, 2000);
      
      toast({
        title: "Copied to clipboard",
        description: `Your ${type} has been copied to clipboard`,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to copy",
        description: "Please copy the text manually",
      });
    }
  };
  
  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center text-white mx-auto">
          <Bolt size={24} />
        </div>
        <h1 className="text-2xl font-bold mt-4">Welcome to Nostr Ad Marketplace</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Sign in with your Nostr credentials</p>
      </div>
      
      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="manual">Manual Keys</TabsTrigger>
          <TabsTrigger value="extension">NIP-07 Extension</TabsTrigger>
          <TabsTrigger value="random">Random Keys</TabsTrigger>
        </TabsList>
        
        <TabsContent value="manual" className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="npub">Public Key (npub)</Label>
                <Input
                  id="npub"
                  placeholder="npub1..."
                  value={npubInput}
                  onChange={(e) => setNpubInput(e.target.value)}
                  className={npubError ? "border-red-500" : ""}
                />
                {npubError && (
                  <p className="text-red-500 text-sm">Please enter a valid npub key.</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nsec">Private Key (nsec)</Label>
                <div className="relative">
                  <Input
                    id="nsec"
                    type={showPassword ? "text" : "password"}
                    placeholder="nsec1..."
                    value={nsecInput}
                    onChange={(e) => setNsecInput(e.target.value)}
                    className={nsecError ? "border-red-500 pr-10" : "pr-10"}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {nsecError && (
                  <p className="text-red-500 text-sm">Please enter a valid nsec key.</p>
                )}
                <p className="text-amber-600 dark:text-amber-400 text-xs mt-1 flex items-center">
                  <span className="mr-1">⚠️</span>
                  Never share your private key with anyone.
                </p>
              </div>
              
              <Button 
                className="w-full" 
                onClick={handleManualLogin}
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="extension" className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500 dark:text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
                  <rect x="9" y="9" width="6" height="6"></rect>
                  <path d="M15 3v2"></path>
                  <path d="M21 9h-2"></path>
                  <path d="M3 9h2"></path>
                  <path d="M9 3v2"></path>
                </svg>
              </div>
              <h2 className="text-lg font-medium mb-2">Login with Nostr Extension</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Use your browser extension like Alby or nos2x to login securely.
              </p>
              
              <Button 
                className="w-full" 
                onClick={handleExtensionLogin}
                disabled={loading || !extensionAvailable}
              >
                {loading ? 'Connecting...' : extensionAvailable ? 'Connect with Extension' : 'Extension Not Detected'}
              </Button>
              
              {!extensionAvailable && (
                <div className="mt-4 text-left">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Don't have a Nostr extension?</p>
                  <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mt-2">
                    <li>
                      <a 
                        href="https://getalby.com/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        Get Alby
                      </a> - A browser extension for Nostr and Lightning
                    </li>
                    <li>
                      <a 
                        href="https://github.com/fiatjaf/nos2x" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        nos2x
                      </a> - A simple Nostr signer extension
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="random" className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="text-center">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500 dark:text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 9l-7 7-7-7"></path>
                  <path d="M19 15l-7 7-7-7"></path>
                  <path d="M19 3l-7 7-7-7"></path>
                </svg>
              </div>
              <h2 className="text-lg font-medium mb-2">Generate Random Keys</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create a new random keypair for testing. 
                <span className="text-amber-600 dark:text-amber-400 font-medium"> Make sure to save your keys!</span>
              </p>
              
              {generatedKeys && (
                <div className="mb-6">
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Your generated public key (npub):
                    </p>
                    <div className="bg-gray-100 dark:bg-gray-900 p-2 rounded text-left mb-3 flex items-center">
                      <code className="text-xs break-all flex-1">{generatedKeys.npub}</code>
                      <button onClick={() => copyToClipboard('npub')} className="ml-2 text-gray-500 dark:text-gray-400">
                        {copyStates.npub ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                    
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Your generated private key (nsec):
                    </p>
                    <div className="bg-gray-100 dark:bg-gray-900 p-2 rounded text-left flex items-center">
                      <code className="text-xs break-all flex-1">{generatedKeys.nsec}</code>
                      <button onClick={() => copyToClipboard('nsec')} className="ml-2 text-gray-500 dark:text-gray-400">
                        {copyStates.nsec ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 rounded-lg text-sm">
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                      </svg>
                      These keys have been generated for you. Please save them in a secure location.
                      If you lose your private key, you will permanently lose access to this account.
                    </span>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col space-y-3">
                <Button 
                  onClick={handleGenerateRandomKeys}
                  disabled={loading}
                  variant={generatedKeys ? 'outline' : 'default'}
                >
                  {loading ? 'Generating...' : generatedKeys ? 'Generate New Keys' : 'Generate New Keys'}
                </Button>
                
                {generatedKeys && (
                  <Button onClick={() => setLocation('/dashboard')} variant="default">
                    Continue to Dashboard
                  </Button>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </AuthLayout>
  );
}
