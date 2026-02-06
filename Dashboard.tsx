
import React, { useState, useEffect } from 'react';
import { User, Transaction } from '../types';
import { getStoredTransactions, updateUserBalance, findUserById, saveTransaction } from '../store';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  Search, 
  Wallet, 
  LogOut, 
  Copy, 
  CheckCircle2, 
  X,
  AlertCircle
} from 'lucide-react';
import TransactionList from './TransactionList';

interface Props {
  user: User;
  onLogout: () => void;
}

const Dashboard: React.FC<Props> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [searchId, setSearchId] = useState('');
  const [foundUser, setFoundUser] = useState<User | null>(null);
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setTransactions(getStoredTransactions(user.id).reverse());
  }, [user.id, status]);

  const handleSearch = () => {
    if (searchId === user.id) {
      setStatus({ type: 'error', message: "Cannot send to yourself" });
      setFoundUser(null);
      return;
    }
    const result = findUserById(searchId);
    if (result) {
      setFoundUser(result);
      setStatus(null);
    } else {
      setFoundUser(null);
      setStatus({ type: 'error', message: "User not found" });
    }
  };

  const handleSend = () => {
    const sendAmount = parseFloat(amount);
    if (isNaN(sendAmount) || sendAmount <= 0) {
      setStatus({ type: 'error', message: "Invalid amount" });
      return;
    }
    if (sendAmount > user.balance) {
      setStatus({ type: 'error', message: "Insufficient balance" });
      return;
    }
    if (!foundUser) return;

    // Process Transaction
    updateUserBalance(user.id, -sendAmount);
    updateUserBalance(foundUser.id, sendAmount);

    const tx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      fromId: user.id,
      toId: foundUser.id,
      amount: sendAmount,
      timestamp: Date.now(),
      type: 'send',
      partnerId: foundUser.id,
      partnerName: foundUser.name,
      partnerPhoto: foundUser.profilePic
    };
    saveTransaction(tx);

    // Save for recipient too (internal logic for listing)
    // In a real DB this would be one record viewed by two users
    
    setStatus({ type: 'success', message: `Successfully sent ${sendAmount} Atlas Coins to ${foundUser.name}` });
    setAmount('');
    setSearchId('');
    setFoundUser(null);
    
    // Refresh user balance view (in simple local storage app)
    window.location.reload(); 
  };

  const copyId = () => {
    navigator.clipboard.writeText(user.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-20 md:pb-0">
      {/* Header */}
      <header className="p-6 flex items-center justify-between border-b border-slate-800 sticky top-0 bg-slate-950/80 backdrop-blur-xl z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-amber-500/30">
            <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="font-bold text-sm leading-tight">{user.name}</h1>
            <p className="text-xs text-slate-500">ID: {user.id}</p>
          </div>
        </div>
        <button onClick={onLogout} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
          <LogOut className="w-5 h-5 text-slate-400" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 max-w-2xl mx-auto w-full space-y-8">
        {/* Wallet Card */}
        <div className="relative overflow-hidden p-8 rounded-3xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 shadow-2xl shadow-amber-500/20">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Wallet className="w-32 h-32" />
          </div>
          <div className="relative space-y-1">
            <p className="text-sm font-medium opacity-80">Current Balance</p>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-black">{user.balance.toLocaleString()}</span>
              <span className="text-lg font-bold pb-1">ATC</span>
            </div>
          </div>
          <div className="mt-8 flex gap-3">
            <button 
              onClick={() => { setShowSendModal(true); setStatus(null); }}
              className="flex-1 bg-slate-950 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-900 transition-colors"
            >
              <ArrowUpRight className="w-4 h-4" /> Send
            </button>
            <button 
              onClick={() => setShowReceiveModal(true)}
              className="flex-1 bg-white/20 backdrop-blur-md text-slate-950 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/30 transition-colors"
            >
              <ArrowDownLeft className="w-4 h-4" /> Receive
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="space-y-4">
          <div className="flex gap-4 border-b border-slate-800">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`pb-2 px-1 text-sm font-semibold transition-all border-b-2 ${activeTab === 'overview' ? 'border-amber-500 text-white' : 'border-transparent text-slate-500'}`}
            >
              Quick Stats
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`pb-2 px-1 text-sm font-semibold transition-all border-b-2 ${activeTab === 'history' ? 'border-amber-500 text-white' : 'border-transparent text-slate-500'}`}
            >
              History
            </button>
          </div>

          {activeTab === 'overview' ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="glass p-5 rounded-2xl space-y-1">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Sent Today</p>
                <p className="text-xl font-bold">0 ATC</p>
              </div>
              <div className="glass p-5 rounded-2xl space-y-1">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Received</p>
                <p className="text-xl font-bold">0 ATC</p>
              </div>
              <div className="col-span-2">
                <h3 className="text-sm font-bold text-slate-400 mb-4 flex items-center gap-2">
                   <History className="w-4 h-4" /> Recent Activity
                </h3>
                <TransactionList transactions={transactions.slice(0, 5)} currentUserId={user.id} />
              </div>
            </div>
          ) : (
            <TransactionList transactions={transactions} currentUserId={user.id} />
          )}
        </div>
      </main>

      {/* Send Modal */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowSendModal(false)} />
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Transfer Coins</h2>
              <button onClick={() => setShowSendModal(false)} className="p-2 text-slate-400 hover:bg-slate-800 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Recipient ID</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    placeholder="Enter 9-digit ID"
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                  <button 
                    onClick={handleSearch}
                    className="bg-amber-500 text-slate-950 p-3 rounded-xl hover:bg-amber-600 transition-colors"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {foundUser && (
                <div className="bg-slate-800/50 p-4 rounded-2xl flex items-center gap-4 animate-in zoom-in-95 duration-200">
                  <img src={foundUser.profilePic} className="w-12 h-12 rounded-full object-cover border border-amber-500/30" />
                  <div>
                    <p className="font-bold">{foundUser.name}</p>
                    <p className="text-xs text-slate-400">ID: {foundUser.id}</p>
                  </div>
                  <div className="ml-auto">
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  </div>
                </div>
              )}

              {foundUser && (
                <div className="space-y-2 animate-in slide-in-from-top-4 duration-200">
                  <label className="text-xs font-bold text-slate-500 uppercase">Amount</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-4 text-3xl font-black text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">ATC</span>
                  </div>
                  <p className="text-xs text-slate-500 text-right">Available: {user.balance} ATC</p>
                </div>
              )}

              {status && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${status.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                  {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                  <p className="text-sm font-medium">{status.message}</p>
                </div>
              )}

              {foundUser && (
                <button
                  onClick={handleSend}
                  disabled={!amount || parseFloat(amount) <= 0}
                  className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-black py-4 rounded-xl shadow-lg transition-all active:scale-[0.98]"
                >
                  Confirm Transfer
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Receive Modal */}
      {showReceiveModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowReceiveModal(false)} />
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold">Receive Coins</h2>
              <button onClick={() => setShowReceiveModal(false)} className="p-2 text-slate-400 hover:bg-slate-800 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-48 h-48 bg-white p-4 rounded-3xl shadow-xl">
                 {/* QR Placeholder */}
                 <div className="w-full h-full bg-slate-100 rounded-xl flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-300 text-slate-400">
                    <p className="text-[10px] uppercase font-black">Scan to Pay</p>
                    <div className="w-24 h-24 border-2 border-amber-500 rounded-lg flex items-center justify-center">
                       <Wallet className="w-12 h-12 text-amber-500" />
                    </div>
                 </div>
              </div>

              <div className="space-y-2 w-full">
                <p className="text-sm text-slate-400">Share your ID to receive payments</p>
                <div className="bg-slate-800 p-4 rounded-2xl flex items-center justify-between border border-slate-700">
                  <span className="text-xl font-mono font-bold tracking-widest">{user.id}</span>
                  <button onClick={copyId} className="p-2 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-2">
                    {copied ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-amber-500" />}
                    <span className="text-xs font-bold text-amber-500">{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed italic">
                Only transfers from registered Atlas Coins users are permitted.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
