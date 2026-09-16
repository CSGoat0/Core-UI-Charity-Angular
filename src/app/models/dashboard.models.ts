import { ServiceResponse } from './organization.models';

// ==============================
// Statistics
// ==============================

export interface DashboardStats {
  totalRaised: number;
  totalDonations: number;
  totalCampaigns: number;
  totalOrganizations: number;
  totalUsers: number;
}

export interface UserStats {
  totalDonated: number;
  donationCount: number;
}

// ==============================
// Charts
// ==============================

export interface TrendDataPoint {
  date: string;
  amount: number;
}

export interface MonthlyReportDataPoint {
  month: string;
  amount: number;
}

export interface YearlyReportDataPoint {
  year: string;
  amount: number;
}

export interface DayOfWeekDataPoint {
  day: string;
  amount: number;
}

export interface TimeOfDayDataPoint {
  timeOfDay: string;
  amount: number;
}

// ==============================
// Lists
// ==============================

export interface TopCampaign {
  id: number;
  title: string;
  description?: string;
  target?: number;
  achieved?: number;
  status?: string;
  type?: string;
  deadline?: Date;
  daysRemaining?: number;
}

export interface UrgentCampaign {
  id: number;
  title: string;
  target: number;
  achieved: number;
  achievementPercentage: number;
  deadline: Date;
  daysRemaining: number;
}

export interface TopDonor {
  userId: string;
  totalDonated: number;
}

// ==============================
// Recent Activity
// ==============================

export interface RecentDonation {
  id: number;
  amount: number;
  userId: string;
  campaignId: number;
  campaign?: {
    id: number;
    title: string;
  };
  registrationDate: Date;
}

export type { ServiceResponse };
