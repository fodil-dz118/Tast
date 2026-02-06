
import React from 'react';
import { Transaction } from '../types';
import { ArrowUpRight, ArrowDownLeft, UserCircle } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  currentUserId: string;
}

const TransactionList: React.FC<Props> = ({ transactions, currentUserId }) => {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 glass rounded-3xl space-y-3">
        <p className="text-slate-500 font-medium">No transactions yet</p>
        <p className="text-xs text-slate-600">Start sending or receiving coins to see history</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((tx) => {
        const isSender = tx.fromId === currentUserId;
        const date = new Date(tx.timestamp);
        
        return (
          <div key={tx.id} className="glass p-4 rounded-2xl flex items-center gap-4 hover:bg-slate-800/80 transition-colors">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isSender ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
              {isSender ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownLeft className="w-6 h-6" />}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm truncate">{tx.partnerName}</span>
                <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 text-slate-400 font-mono">
                  {tx.partnerId}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <div className={`text-right ${isSender ? 'text-red-400' : 'text-green-400'}`}>
              <p className="font-black">
                {isSender ? '-' : '+'}{tx.amount.toLocaleString()}
              </p>
              <p className="text-[10px] font-bold opacity-60">ATC</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TransactionList;
