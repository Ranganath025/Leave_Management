
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format date to YYYY-MM-DD
export function formatDateToYYYYMMDD(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Get readable date format (e.g., April 15, 2025)
export function getReadableDate(dateString: string): string {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

// Calculate date difference in days (inclusive of both start and end dates)
export function calculateDateDiffInDays(startDate: Date, endDate: Date): number {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

// Check if a user is using a demo account
export function isDemoUser(email: string): boolean {
  if (!email) return false;
  
  const demoEmailPatterns = [
    'demo@', 'test@', 'employee@example', 'manager@example', 'admin@example'
  ];
  
  return demoEmailPatterns.some(pattern => email.toLowerCase().includes(pattern));
}

// Check if we're in demo mode based on localStorage
export function checkDemoMode(): boolean {
  const isDemo = localStorage.getItem('isDemo');
  const userEmail = localStorage.getItem('userEmail');
  
  return isDemo === 'true' || (userEmail ? isDemoUser(userEmail) : false);
}

// Generate mock data for demo mode
export function generateMockData(type: string, count: number = 5) {
  switch (type) {
    case 'leaves':
      return Array.from({ length: count }, (_, i) => ({
        _id: `mock-${i}`,
        user: { 
          fullName: `User ${i + 1}`, 
          email: `user${i + 1}@example.com` 
        },
        type: ['Annual Leave', 'Sick Leave', 'Personal Leave'][i % 3],
        startDate: new Date(Date.now() + (i * 86400000)).toISOString(),
        endDate: new Date(Date.now() + ((i + 2) * 86400000)).toISOString(),
        days: i % 3 + 1,
        status: ['Pending', 'Approved', 'Rejected'][i % 3],
        reason: `Mock reason ${i + 1}`
      }));
    
    case 'users':
      return Array.from({ length: count }, (_, i) => ({
        _id: `mock-${i}`,
        fullName: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        role: ['employee', 'manager', 'admin'][i % 3],
        department: ['HR', 'Engineering', 'Marketing', 'Finance'][i % 4]
      }));
      
    default:
      return [];
  }
}
