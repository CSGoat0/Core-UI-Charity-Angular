import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  ContainerComponent,
  RowComponent,
  AlertComponent,
  BadgeComponent
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';

import { AuthService } from '../../services/auth.service';
import { DashboardService } from '../../services/dashboard.service';
import {
  UserStats,
  TopCampaign,
  RecentDonation,
  TopDonor,
  TrendDataPoint,
  MonthlyReportDataPoint,
  DayOfWeekDataPoint,
  TimeOfDayDataPoint
} from '../../models/dashboard.models';
import { DashboardChartComponent } from './components/dashboard-chart/dashboard-chart.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  imports: [
    CommonModule,
    RouterLink,
    ContainerComponent,
    RowComponent,
    ColComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    ButtonDirective,
    AlertComponent,
    BadgeComponent,
    IconDirective,
    DashboardChartComponent
  ]
})
export class DashboardComponent implements OnInit, OnDestroy {
  isLoading = true;
  errorMessage: string | null = null;

  // Hero stats
  totalRaised = 0;
  totalDonations = 0;
  totalCampaigns = 0;
  totalOrganizations = 0;
  totalUsers = 0;

  // User stats (personal)
  userStats: UserStats = { totalDonated: 0, donationCount: 0 };

  // Charts
  trendLabels: string[] = [];
  trendData: number[] = [];

  monthlyLabels: string[] = [];
  monthlyData: number[] = [];

  dayOfWeekLabels: string[] = [];
  dayOfWeekData: number[] = [];

  timeOfDayLabels: string[] = [];
  timeOfDayData: number[] = [];

  // Lists
  topCampaigns: TopCampaign[] = [];
  urgentCampaigns: TopCampaign[] = [];
  topDonors: TopDonor[] = [];
  latestDonations: RecentDonation[] = [];
  myRecentDonations: RecentDonation[] = [];

  private timeoutId: any = null;

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  ngOnDestroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  // ==============================
  // Role Checks
  // ==============================

  get isSuperAdmin(): boolean {
    return this.authService.isSuperAdmin();
  }

  get isOrganizationAdmin(): boolean {
    const user = this.authService.getUser();
    if (!user || !user.roles) return false;

    // Check if any role matches "OrgName: Admin" or "OrgName: SubAdmin"
    return user.roles.some(r =>
      r.endsWith(': Admin') || r.endsWith(': SubAdmin')
    );
  }

  get currentUserFullName(): string {
    const user = this.authService.getUser();
    return user?.fullName || user?.userName || 'User';
  }

  // ==============================
  // Load Dashboard
  // ==============================

  loadDashboard(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.cdr.detectChanges();

    const user = this.authService.getUser();
    const userId = user?.id;

    // Parallel requests
    forkJoin({
      totalRaised: this.dashboardService.getTotalDonationsAmount().pipe(catchError(() => of(null))),
      totalDonations: this.dashboardService.getTotalDonationsCount().pipe(catchError(() => of(null))),
      totalCampaigns: this.dashboardService.getTotalCampaignsCount().pipe(catchError(() => of(null))),
      totalOrganizations: this.dashboardService.getTotalOrganizationsCount().pipe(catchError(() => of(null))),
      totalUsers: this.dashboardService.getTotalUsersCount().pipe(catchError(() => of(null))),

      userTotalDonated: userId
        ? this.dashboardService.getUserTotalDonated(userId).pipe(catchError(() => of(null)))
        : of(null),
      userDonationCount: userId
        ? this.dashboardService.getUserDonationCount(userId).pipe(catchError(() => of(null)))
        : of(null),

      trend: this.dashboardService.getDonationsTrend(30).pipe(catchError(() => of(null))),
      monthly: this.dashboardService.getMonthlyReport(new Date().getFullYear()).pipe(catchError(() => of(null))),
      dayOfWeek: this.dashboardService.getDonationsByDayOfWeek().pipe(catchError(() => of(null))),
      timeOfDay: this.dashboardService.getDonationsByTimeOfDay().pipe(catchError(() => of(null))),

      topCampaigns: this.dashboardService.getTopCampaigns(5).pipe(catchError(() => of(null))),
      urgentCampaigns: this.dashboardService.getUrgentCampaigns(75, 5).pipe(catchError(() => of(null))),
      topDonors: this.dashboardService.getTopDonors(5).pipe(catchError(() => of(null))),
      latestDonations: this.dashboardService.getLatestDonations(10).pipe(catchError(() => of(null))),
      myRecentDonations: userId
        ? this.dashboardService.getUserDonationHistory(userId, 5).pipe(catchError(() => of(null)))
        : of(null)
    }).subscribe({
      next: (result) => {
        this.isLoading = false;

        // Hero stats
        if (result.totalRaised?.success) this.totalRaised = result.totalRaised.data ?? 0;
        if (result.totalDonations?.success) this.totalDonations = result.totalDonations.data ?? 0;
        if (result.totalCampaigns?.success) this.totalCampaigns = result.totalCampaigns.data ?? 0;
        if (result.totalOrganizations?.success) this.totalOrganizations = result.totalOrganizations.data ?? 0;
        if (result.totalUsers?.success) this.totalUsers = result.totalUsers.data ?? 0;

        // User stats
        if (result.userTotalDonated?.success) this.userStats.totalDonated = result.userTotalDonated.data ?? 0;
        if (result.userDonationCount?.success) this.userStats.donationCount = result.userDonationCount.data ?? 0;

        // Charts
        if (result.trend?.success && result.trend.data) {
          this.trendLabels = result.trend.data.map((p: TrendDataPoint) =>
            new Date(p.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
          );
          this.trendData = result.trend.data.map((p: TrendDataPoint) => p.amount);
        }

        if (result.monthly?.success && result.monthly.data) {
          this.monthlyLabels = result.monthly.data.map((p: MonthlyReportDataPoint) => p.month);
          this.monthlyData = result.monthly.data.map((p: MonthlyReportDataPoint) => p.amount);
        }

        if (result.dayOfWeek?.success && result.dayOfWeek.data) {
          this.dayOfWeekLabels = result.dayOfWeek.data.map((p) => p.day);
          this.dayOfWeekData = result.dayOfWeek.data.map((p) => p.amount);
        }

        if (result.timeOfDay?.success && result.timeOfDay.data) {
          this.timeOfDayLabels = result.timeOfDay.data.map((p) => p.timeOfDay);
          this.timeOfDayData = result.timeOfDay.data.map((p) => p.amount);
        }

        // Lists
        if (result.topCampaigns?.success) this.topCampaigns = result.topCampaigns.data ?? [];
        if (result.urgentCampaigns?.success) this.urgentCampaigns = result.urgentCampaigns.data ?? [];
        if (result.topDonors?.success) this.topDonors = result.topDonors.data ?? [];
        if (result.latestDonations?.success) this.latestDonations = result.latestDonations.data ?? [];
        if (result.myRecentDonations?.success) this.myRecentDonations = result.myRecentDonations.data ?? [];

        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load dashboard data.';
        console.error('Dashboard load error:', error);
        this.cdr.detectChanges();
      }
    });
  }

  // ==============================
  // Helpers
  // ==============================

  viewCampaign(id: number): void {
    this.router.navigate(['/campaigns', id]);
  }

  viewUser(userId: string): void {
    this.router.navigate(['/admin/users', userId]);
  }

  getCampaignProgress(campaign: TopCampaign): number {
    if (!campaign.target || campaign.target === 0 || !campaign.achieved) return 0;
    return Math.min((campaign.achieved / campaign.target) * 100, 100);
  }

  getProgressColor(campaign: TopCampaign): string {
    const percentage = this.getCampaignProgress(campaign);
    if (percentage >= 90) return 'success';
    if (percentage >= 60) return 'info';
    if (percentage >= 30) return 'warning';
    return 'danger';
  }

  getDonorShortId(userId: string): string {
    if (!userId) return 'Unknown';
    return userId.length > 12 ? `${userId.substring(0, 8)}...` : userId;
  }

  get currentYear(): number {
    return new Date().getFullYear();
  }
}
