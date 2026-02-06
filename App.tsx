
import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { User } from './types';
import { getStoredUsers, saveUsers, generateUniqueId } from './store';
import Dashboard from './components/Dashboard';
import ProfileSetup from './components/ProfileSetup';
import { Coins, ShieldCheck } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Check local storage for session
    const savedUserEmail = localStorage.getItem('atlas_current_user_email');
    if (savedUserEmail) {
      const users = getStoredUsers();
      const existing = users.find(u => u.email === savedUserEmail);
      if (existing) {
        setUser(existing);
      }
    }
    
    // Tiny delay to ensure the HTML splash screen feels intentional
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  const handleLoginSuccess = (credentialResponse: any) => {
    try {
      const decoded: any = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
      const { email, name, picture: profilePic } = decoded;

      const users = getStoredUsers();
      let existingUser = users.find(u => u.email === email);

      if (!existingUser) {
        existingUser = {
          id: generateUniqueId(),
          email,
          name,
          profilePic,
          balance: 1000, // Starting bonus
          registered: false,
          dob: { day: '', month: '', year: '' }
        };
        saveUsers([...users, existingUser]);
      }

      localStorage.setItem('atlas_current_user_email', email);
      setUser(existingUser);
    } catch (error) {
      console.error("Login decoding failed", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('atlas_current_user_email');
    setUser(null);
  };

  const handleProfileComplete = (updatedUser: User) => {
    const users = getStoredUsers();
    const updatedUsers = users.map(u => u.email === updatedUser.email ? updatedUser : u);
    saveUsers(updatedUsers);
    setUser(updatedUser);
  };

  if (isInitializing) {
    return null; // Let the index.html loader handle the visual
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 animate-in fade-in duration-700">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="flex justify-center">
            <div className="p-5 bg-amber-500/10 rounded-[2rem] border border-amber-500/20 shadow-2xl shadow-amber-500/5">
              <Coins className="w-16 h-16 text-amber-500" />
            </div>
          </div>
          <div>
            <h1 className="text-5xl font-black gold-text tracking-tighter">Atlas Coins</h1>
            <p className="mt-3 text-slate-400 font-medium">The Future of Digital Currency Transfers</p>
          </div>
          
          <div className="glass p-10 rounded-[2.5rem] space-y-8 shadow-2xl">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Security First</h2>
              <p className="text-sm text-slate-400">Please sign in with your Google account to access your encrypted vault.</p>
            </div>
            
            <div className="flex justify-center scale-110">
              <GoogleLogin
                onSuccess={handleLoginSuccess}
                onError={() => console.log('Login Failed')}
                theme="filled_blue"
                shape="pill"
                useOneTap
              />
            </div>
            
            <div className="pt-6 border-t border-slate-800/50 flex items-center justify-center gap-3 text-xs text-slate-500 font-semibold uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4 text-amber-500/50" />
              Verified Transaction Network
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user.registered) {
    return <ProfileSetup user={user} onComplete={handleProfileComplete} />;
  }

  return <Dashboard user={user} onLogout={handleLogout} />;
};

export default App;
