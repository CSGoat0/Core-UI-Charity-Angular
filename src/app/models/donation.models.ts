import { PaginationParameters, PaginatedResponse, ServiceResponse } from './organization.models';

// ==============================
// Donation Models
// ==============================

export interface Donation {
  id: number;
  amount: number;
  userId: string;
  campaignId: number;
  campaign?: CampaignBasic;
  registrationDate: Date;
  updatedOn: Date | null;
  isDeleted: boolean;
}

export interface CampaignBasic {
  id: number;
  organizationId: number;
  title: string;
  description: string;
  imgPath: string | null;
  target: number;
  achieved: number;
  status: string;
  type: string;
  isDeleted: boolean;
  registrationDate: Date;
  updatedOn: Date | null;
  deadline: Date;
  daysRemaining: number;
}

export interface CreateDonationRequest {
  amount: number;
  userId: string;
  campaignId: number;
}

export interface UpdateDonationRequest {
  amount?: number;
  campaignId?: number;
}

// ==============================
// Payment Models
// ==============================

export interface CreatePaymentRequest {
  amount: number;
  campaignId: number;
  organizationId: number;
}

export interface PaymentInfo {
  id: number;
  apiKey: string;
  integrationId: string;
  iframeId: string;
  hmacKey: string;
  registrationDate: Date;
  updatedOn: Date | null;
  isDeleted: boolean;
  organizationId: number;
}

export interface CreatePaymentInfoRequest {
  apiKey: string;
  integrationId: string;
  iframeId: string;
  hmacKey: string;
  organizationId: number;
}

export interface UpdatePaymentInfoRequest {
  apiKey: string;
  integrationId: string;
  iframeId: string;
  hmacKey: string;
  organizationId: number;
}

// ==============================
// Donation Statistics
// ==============================

export interface DonationStatistics {
  totalAmount: number;
  totalCount: number;
  averageAmount: number;
}

// ==============================
// Donation Filters
// ==============================

export interface DonationFilters {
  searchTerm?: string;
  minAmount?: number;
  maxAmount?: number;
  startDate?: Date;
  endDate?: Date;
  campaignId?: number;
  userId?: string;
  includeDeleted?: boolean;
}

// ==============================
// Re-export
// ==============================

export type { PaginationParameters, PaginatedResponse, ServiceResponse };
