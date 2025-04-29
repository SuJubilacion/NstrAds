import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useNostrAuth } from '@/hooks/useNostrAuth';
import { Button } from '@/components/ui/button';
import { LogoutConfirmModal } from '@/components/modals/LogoutConfirmModal';
import { CreateAdModal } from '@/components/modals/CreateAdModal';
import { Bolt, LayoutDashboard, Vote, Banknote, LineChart, Settings, LogOut, Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location] = useLocation();
  const { user, logout } = useNostrAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [createAdModalOpen, setCreateAdModalOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  
  const truncateNpub = (npub: string) => {
    if (!npub) return '';
    return npub.substring(0, 8) + '...' + npub.substring(npub.length - 4);
  };
  
  const handleLogout = () => {
    logout();
    setLogoutModalOpen(false);
    window.location.href = '/login';
  };
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  
  const navItems = [
    { href: '/dashboard', icon: <LayoutDashboard className="mr-3 h-5 w-5" />, label: 'Dashboard', active: location === '/dashboard' },
    { href: '/my-ads', icon: <Vote className="mr-3 h-5 w-5" />, label: 'My Ads', active: location === '/my-ads' },
    { href: '/payments', icon: <Banknote className="mr-3 h-5 w-5" />, label: 'Payments', active: location === '/payments' },
    { href: '/analytics', icon: <LineChart className="mr-3 h-5 w-5" />, label: 'Analytics', active: location === '/analytics' },
    { href: '/settings', icon: <Settings className="mr-3 h-5 w-5" />, label: 'Settings', active: location === '/settings' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex fixed w-64 h-full border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 flex-col">
        <div className="flex items-center mb-8">
          <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white">
            <Bolt size={20} />
          </div>
          <h1 className="ml-3 text-xl font-bold">Nostr Ads</h1>
        </div>
        
        <div className="space-y-2">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center py-2 px-4 rounded-lg ${
                item.active 
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
        
        <div className="mt-auto">
          <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
            <button 
              onClick={toggleTheme} 
              className="flex items-center py-2 px-4 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg w-full"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="mr-3 h-5 w-5" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="mr-3 h-5 w-5" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>
            
            <button 
              onClick={() => setLogoutModalOpen(true)} 
              className="flex items-center py-2 px-4 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg w-full"
            >
              <LogOut className="mr-3 h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Header */}
      <header className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white">
            <Bolt size={16} />
          </div>
          <h1 className="ml-2 text-lg font-bold">Nostr Ads</h1>
        </div>
        
        <button onClick={toggleMobileMenu} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
          <Menu size={24} />
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" 
          onClick={toggleMobileMenu}
        >
          <div 
            className="absolute right-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-900 p-4" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end mb-4">
              <button 
                onClick={toggleMobileMenu} 
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-2">
              {navItems.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href}
                  onClick={toggleMobileMenu}
                  className={`flex items-center py-2 px-4 rounded-lg ${
                    item.active 
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
            
            <div className="mt-8 border-t border-gray-200 dark:border-gray-800 pt-4">
              <button 
                onClick={toggleTheme} 
                className="flex items-center py-2 px-4 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg w-full"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="mr-3 h-5 w-5" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="mr-3 h-5 w-5" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>
              
              <button 
                onClick={() => {
                  setLogoutModalOpen(true);
                  toggleMobileMenu();
                }} 
                className="flex items-center py-2 px-4 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg w-full"
              >
                <LogOut className="mr-3 h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex justify-around">
        <Link href="/dashboard" className={`flex flex-col items-center py-2 px-3 ${
          location === '/dashboard' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'
        }`}>
          <LayoutDashboard className="text-lg" size={20} />
          <span className="text-xs mt-1">Dashboard</span>
        </Link>
        
        <Link href="/my-ads" className={`flex flex-col items-center py-2 px-3 ${
          location === '/my-ads' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'
        }`}>
          <Vote className="text-lg" size={20} />
          <span className="text-xs mt-1">My Ads</span>
        </Link>
        
        <button onClick={() => setCreateAdModalOpen(true)} className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white -mt-4 shadow-lg">
          <span className="material-icons">add</span>
        </button>
        
        <Link href="/payments" className={`flex flex-col items-center py-2 px-3 ${
          location === '/payments' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'
        }`}>
          <Banknote className="text-lg" size={20} />
          <span className="text-xs mt-1">Payments</span>
        </Link>
        
        <Link href="/settings" className={`flex flex-col items-center py-2 px-3 ${
          location === '/settings' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'
        }`}>
          <Settings className="text-lg" size={20} />
          <span className="text-xs mt-1">Settings</span>
        </Link>
      </nav>

      {/* Main Content Container */}
      <main className="md:ml-64 pb-16 md:pb-0 flex-grow">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* Modals */}
      <LogoutConfirmModal 
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />
      
      <CreateAdModal 
        isOpen={createAdModalOpen}
        onClose={() => setCreateAdModalOpen(false)}
      />
    </div>
  );
}

export default DashboardLayout;
