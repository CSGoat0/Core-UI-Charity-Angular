import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Organization,
  OrganizationDetails,
  OrganizationDropDown,
  OrganizationRole,
  PaginatedResponse,
  PaginationParameters,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  AssignAdminRequest,
  ServiceResponse
} from '../models/organization.models';
import { UserDto } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  private apiUrl = `${environment.apiUrl}/Organization`;

  constructor(private http: HttpClient) {}

  // ==============================
  // Organization CRUD
  // ==============================

  getAllOrganizations(params: PaginationParameters, includeDeleted: boolean = false): Observable<ServiceResponse<PaginatedResponse<Organization>>> {
    let httpParams = new HttpParams()
      .set('pageNumber', params.pageNumber.toString())
      .set('pageSize', params.pageSize.toString())
      .set('includeDeleted', includeDeleted.toString());

    if (params.searchTerm) {
      httpParams = httpParams.set('searchTerm', params.searchTerm);
    }
    if (params.sortBy) {
      httpParams = httpParams.set('sortBy', params.sortBy);
    }
    if (params.sortDescending !== undefined) {
      httpParams = httpParams.set('sortDescending', params.sortDescending.toString());
    }

    return this.http.get<ServiceResponse<PaginatedResponse<Organization>>>(
      `${this.apiUrl}`,
      { params: httpParams }
    );
  }

  getOrganizationById(id: number): Observable<ServiceResponse<OrganizationDetails>> {
    return this.http.get<ServiceResponse<OrganizationDetails>>(
      `${this.apiUrl}/${id}`
    );
  }

  getOrganizationDetails(id: number): Observable<ServiceResponse<OrganizationDetails>> {
    return this.http.get<ServiceResponse<OrganizationDetails>>(
      `${this.apiUrl}/${id}/details`
    );
  }

  createOrganization(data: CreateOrganizationRequest): Observable<ServiceResponse<Organization>> {
    return this.http.post<ServiceResponse<Organization>>(
      `${this.apiUrl}`,
      data
    );
  }

  updateOrganization(id: number, data: UpdateOrganizationRequest): Observable<ServiceResponse<Organization>> {
    return this.http.put<ServiceResponse<Organization>>(
      `${this.apiUrl}/${id}`,
      data
    );
  }

  deleteOrganization(id: number): Observable<ServiceResponse<null>> {
    return this.http.delete<ServiceResponse<null>>(
      `${this.apiUrl}/${id}`
    );
  }

  restoreOrganization(id: number): Observable<ServiceResponse<null>> {
    return this.http.patch<ServiceResponse<null>>(
      `${this.apiUrl}/${id}/restore`,
      {}
    );
  }

  getDeletedOrganizations(params: PaginationParameters): Observable<ServiceResponse<PaginatedResponse<Organization>>> {
    let httpParams = new HttpParams()
      .set('pageNumber', params.pageNumber.toString())
      .set('pageSize', params.pageSize.toString());

    if (params.searchTerm) {
      httpParams = httpParams.set('searchTerm', params.searchTerm);
    }

    return this.http.get<ServiceResponse<PaginatedResponse<Organization>>>(
      `${this.apiUrl}/deleted`,
      { params: httpParams }
    );
  }

  // ==============================
  // Dropdown
  // ==============================

  getOrganizationsDropdown(params: PaginationParameters): Observable<ServiceResponse<PaginatedResponse<OrganizationDropDown>>> {
    let httpParams = new HttpParams()
      .set('pageNumber', params.pageNumber.toString())
      .set('pageSize', params.pageSize.toString());

    if (params.searchTerm) {
      httpParams = httpParams.set('searchTerm', params.searchTerm);
    }

    return this.http.get<ServiceResponse<PaginatedResponse<OrganizationDropDown>>>(
      `${this.apiUrl}/dropdown`,
      { params: httpParams }
    );
  }

  // ==============================
  // Search & Filter
  // ==============================

  searchOrganizations(params: PaginationParameters, term: string): Observable<ServiceResponse<PaginatedResponse<Organization>>> {
    let httpParams = new HttpParams()
      .set('pageNumber', params.pageNumber.toString())
      .set('pageSize', params.pageSize.toString())
      .set('term', term);

    if (params.sortBy) {
      httpParams = httpParams.set('sortBy', params.sortBy);
    }
    if (params.sortDescending !== undefined) {
      httpParams = httpParams.set('sortDescending', params.sortDescending.toString());
    }

    return this.http.get<ServiceResponse<PaginatedResponse<Organization>>>(
      `${this.apiUrl}/search`,
      { params: httpParams }
    );
  }

  getOrganizationByName(name: string): Observable<ServiceResponse<Organization>> {
    return this.http.get<ServiceResponse<Organization>>(
      `${this.apiUrl}/filter/by-name`,
      { params: { name } }
    );
  }

  getOrganizationsByAddress(params: PaginationParameters, address: string): Observable<ServiceResponse<PaginatedResponse<Organization>>> {
    let httpParams = new HttpParams()
      .set('pageNumber', params.pageNumber.toString())
      .set('pageSize', params.pageSize.toString())
      .set('address', address);

    if (params.sortBy) {
      httpParams = httpParams.set('sortBy', params.sortBy);
    }

    return this.http.get<ServiceResponse<PaginatedResponse<Organization>>>(
      `${this.apiUrl}/filter/by-address`,
      { params: httpParams }
    );
  }

  checkOrganizationNameExists(name: string): Observable<ServiceResponse<boolean>> {
    return this.http.get<ServiceResponse<boolean>>(
      `${this.apiUrl}/name-exists`,
      { params: { name } }
    );
  }

  // ==============================
  // Counts
  // ==============================

  getTotalCount(): Observable<ServiceResponse<number>> {
    return this.http.get<ServiceResponse<number>>(
      `${this.apiUrl}/count/total`
    );
  }

  getActiveCount(): Observable<ServiceResponse<number>> {
    return this.http.get<ServiceResponse<number>>(
      `${this.apiUrl}/count/active`
    );
  }

  // ==============================
  // Organization Admin Management
  // ==============================

  assignOrganizationAdmin(orgId: number, userId: string): Observable<ServiceResponse<null>> {
    return this.http.post<ServiceResponse<null>>(
      `${this.apiUrl}/${orgId}/admin`,
      { userId } as AssignAdminRequest
    );
  }

  removeOrganizationAdmin(orgId: number): Observable<ServiceResponse<null>> {
    return this.http.delete<ServiceResponse<null>>(
      `${this.apiUrl}/${orgId}/admin`
    );
  }

  transferOrganizationAdmin(orgId: number, userId: string): Observable<ServiceResponse<null>> {
    return this.http.post<ServiceResponse<null>>(
      `${this.apiUrl}/${orgId}/admin/transfer`,
      { userId } as AssignAdminRequest
    );
  }

  getOrganizationAdmin(orgId: number): Observable<ServiceResponse<UserDto>> {
    return this.http.get<ServiceResponse<UserDto>>(
      `${this.apiUrl}/${orgId}/admin`
    );
  }

  // ==============================
  // Sub-Admin Management
  // ==============================

  addSubAdmin(orgId: number, userId: string): Observable<ServiceResponse<null>> {
    return this.http.post<ServiceResponse<null>>(
      `${this.apiUrl}/${orgId}/sub-admins`,
      { userId } as AssignAdminRequest
    );
  }

  removeSubAdmin(orgId: number, userId: string): Observable<ServiceResponse<null>> {
    return this.http.delete<ServiceResponse<null>>(
      `${this.apiUrl}/${orgId}/sub-admins/${userId}`
    );
  }

  getSubAdmins(orgId: number): Observable<ServiceResponse<OrganizationRole[]>> {
    return this.http.get<ServiceResponse<OrganizationRole[]>>(
      `${this.apiUrl}/${orgId}/sub-admins`
    );
  }

  isUserSubAdmin(orgId: number, userId: string): Observable<ServiceResponse<boolean>> {
    return this.http.get<ServiceResponse<boolean>>(
      `${this.apiUrl}/${orgId}/sub-admins/${userId}/check`
    );
  }

  // ==============================
  // Campaign-related
  // ==============================

  getOrganizationsByCampaignCount(params: PaginationParameters, minCampaigns: number): Observable<ServiceResponse<PaginatedResponse<Organization>>> {
    let httpParams = new HttpParams()
      .set('pageNumber', params.pageNumber.toString())
      .set('pageSize', params.pageSize.toString())
      .set('minCampaigns', minCampaigns.toString());

    return this.http.get<ServiceResponse<PaginatedResponse<Organization>>>(
      `${this.apiUrl}/campaigns/min-count`,
      { params: httpParams }
    );
  }

  getOrganizationsWithActiveCampaigns(params: PaginationParameters): Observable<ServiceResponse<PaginatedResponse<Organization>>> {
    let httpParams = new HttpParams()
      .set('pageNumber', params.pageNumber.toString())
      .set('pageSize', params.pageSize.toString());

    return this.http.get<ServiceResponse<PaginatedResponse<Organization>>>(
      `${this.apiUrl}/campaigns/active`,
      { params: httpParams }
    );
  }

  getOrganizationsWithCompletedCampaigns(params: PaginationParameters): Observable<ServiceResponse<PaginatedResponse<Organization>>> {
    let httpParams = new HttpParams()
      .set('pageNumber', params.pageNumber.toString())
      .set('pageSize', params.pageSize.toString());

    return this.http.get<ServiceResponse<PaginatedResponse<Organization>>>(
      `${this.apiUrl}/campaigns/completed`,
      { params: httpParams }
    );
  }

  getOrganizationsWithoutCampaigns(params: PaginationParameters): Observable<ServiceResponse<PaginatedResponse<Organization>>> {
    let httpParams = new HttpParams()
      .set('pageNumber', params.pageNumber.toString())
      .set('pageSize', params.pageSize.toString());

    return this.http.get<ServiceResponse<PaginatedResponse<Organization>>>(
      `${this.apiUrl}/campaigns/none`,
      { params: httpParams }
    );
  }
}
