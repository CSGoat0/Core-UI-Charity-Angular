import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Donation,
  CreateDonationRequest,
  UpdateDonationRequest,
  CreatePaymentRequest,
  PaymentInfo,
  CreatePaymentInfoRequest,
  UpdatePaymentInfoRequest,
  DonationStatistics,
  PaginationParameters,
  PaginatedResponse,
  ServiceResponse
} from '../models/donation.models';

@Injectable({
  providedIn: 'root'
})
export class DonationService {
  private donationApiUrl = `${environment.apiUrl}/Donations`;
  private paymentApiUrl = `${environment.apiUrl}/Payment`;
  private paymentInfoApiUrl = `${environment.apiUrl}/PaymentInfo`;

  constructor(private http: HttpClient) {}

  // ==============================
  // Donation CRUD
  // ==============================

  /**
   * Get all donations with pagination
   */
  getAllDonations(params: PaginationParameters, includeDeleted: boolean = false): Observable<ServiceResponse<PaginatedResponse<Donation>>> {
    let httpParams = this.buildPaginationParams(params);
    httpParams = httpParams.set('includeDeleted', includeDeleted.toString());

    return this.http.get<ServiceResponse<PaginatedResponse<Donation>>>(
      `${this.donationApiUrl}`,
      { params: httpParams }
    );
  }

  /**
   * Get donation by ID
   */
  getDonationById(id: number): Observable<ServiceResponse<Donation>> {
    return this.http.get<ServiceResponse<Donation>>(
      `${this.donationApiUrl}/${id}`
    );
  }

  /**
   * Get donation with details (campaign + user)
   */
  getDonationWithDetails(id: number): Observable<ServiceResponse<Donation>> {
    return this.http.get<ServiceResponse<Donation>>(
      `${this.donationApiUrl}/${id}/details`
    );
  }

  /**
   * Create donation
   */
  createDonation(data: CreateDonationRequest): Observable<ServiceResponse<Donation>> {
    return this.http.post<ServiceResponse<Donation>>(
      `${this.donationApiUrl}`,
      data
    );
  }

  /**
   * Update donation
   */
  updateDonation(id: number, data: UpdateDonationRequest): Observable<ServiceResponse<Donation>> {
    return this.http.put<ServiceResponse<Donation>>(
      `${this.donationApiUrl}/${id}`,
      data
    );
  }

  /**
   * Delete donation
   */
  deleteDonation(id: number): Observable<ServiceResponse<boolean>> {
    return this.http.delete<ServiceResponse<boolean>>(
      `${this.donationApiUrl}/${id}`
    );
  }

  /**
   * Restore donation
   */
  restoreDonation(id: number): Observable<ServiceResponse<boolean>> {
    return this.http.patch<ServiceResponse<boolean>>(
      `${this.donationApiUrl}/${id}/restore`,
      {}
    );
  }

  // ==============================
  // Donation Filtering
  // ==============================

  /**
   * Get donations by user
   */
  getDonationsByUser(params: PaginationParameters, userId: string): Observable<ServiceResponse<PaginatedResponse<Donation>>> {
    let httpParams = this.buildPaginationParams(params);

    return this.http.get<ServiceResponse<PaginatedResponse<Donation>>>(
      `${this.donationApiUrl}/by-user/${userId}`,
      { params: httpParams }
    );
  }

  /**
   * Get donations by campaign
   */
  getDonationsByCampaign(params: PaginationParameters, campaignId: number): Observable<ServiceResponse<PaginatedResponse<Donation>>> {
    let httpParams = this.buildPaginationParams(params);

    return this.http.get<ServiceResponse<PaginatedResponse<Donation>>>(
      `${this.donationApiUrl}/by-campaign/${campaignId}`,
      { params: httpParams }
    );
  }

  /**
   * Get donations by amount range
   */
  getDonationsByAmountRange(params: PaginationParameters, min: number, max: number): Observable<ServiceResponse<PaginatedResponse<Donation>>> {
    let httpParams = this.buildPaginationParams(params);
    httpParams = httpParams.set('min', min.toString());
    httpParams = httpParams.set('max', max.toString());

    return this.http.get<ServiceResponse<PaginatedResponse<Donation>>>(
      `${this.donationApiUrl}/by-amount-range`,
      { params: httpParams }
    );
  }

  /**
   * Get donations by date range
   */
  getDonationsByDateRange(params: PaginationParameters, startDate: Date, endDate: Date): Observable<ServiceResponse<PaginatedResponse<Donation>>> {
    let httpParams = this.buildPaginationParams(params);
    httpParams = httpParams.set('startDate', startDate.toISOString());
    httpParams = httpParams.set('endDate', endDate.toISOString());

    return this.http.get<ServiceResponse<PaginatedResponse<Donation>>>(
      `${this.donationApiUrl}/by-date-range`,
      { params: httpParams }
    );
  }

  /**
   * Get user's own donation history
   */
  getUserDonationHistory(params: PaginationParameters, userId: string): Observable<ServiceResponse<PaginatedResponse<Donation>>> {
    let httpParams = this.buildPaginationParams(params);

    return this.http.get<ServiceResponse<PaginatedResponse<Donation>>>(
      `${this.donationApiUrl}/users/${userId}/history`,
      { params: httpParams }
    );
  }

  /**
   * Get recent donations
   */
  getRecentDonations(params: PaginationParameters, days: number = 30): Observable<ServiceResponse<PaginatedResponse<Donation>>> {
    let httpParams = this.buildPaginationParams(params);
    httpParams = httpParams.set('days', days.toString());

    return this.http.get<ServiceResponse<PaginatedResponse<Donation>>>(
      `${this.donationApiUrl}/recent`,
      { params: httpParams }
    );
  }

  // ==============================
  // Donation Statistics
  // ==============================

  /**
   * Get total donations amount
   */
  getTotalDonationsAmount(): Observable<ServiceResponse<number>> {
    return this.http.get<ServiceResponse<number>>(
      `${this.donationApiUrl}/stats/total-amount`
    );
  }

  /**
   * Get total donations count
   */
  getTotalDonationsCount(): Observable<ServiceResponse<number>> {
    return this.http.get<ServiceResponse<number>>(
      `${this.donationApiUrl}/stats/total-count`
    );
  }

  /**
   * Get total amount by user
   */
  getTotalAmountByUser(userId: string): Observable<ServiceResponse<number>> {
    return this.http.get<ServiceResponse<number>>(
      `${this.donationApiUrl}/stats/total-amount/by-user/${userId}`
    );
  }

  /**
   * Get total amount by campaign
   */
  getTotalAmountByCampaign(campaignId: number): Observable<ServiceResponse<number>> {
    return this.http.get<ServiceResponse<number>>(
      `${this.donationApiUrl}/stats/total-amount/by-campaign/${campaignId}`
    );
  }

  /**
   * Get donation count by user
   */
  getDonationCountByUser(userId: string): Observable<ServiceResponse<number>> {
    return this.http.get<ServiceResponse<number>>(
      `${this.donationApiUrl}/stats/count/by-user/${userId}`
    );
  }

  /**
   * Get donation count by campaign
   */
  getDonationCountByCampaign(campaignId: number): Observable<ServiceResponse<number>> {
    return this.http.get<ServiceResponse<number>>(
      `${this.donationApiUrl}/stats/count/by-campaign/${campaignId}`
    );
  }

  // ==============================
  // Payment Methods
  // ==============================

  /**
   * Create payment session (Paymob iFrame URL)
   */
  createPayment(data: CreatePaymentRequest): Observable<ServiceResponse<string>> {
    return this.http.post<ServiceResponse<string>>(
      `${this.paymentApiUrl}/create`,
      data
    );
  }

  // ==============================
  // Payment Info Methods
  // ==============================

  /**
   * Get payment info by organization ID
   */
  getPaymentInfoByOrganizationId(organizationId: number): Observable<ServiceResponse<PaymentInfo>> {
    return this.http.get<ServiceResponse<PaymentInfo>>(
      `${this.paymentInfoApiUrl}/by-organization/${organizationId}`
    );
  }

  /**
   * Get payment info by ID
   */
  getPaymentInfoById(paymentInfoId: number): Observable<ServiceResponse<PaymentInfo>> {
    return this.http.get<ServiceResponse<PaymentInfo>>(
      `${this.paymentInfoApiUrl}/${paymentInfoId}`
    );
  }

  /**
   * Create payment info
   */
  createPaymentInfo(data: CreatePaymentInfoRequest): Observable<ServiceResponse<PaymentInfo>> {
    return this.http.post<ServiceResponse<PaymentInfo>>(
      `${this.paymentInfoApiUrl}`,
      data
    );
  }

  /**
   * Update payment info
   */
  updatePaymentInfo(paymentInfoId: number, data: UpdatePaymentInfoRequest): Observable<ServiceResponse<PaymentInfo>> {
    return this.http.put<ServiceResponse<PaymentInfo>>(
      `${this.paymentInfoApiUrl}/${paymentInfoId}`,
      data
    );
  }

  /**
   * Delete payment info
   */
  deletePaymentInfo(paymentInfoId: number): Observable<ServiceResponse<boolean>> {
    return this.http.delete<ServiceResponse<boolean>>(
      `${this.paymentInfoApiUrl}/${paymentInfoId}`
    );
  }

  /**
   * Restore payment info
   */
  restorePaymentInfo(paymentInfoId: number): Observable<ServiceResponse<boolean>> {
    return this.http.post<ServiceResponse<boolean>>(
      `${this.paymentInfoApiUrl}/restore/${paymentInfoId}`,
      {}
    );
  }

  /**
   * Check if organization has payment info
   */
  hasPaymentInfo(organizationId: number): Observable<ServiceResponse<boolean>> {
    return this.http.get<ServiceResponse<boolean>>(
      `${this.paymentInfoApiUrl}/has/${organizationId}`
    );
  }

  /**
   * Validate payment info
   */
  validatePaymentInfo(organizationId: number): Observable<ServiceResponse<boolean>> {
    return this.http.get<ServiceResponse<boolean>>(
      `${this.paymentInfoApiUrl}/validate/${organizationId}`
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
