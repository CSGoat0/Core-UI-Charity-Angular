export interface Organization {
  id: number;
  name: string;
  address: string | null;
  isDeleted: boolean;
  registrationDate: Date;
  updatedOn: Date | null;
  paymentId: number | null;
  adminUserId: string | null;
  adminUserName: string;
  adminUserFullName: string;
  adminUserEmail: string;
}

export interface OrganizationDetails extends Organization {
  contactMethods: OrgContactMethod[];
  soloCampaigns: CampaignResponse[];
  sharedCampaigns: CampaignResponse[];
  soloCampaignsCount: number;
  sharedCampaignsCount: number;
  totalCampaignsCount: number;
}

export interface OrganizationDropDown {
  id: number;
  name: string;
}

export interface OrganizationRole {
  id: number;
  organizationId: number;
  userId: string;
  role: OrganizationRoleType;
  userName: string | null;
  userEmail: string | null;
  userFullName: string | null;
}

export interface OrgContactMethod {
  id: number;
  organizationId: number;
  contactType: ContactType;
  contactValue: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedOn: Date | null;
}

export interface CampaignResponse {
  id: number;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  target: number;
  achieved: number;
  status: CampaignStatus;
  organizationId: number;
  organizationName: string;
}

export enum OrganizationRoleType {
  Admin = 0,
  SubAdmin = 1
}

export enum ContactType {
  Email = 0,
  Phone = 1,
  Website = 2,
  Facebook = 3,
  Twitter = 4,
  Instagram = 5,
  LinkedIn = 6,
  YouTube = 7
}

export enum CampaignStatus {
  Draft = 0,
  Active = 1,
  Completed = 2,
  Cancelled = 3
}

export interface PaginationParameters {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  sortBy?: string;
  sortDescending?: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface CreateOrganizationRequest {
  name: string;
  address?: string;
}

export interface UpdateOrganizationRequest {
  name?: string;
  address?: string;
}

export interface AssignAdminRequest {
  userId: string;
}

export interface ServiceResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}
