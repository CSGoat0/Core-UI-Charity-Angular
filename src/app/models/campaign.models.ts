import { PaginationParameters, PaginatedResponse, ServiceResponse } from './organization.models';

export interface CampaignResponse {
  id: number;
  organizationId: number;
  title: string;
  description: string;
  imgPath: string | null;
  target: number;
  achieved: number;
  status: CampaignStatus;
  type: CampaignType;
  isDeleted: boolean;
  registrationDate: Date;
  updatedOn: Date | null;
  deadline: Date;
  daysRemaining: number;
}

export interface CampaignDetails extends CampaignResponse {
  achievementPercentage: number;
  remainingAmount: number;
  totalDonationsCount: number;
  recentDonations: DonationBasicDto[];
  organizations?: OrganizationBasicDto[];
  organizationsCount?: number;
  creatorOrganizationId?: number;
  creatorOrganizationName?: string;
}

export interface SoloCampaignResponse extends CampaignResponse {
  organizationName: string;
}

export interface SharedCampaignResponse extends CampaignResponse {
  organizations: OrganizationBasicDto[];
  organizationsCount: number;
  creatorOrganizationId: number;
  creatorOrganizationName: string;
}

export interface OrganizationBasicDto {
  id: number;
  name: string;
}

export interface DonationBasicDto {
  id: number;
  amount: number;
  registrationDate: Date;
  userName: string;
}

export interface CampaignStatistics {
  totalCampaigns: number;
  activeCampaigns: number;
  completedCampaigns: number;
  pendingCampaigns: number;
  cancelledCampaigns: number;
  totalMoneyRaised: number;
  averageAchievementPercentage: number;
  soloCampaignsCount: number;
  sharedCampaignsCount: number;
  mostSuccessfulCampaign: CampaignResponse | null;
  mostDonatedCampaign: CampaignResponse | null;
  statisticsDate: Date;
}

export interface CreateSoloCampaignRequest {
  title: string;
  description: string;
  target: number;
  type: CampaignType;
  startDate: Date;
  deadline: Date;
  organizationId: number;
  imgPath?: string;
}

export interface CreateSharedCampaignRequest {
  title: string;
  description: string;
  target: number;
  type: CampaignType;
  startDate: Date;
  deadline: Date;
  organizationIds: number[];
  creatorOrganizationId: number;
  imgPath?: string;
}

export interface UpdateCampaignRequest {
  id: number;
  title?: string;
  description?: string;
  imgPath?: string;
  target?: number;
  type?: CampaignType;
}

export interface UpdateSoloCampaignRequest extends UpdateCampaignRequest {
  organizationId?: number;
}

export interface UpdateSharedCampaignRequest extends UpdateCampaignRequest {
  organizationIds?: number[];
}

export interface InviteResponse {
  id: number;
  sharedCampaignId: number;
  campaignTitle: string;
  organizationId: number;
  organizationName: string;
  invitedByUserName: string;
  status: InviteStatus;
  respondedAt: Date | null;
  expiresAt: Date;
  registrationDate: Date;
}

export interface SendInviteRequest {
  organizationId: number;
  expiresInDays: number;
}

export interface UpdateInviteStatusRequest {
  status: InviteStatus;
}

export enum CampaignStatus {
  Draft = 0,
  Active = 1,
  Completed = 2,
  Cancelled = 3
}

export enum CampaignType {
  Solo = 0,
  Shared = 1
}

export enum InviteStatus {
  Pending = 0,
  Accepted = 1,
  Rejected = 2,
  Expired = 3
}

// Re-export for convenience
export type { PaginationParameters, PaginatedResponse, ServiceResponse };
