
import { User, Transaction } from './types';

const USERS_KEY = 'atlas_coins_users';
const TRANSACTIONS_KEY = 'atlas_coins_transactions';

export const getStoredUsers = (): User[] => {
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveUsers = (users: User[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const getStoredTransactions = (userId: string): Transaction[] => {
  const data = localStorage.getItem(TRANSACTIONS_KEY);
  const all: Transaction[] = data ? JSON.parse(data) : [];
  return all.filter(t => t.fromId === userId || t.toId === userId);
};

export const saveTransaction = (transaction: Transaction) => {
  const data = localStorage.getItem(TRANSACTIONS_KEY);
  const all: Transaction[] = data ? JSON.parse(data) : [];
  all.push(transaction);
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(all));
};

export const generateUniqueId = (): string => {
  const users = getStoredUsers();
  let newId: string;
  do {
    newId = Math.floor(100000000 + Math.random() * 900000000).toString();
  } while (users.find(u => u.id === newId));
  return newId;
};

export const findUserById = (id: string): User | undefined => {
  return getStoredUsers().find(u => u.id === id);
};

export const updateUserBalance = (userId: string, amount: number) => {
  const users = getStoredUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index !== -1) {
    users[index].balance += amount;
    saveUsers(users);
  }
};
