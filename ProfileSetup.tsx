
import React, { useState, useRef } from 'react';
import { User } from '../types';
import { UserCircle, Camera, Calendar } from 'lucide-react';

interface Props {
  user: User;
  onComplete: (user: User) => void;
}

const ProfileSetup: React.FC<Props> = ({ user, onComplete }) => {
  const [name, setName] = useState(user.name);
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [profilePic, setProfilePic] = useState<string | undefined>(user.profilePic);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto-generate profile pic if none selected (Initials)
    let finalPic = profilePic;
    if (!finalPic) {
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(0, 0, 200, 200);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 100px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(name.charAt(0).toUpperCase(), 100, 100);
        finalPic = canvas.toDataURL();
      }
    }

    onComplete({
      ...user,
      name,
      dob: { day, month, year },
      profilePic: finalPic,
      registered: true
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950">
      <div className="w-full max-w-md glass p-8 rounded-3xl space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">Complete Your Profile</h2>
          <p className="text-slate-400 text-sm">One last step to secure your Atlas account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-amber-500/30 bg-slate-800 flex items-center justify-center">
                {profilePic ? (
                  <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserCircle className="w-16 h-16 text-slate-600" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-amber-500 p-2 rounded-full shadow-lg hover:bg-amber-600 transition-colors"
              >
                <Camera className="w-4 h-4 text-white" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              placeholder="Enter your name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Date of Birth
            </label>
            <div className="grid grid-cols-3 gap-3">
              <input
                type="number"
                required
                min="1"
                max="31"
                placeholder="Day"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="bg-slate-800/50 border border-slate-700 rounded-xl px-3 py-3 text-white text-center focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
              <input
                type="number"
                required
                min="1"
                max="12"
                placeholder="Month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="bg-slate-800/50 border border-slate-700 rounded-xl px-3 py-3 text-white text-center focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
              <input
                type="number"
                required
                min="1900"
                max="2025"
                placeholder="Year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="bg-slate-800/50 border border-slate-700 rounded-xl px-3 py-3 text-white text-center focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-4 rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98]"
          >
            Complete Setup
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
