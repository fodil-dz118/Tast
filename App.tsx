
import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { User } from './types';
import { getStoredUsers, saveUsers, generateUniqueId } from './store';
import Dashboard from './components/Dashboard';
import ProfileSetup from './components/ProfileSetup';
import { Coins, LogIn, ShieldCheck } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUserEmail = localStorage.getItem('atlas_current_user_email');
    if (savedUserEmail) {
      const users = getStoredUsers();
      const existing = users.find(u => u.email === savedUserEmail);
      if (existing) {
        setUser(existing);
      }
    }
    setIsLoading(false);
  }, []);

  const handleLoginSuccess = (credentialResponse: any) => {
    // Decoding JWT manually or just using email as a key for this prototype
    // In a real app, you'd send this to your backend
    const decoded: any = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
    const email = decoded.email;
    const name = decoded.name;
    const profilePic = decoded.picture;

    const users = getStoredUsers();
    let existingUser = users.find(u => u.email === email);

    if (!existingUser) {
      existingUser = {
        id: generateUniqueId(),
        email,
        name,
        profilePic,
        balance: 1000, // Welcome bonus
        registered: false,
        dob: { day: '', month: '', year: '' }
      };
      saveUsers([...users, existingUser]);
    }

    localStorage.setItem('atlas_current_user_email', email);
    setUser(existingUser);
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-amber-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-950">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="flex justify-center">
            <div className="p-4 bg-amber-500/10 rounded-3xl border border-amber-500/20">
              <Coins className="w-16 h-16 text-amber-500" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold gold-text">Atlas Coins</h1>
            <p className="mt-2 text-slate-400">Secure. Fast. Borderless Digital Assets.</p>
          </div>
          
          <div className="glass p-8 rounded-3xl space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-white">Welcome Back</h2>
              <p className="text-sm text-slate-400">Login with your Google account to access your wallet</p>
            </div>
            
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleLoginSuccess}
                onError={() => console.log('Login Failed')}
                theme="filled_blue"
                shape="pill"
              />
            </div>
            
            <div className="pt-4 border-t border-slate-700/50 flex items-center justify-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4" />
              Secure Bank-Grade Encryption
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
