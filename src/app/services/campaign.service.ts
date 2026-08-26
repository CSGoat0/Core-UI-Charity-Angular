import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CampaignResponse,
  CampaignDetails,
  SoloCampaignResponse,
  SharedCampaignResponse,
  CampaignStatistics,
  CreateSoloCampaignRequest,
  CreateSharedCampaignRequest,
  UpdateSoloCampaignRequest,
  UpdateSharedCampaignRequest,
  InviteResponse,
  SendInviteRequest,
  PaginationParameters,
  PaginatedResponse,
  ServiceResponse,
  CampaignStatus,
} from '../models/campaign.models';

@Injectable({
  providedIn: 'root'
})
export class CampaignService {
  private apiUrl = `${environment.apiUrl}/Campaign`;

  constructor(private http: HttpClient) {}

  // ==============================
  // Base Campaign Operations
  // ==============================

  getAllCampaigns(params: PaginationParameters, includeDeleted: boolean = false): Observable<ServiceResponse<PaginatedResponse<CampaignResponse>>> {
    let httpParams = this.buildPaginationParams(params);
    httpParams = httpParams.set('includeDeleted', includeDeleted.toString());

    return this.http.get<ServiceResponse<PaginatedResponse<CampaignResponse>>>(
      `${this.apiUrl}`,
      { params: httpParams }
    );
  }

  getCampaignById(id: number): Observable<ServiceResponse<CampaignDetails>> {
    return this.http.get<ServiceResponse<CampaignDetails>>(
      `${this.apiUrl}/${id}`
    );
  }

  deleteCampaign(id: number): Observable<ServiceResponse<null>> {
    return this.http.delete<ServiceResponse<null>>(
      `${this.apiUrl}/${id}`
    );
  }

  restoreCampaign(id: number): Observable<ServiceResponse<null>> {
    return this.http.patch<ServiceResponse<null>>(
      `${this.apiUrl}/${id}/restore`,
      {}
    );
  }

  // ==============================
  // Solo Campaign Operations
  // ==============================

  getSoloCampaigns(params: PaginationParameters, includeDeleted: boolean = false): Observable<ServiceResponse<PaginatedResponse<SoloCampaignResponse>>> {
    let httpParams = this.buildPaginationParams(params);
    httpParams = httpParams.set('includeDeleted', includeDeleted.toString());

    return this.http.get<ServiceResponse<PaginatedResponse<SoloCampaignResponse>>>(
      `${this.apiUrl}/solo`,
      { params: httpParams }
    );
  }

  getSoloCampaignById(id: number): Observable<ServiceResponse<SoloCampaignResponse>> {
    return this.http.get<ServiceResponse<SoloCampaignResponse>>(
      `${this.apiUrl}/solo/${id}`
    );
  }

  createSoloCampaign(data: CreateSoloCampaignRequest): Observable<ServiceResponse<SoloCampaignResponse>> {
    return this.http.post<ServiceResponse<SoloCampaignResponse>>(
      `${this.apiUrl}/solo`,
      data
    );
  }

  updateSoloCampaign(id: number, data: UpdateSoloCampaignRequest): Observable<ServiceResponse<SoloCampaignResponse>> {
    return this.http.put<ServiceResponse<SoloCampaignResponse>>(
      `${this.apiUrl}/solo/${id}`,
      data
    );
  }

  getSoloCampaignsByOrganization(params: PaginationParameters, organizationId: number): Observable<ServiceResponse<PaginatedResponse<SoloCampaignResponse>>> {
    let httpParams = this.buildPaginationParams(params);

    return this.http.get<ServiceResponse<PaginatedResponse<SoloCampaignResponse>>>(
      `${this.apiUrl}/solo/by-organization/${organizationId}`,
      { params: httpParams }
    );
  }

  // ==============================
  // Shared Campaign Operations
  // ==============================

  getSharedCampaigns(params: PaginationParameters, includeDeleted: boolean = false): Observable<ServiceResponse<PaginatedResponse<SharedCampaignResponse>>> {
    let httpParams = this.buildPaginationParams(params);
    httpParams = httpParams.set('includeDeleted', includeDeleted.toString());

    return this.http.get<ServiceResponse<PaginatedResponse<SharedCampaignResponse>>>(
      `${this.apiUrl}/shared`,
      { params: httpParams }
    );
  }

  getSharedCampaignById(id: number): Observable<ServiceResponse<SharedCampaignResponse>> {
    return this.http.get<ServiceResponse<SharedCampaignResponse>>(
      `${this.apiUrl}/shared/${id}`
    );
  }

  createSharedCampaign(data: CreateSharedCampaignRequest): Observable<ServiceResponse<SharedCampaignResponse>> {
    return this.http.post<ServiceResponse<SharedCampaignResponse>>(
      `${this.apiUrl}/shared`,
      data
    );
  }

  updateSharedCampaign(id: number, data: UpdateSharedCampaignRequest): Observable<ServiceResponse<SharedCampaignResponse>> {
    return this.http.put<ServiceResponse<SharedCampaignResponse>>(
      `${this.apiUrl}/shared/${id}`,
      data
    );
  }

  getSharedCampaignsByOrganization(params: PaginationParameters, organizationId: number): Observable<ServiceResponse<PaginatedResponse<SharedCampaignResponse>>> {
    let httpParams = this.buildPaginationParams(params);

    return this.http.get<ServiceResponse<PaginatedResponse<SharedCampaignResponse>>>(
      `${this.apiUrl}/shared/by-organization/${organizationId}`,
      { params: httpParams }
    );
  }

  addOrganizationToShared(sharedCampaignId: number, organizationId: number): Observable<ServiceResponse<null>> {
    return this.http.post<ServiceResponse<null>>(
      `${this.apiUrl}/shared/${sharedCampaignId}/add-organization/${organizationId}`,
      {}
    );
  }

  removeOrganizationFromShared(sharedCampaignId: number, organizationId: number): Observable<ServiceResponse<null>> {
    return this.http.delete<ServiceResponse<null>>(
      `${this.apiUrl}/shared/${sharedCampaignId}/remove-organization/${organizationId}`
    );
  }

  // ==============================
  // Campaign Invites
  // ==============================

  sendInvite(campaignId: number, request: SendInviteRequest): Observable<ServiceResponse<InviteResponse>> {
    return this.http.post<ServiceResponse<InviteResponse>>(
      `${environment.apiUrl}/campaigns/${campaignId}/invites`,
      request
    );
  }

  acceptInvite(inviteId: number): Observable<ServiceResponse<null>> {
    return this.http.post<ServiceResponse<null>>(
      `${environment.apiUrl}/campaigns/invites/${inviteId}/accept`,
      {}
    );
  }

  rejectInvite(inviteId: number): Observable<ServiceResponse<null>> {
    return this.http.post<ServiceResponse<null>>(
      `${environment.apiUrl}/campaigns/invites/${inviteId}/reject`,
      {}
    );
  }

  getInvitesForCampaign(params: PaginationParameters, campaignId: number): Observable<ServiceResponse<PaginatedResponse<InviteResponse>>> {
    let httpParams = this.buildPaginationParams(params);

    return this.http.get<ServiceResponse<PaginatedResponse<InviteResponse>>>(
      `${environment.apiUrl}/campaigns/${campaignId}/invites`,
      { params: httpParams }
    );
  }

  getPendingInvites(params: PaginationParameters): Observable<ServiceResponse<PaginatedResponse<InviteResponse>>> {
    let httpParams = this.buildPaginationParams(params);

    return this.http.get<ServiceResponse<PaginatedResponse<InviteResponse>>>(
      `${environment.apiUrl}/campaigns/invites/pending`,
      { params: httpParams }
    );
  }

  getInvitesSentByUser(params: PaginationParameters): Observable<ServiceResponse<PaginatedResponse<InviteResponse>>> {
    let httpParams = this.buildPaginationParams(params);

    return this.http.get<ServiceResponse<PaginatedResponse<InviteResponse>>>(
      `${environment.apiUrl}/campaigns/invites/sent`,
      { params: httpParams }
    );
  }

  hasPendingInvite(campaignId: number, organizationId: number): Observable<ServiceResponse<boolean>> {
    return this.http.get<ServiceResponse<boolean>>(
      `${environment.apiUrl}/campaigns/${campaignId}/invites/pending/${organizationId}`
    );
  }

  // ==============================
  // Campaign Status Operations
  // ==============================

  updateCampaignStatus(campaignId: number, status: CampaignStatus): Observable<ServiceResponse<null>> {
    return this.http.patch<ServiceResponse<null>>(
      `${this.apiUrl}/${campaignId}/status`,
      null,
      { params: { status: status.toString() } }
    );
  }

  updateCampaignMoney(campaignId: number, amount: number): Observable<ServiceResponse<null>> {
    return this.http.patch<ServiceResponse<null>>(
      `${this.apiUrl}/${campaignId}/money`,
      { campaignId, amount }
    );
  }

  incrementCampaignMoney(campaignId: number, amount: number): Observable<ServiceResponse<null>> {
    return this.http.patch<ServiceResponse<null>>(
      `${this.apiUrl}/${campaignId}/increment-money`,
      { campaignId, amount }
    );
  }

  extendDeadline(campaignId: number, newDeadline: Date): Observable<ServiceResponse<null>> {
    return this.http.patch<ServiceResponse<null>>(
      `${this.apiUrl}/${campaignId}/extend-deadline`,
      null,
      { params: { newDeadline: newDeadline.toISOString() } }
    );
  }

  // ==============================
  // Filtering & Searching
  // ==============================

  searchCampaigns(params: PaginationParameters, term: string): Observable<ServiceResponse<PaginatedResponse<CampaignResponse>>> {
    let httpParams = this.buildPaginationParams(params);
    httpParams = httpParams.set('term', term);

    return this.http.get<ServiceResponse<PaginatedResponse<CampaignResponse>>>(
      `${this.apiUrl}/search`,
      { params: httpParams }
    );
  }

  getCampaignsByStatus(params: PaginationParameters, status: CampaignStatus): Observable<ServiceResponse<PaginatedResponse<CampaignResponse>>> {
    let httpParams = this.buildPaginationParams(params);
    httpParams = httpParams.set('status', status.toString());

    return this.http.get<ServiceResponse<PaginatedResponse<CampaignResponse>>>(
      `${this.apiUrl}/filter/by-status`,
      { params: httpParams }
    );
  }

  getCampaignsByType(params: PaginationParameters, type: string): Observable<ServiceResponse<PaginatedResponse<CampaignResponse>>> {
    let httpParams = this.buildPaginationParams(params);
    httpParams = httpParams.set('type', type);

    return this.http.get<ServiceResponse<PaginatedResponse<CampaignResponse>>>(
      `${this.apiUrl}/filter/by-type`,
      { params: httpParams }
    );
  }

  getActiveCampaigns(params: PaginationParameters): Observable<ServiceResponse<PaginatedResponse<CampaignResponse>>> {
    let httpParams = this.buildPaginationParams(params);

    return this.http.get<ServiceResponse<PaginatedResponse<CampaignResponse>>>(
      `${this.apiUrl}/active`,
      { params: httpParams }
    );
  }

  getExpiringSoon(params: PaginationParameters, daysThreshold: number = 7): Observable<ServiceResponse<PaginatedResponse<CampaignResponse>>> {
    let httpParams = this.buildPaginationParams(params);
    httpParams = httpParams.set('daysThreshold', daysThreshold.toString());

    return this.http.get<ServiceResponse<PaginatedResponse<CampaignResponse>>>(
      `${this.apiUrl}/expiring-soon`,
      { params: httpParams }
    );
  }

  getExpiredCampaigns(params: PaginationParameters): Observable<ServiceResponse<PaginatedResponse<CampaignResponse>>> {
    let httpParams = this.buildPaginationParams(params);

    return this.http.get<ServiceResponse<PaginatedResponse<CampaignResponse>>>(
      `${this.apiUrl}/expired`,
      { params: httpParams }
    );
  }

  // ==============================
  // Statistics
  // ==============================

  getCampaignStatistics(): Observable<ServiceResponse<CampaignStatistics>> {
    return this.http.get<ServiceResponse<CampaignStatistics>>(
      `${this.apiUrl}/statistics/dashboard`
    );
  }

  getTotalCampaignsCount(includeDeleted: boolean = false): Observable<ServiceResponse<number>> {
    return this.http.get<ServiceResponse<number>>(
      `${this.apiUrl}/statistics/total-count`,
      { params: { includeDeleted: includeDeleted.toString() } }
    );
  }

  getActiveCampaignsCount(): Observable<ServiceResponse<number>> {
    return this.http.get<ServiceResponse<number>>(
      `${this.apiUrl}/statistics/active-count`
    );
  }

  getTotalMoneyRaised(): Observable<ServiceResponse<number>> {
    return this.http.get<ServiceResponse<number>>(
      `${this.apiUrl}/statistics/total-money`
    );
  }

  // ==============================
  // Private Helpers
  // ==============================

  private buildPaginationParams(params: PaginationParameters): HttpParams {
    let httpParams = new HttpParams()
      .set('pageNumber', params.pageNumber.toString())
      .set('pageSize', params.pageSize.toString());

    if (params.searchTerm) {
      httpParams = httpParams.set('searchTerm', params.searchTerm);
    }
    if (params.sortBy) {
      httpParams = httpParams.set('sortBy', params.sortBy);
    }
    if (params.sortDescending !== undefined) {
      httpParams = httpParams.set('sortDescending', params.sortDescending.toString());
    }

    return httpParams;
  }
}
