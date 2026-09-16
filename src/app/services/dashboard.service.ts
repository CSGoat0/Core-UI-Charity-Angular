import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  ServiceResponse,
  UserStats,
  TopCampaign,
  RecentDonation,
  TrendDataPoint,
  MonthlyReportDataPoint,
  YearlyReportDataPoint,
  DayOfWeekDataPoint,
  TimeOfDayDataPoint,
  TopDonor
} from '../models/dashboard.models';
import { PaginatedResponse } from '../models/organization.models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private donationApiUrl = `${environment.apiUrl}/Donations`;
  private campaignApiUrl = `${environment.apiUrl}/Campaign`;
  private organizationApiUrl = `${environment.apiUrl}/Organization`;
  private userApiUrl = `${environment.apiUrl}/User`;

  constructor(private http: HttpClient) {}

  // ==============================
  // Hero Stats
  // ==============================

  getTotalDonationsAmount(): Observable<ServiceResponse<number>> {
    return this.http.get<ServiceResponse<number>>(
      `${this.donationApiUrl}/stats/total-amount`
    );
  }

  getTotalDonationsCount(): Observable<ServiceResponse<number>> {
    return this.http.get<ServiceResponse<number>>(
      `${this.donationApiUrl}/stats/total-count`
    );
  }

  getTotalCampaignsCount(): Observable<ServiceResponse<number>> {
    return this.http.get<ServiceResponse<number>>(
      `${this.campaignApiUrl}/statistics/total-count`
    );
  }

  getTotalOrganizationsCount(): Observable<ServiceResponse<number>> {
    return this.http.get<ServiceResponse<number>>(
      `${this.organizationApiUrl}/count/total`
    );
  }

  /**
   * Get total users count (uses paginated endpoint with pageSize=1)
   */
  getTotalUsersCount(): Observable<ServiceResponse<number>> {
    const params = new HttpParams()
      .set('pageNumber', '1')
      .set('pageSize', '1');

    return this.http.get<ServiceResponse<PaginatedResponse<any>>>(
      `${this.userApiUrl}`,
      { params }
    ).pipe(
      map(response => ({
        success: response.success,
        message: response.message,
        data: response.data?.totalCount ?? 0
      } as ServiceResponse<number>))
    );
  }

  // ==============================
  // User Stats
  // ==============================

  getUserTotalDonated(userId: string): Observable<ServiceResponse<number>> {
    return this.http.get<ServiceResponse<number>>(
      `${this.donationApiUrl}/stats/total-amount/by-user/${userId}`
    );
  }

  getUserDonationCount(userId: string): Observable<ServiceResponse<number>> {
    return this.http.get<ServiceResponse<number>>(
      `${this.donationApiUrl}/stats/count/by-user/${userId}`
    );
  }

  // ==============================
  // Charts
  // ==============================

  getDonationsTrend(days: number = 30): Observable<ServiceResponse<TrendDataPoint[]>> {
    return this.http.get<ServiceResponse<{ [date: string]: number }>>(
      `${this.donationApiUrl}/analytics/trend?days=${days}`
    ).pipe(
      map(response => {
        if (response.success && response.data) {
          const trend = Object.entries(response.data).map(([date, amount]) => ({
            date,
            amount
          }));
          return {
            success: true,
            message: response.message,
            data: trend
          } as ServiceResponse<TrendDataPoint[]>;
        }
        return {
          success: response.success,
          message: response.message,
          data: []
        } as ServiceResponse<TrendDataPoint[]>;
      })
    );
  }

  getMonthlyReport(year: number): Observable<ServiceResponse<MonthlyReportDataPoint[]>> {
    return this.http.get<ServiceResponse<{ [month: string]: number }>>(
      `${this.donationApiUrl}/reports/monthly?year=${year}`
    ).pipe(
      map(response => {
        if (response.success && response.data) {
          const report = Object.entries(response.data).map(([month, amount]) => ({
            month,
            amount
          }));
          return {
            success: true,
            message: response.message,
            data: report
          } as ServiceResponse<MonthlyReportDataPoint[]>;
        }
        return {
          success: response.success,
          message: response.message,
          data: []
        } as ServiceResponse<MonthlyReportDataPoint[]>;
      })
    );
  }

  getYearlyReport(yearsBack: number = 5): Observable<ServiceResponse<YearlyReportDataPoint[]>> {
    return this.http.get<ServiceResponse<{ [year: string]: number }>>(
      `${this.donationApiUrl}/reports/yearly?yearsBack=${yearsBack}`
    ).pipe(
      map(response => {
        if (response.success && response.data) {
          const report = Object.entries(response.data).map(([year, amount]) => ({
            year,
            amount
          }));
          return {
            success: true,
            message: response.message,
            data: report
          } as ServiceResponse<YearlyReportDataPoint[]>;
        }
        return {
          success: response.success,
          message: response.message,
          data: []
        } as ServiceResponse<YearlyReportDataPoint[]>;
      })
    );
  }

  getDonationsByDayOfWeek(): Observable<ServiceResponse<DayOfWeekDataPoint[]>> {
    return this.http.get<ServiceResponse<{ [day: string]: number }>>(
      `${this.donationApiUrl}/reports/by-day-of-week`
    ).pipe(
      map(response => {
        if (response.success && response.data) {
          const data = Object.entries(response.data).map(([day, amount]) => ({
            day,
            amount
          }));
          return {
            success: true,
            message: response.message,
            data
          } as ServiceResponse<DayOfWeekDataPoint[]>;
        }
        return {
          success: response.success,
          message: response.message,
          data: []
        } as ServiceResponse<DayOfWeekDataPoint[]>;
      })
    );
  }

  getDonationsByTimeOfDay(): Observable<ServiceResponse<TimeOfDayDataPoint[]>> {
    return this.http.get<ServiceResponse<{ [timeOfDay: string]: number }>>(
      `${this.donationApiUrl}/reports/by-time-of-day`
    ).pipe(
      map(response => {
        if (response.success && response.data) {
          const data = Object.entries(response.data).map(([timeOfDay, amount]) => ({
            timeOfDay,
            amount
          }));
          return {
            success: true,
            message: response.message,
            data
          } as ServiceResponse<TimeOfDayDataPoint[]>;
        }
        return {
          success: response.success,
          message: response.message,
          data: []
        } as ServiceResponse<TimeOfDayDataPoint[]>;
      })
    );
  }

  // ==============================
  // Top & Urgent Campaigns
  // ==============================

  getTopCampaigns(limit: number = 5): Observable<ServiceResponse<TopCampaign[]>> {
    return this.http.get<ServiceResponse<PaginatedResponse<TopCampaign>>>(
      `${this.campaignApiUrl}/trending/top-by-donations?pageNumber=1&pageSize=${limit}&limit=${limit}`
    ).pipe(
      map(response => ({
        success: response.success,
        message: response.message,
        data: response.data?.items ?? []
      } as ServiceResponse<TopCampaign[]>))
    );
  }

  getUrgentCampaigns(minPercentage: number = 75, limit: number = 5): Observable<ServiceResponse<TopCampaign[]>> {
    return this.http.get<ServiceResponse<PaginatedResponse<TopCampaign>>>(
      `${this.campaignApiUrl}/trending/urgent?pageNumber=1&pageSize=${limit}&minPercentage=${minPercentage}`
    ).pipe(
      map(response => ({
        success: response.success,
        message: response.message,
        data: response.data?.items ?? []
      } as ServiceResponse<TopCampaign[]>))
    );
  }

  // ==============================
  // Top Donors
  // ==============================

  getTopDonors(limit: number = 5): Observable<ServiceResponse<TopDonor[]>> {
    return this.http.get<ServiceResponse<{ [userId: string]: number }>>(
      `${this.donationApiUrl}/analytics/top-donors?limit=${limit}`
    ).pipe(
      map(response => {
        if (response.success && response.data) {
          const donors = Object.entries(response.data).map(([userId, totalDonated]) => ({
            userId,
            totalDonated
          }));
          return {
            success: true,
            message: response.message,
            data: donors
          } as ServiceResponse<TopDonor[]>;
        }
        return {
          success: response.success,
          message: response.message,
          data: []
        } as ServiceResponse<TopDonor[]>;
      })
    );
  }

  // ==============================
  // Recent Activity
  // ==============================

  getLatestDonations(limit: number = 10): Observable<ServiceResponse<RecentDonation[]>> {
    return this.http.get<ServiceResponse<PaginatedResponse<RecentDonation>>>(
      `${this.donationApiUrl}/dashboard/latest?pageNumber=1&pageSize=${limit}&limit=${limit}`
    ).pipe(
      map(response => ({
        success: response.success,
        message: response.message,
        data: response.data?.items ?? []
      } as ServiceResponse<RecentDonation[]>))
    );
  }

  getUserDonationHistory(userId: string, limit: number = 5): Observable<ServiceResponse<RecentDonation[]>> {
    return this.http.get<ServiceResponse<PaginatedResponse<RecentDonation>>>(
      `${this.donationApiUrl}/users/${userId}/history?pageNumber=1&pageSize=${limit}`
    ).pipe(
      map(response => ({
        success: response.success,
        message: response.message,
        data: response.data?.items ?? []
      } as ServiceResponse<RecentDonation[]>))
    );
  }
}
