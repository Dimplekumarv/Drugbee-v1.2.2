import { User } from '../types';
import { mockUsers } from '../data/mockData';

export const getCurrentUser = (): User | null => {
  const userData = localStorage.getItem('currentUser');
  return userData ? JSON.parse(userData) : null;
};

export const login = (email: string, password: string): User | null => {
  const user = mockUsers.find(u => u.email === email && u.isActive);
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    return user;
  }
  return null;
};

export const logout = () => {
  localStorage.removeItem('currentUser');
};

export const hasPermission = (user: User | null, module: string, access: 'read' | 'write' | 'full' = 'read'): boolean => {
  if (!user) return false;
  if (user.role === 'admin') return true;
  
  const permission = user.permissions?.find(p => p.module === module);
  if (!permission) return false;
  
  if (access === 'read') return true;
  if (access === 'write') return permission.access === 'write' || permission.access === 'full';
  if (access === 'full') return permission.access === 'full';
  
  return false;
};

export const sendOTP = (phone: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`OTP sent to ${phone}: 123456`);
      resolve(true);
    }, 1000);
  });
};

export const verifyOTP = (phone: string, otp: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(otp === '123456');
    }, 500);
  });
};
