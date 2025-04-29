import React from 'react';
import { useLocation } from 'wouter';

type AuthLayoutProps = {
  children: React.ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
  const [location] = useLocation();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>
      
      <footer className="py-4 text-center text-gray-500 dark:text-gray-400 text-sm">
        <p>Nostr Ad Marketplace | Powered by Nostr Protocol</p>
      </footer>
    </div>
  );
}

export default AuthLayout;
