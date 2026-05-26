// src/app/components/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/api.service';
import { DashboardSummary } from '../../models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <h2>Dashboard</h2>

      <div class="stats-grid" *ngIf="summary">
        <div class="stat-card">
          <span class="label">Total books</span>
          <span class="value">{{ summary.totalBooks }}</span>
        </div>
        <div class="stat-card blue">
          <span class="label">Active loans</span>
          <span class="value">{{ summary.activeLoans }}</span>
        </div>
        <div class="stat-card green">
          <span class="label">Available</span>
          <span class="value">{{ summary.availableBooks }}</span>
        </div>
        <div class="stat-card red">
          <span class="label">Overdue</span>
          <span class="value">{{ summary.overdueLoans }}</span>
        </div>
      </div>

      <div class="panels" *ngIf="summary">
        <div class="panel">
          <h3>Recent loans</h3>
          <div class="loan-row" *ngFor="let loan of summary.recentLoans">
            <div class="loan-info">
              <strong>{{ loan.bookTitle }}</strong>
              <span class="muted">{{ loan.memberName }}</span>
            </div>
            <span class="badge" [class]="loan.status.toLowerCase()">{{ loan.status }}</span>
          </div>
          <p class="empty" *ngIf="!summary.recentLoans.length">No loans yet</p>
        </div>

        <div class="panel">
          <h3>Books by category</h3>
          <div class="cat-row" *ngFor="let c of summary.booksByCategory">
            <span>{{ c.category }}</span>
            <div class="bar-wrap">
              <div class="bar" [style.width.%]="(c.count / summary.totalBooks) * 100"></div>
            </div>
            <strong>{{ c.count }}</strong>
          </div>
        </div>
      </div>

      <p *ngIf="error" class="error">{{ error }}</p>
    </div>
  `,
  styles: [`
    .page { padding: 1.5rem; }
    h2 { font-size: 1.25rem; font-weight: 500; margin-bottom: 1.5rem; }
    h3 { font-size: 1rem; font-weight: 500; margin-bottom: 1rem; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 1.5rem; }
    .stat-card { background: #f5f5f5; border-radius: 8px; padding: 1rem; }
    .stat-card.blue { background: #e6f1fb; }
    .stat-card.green { background: #eaf3de; }
    .stat-card.red { background: #fcebeb; }
    .stat-card .label { display: block; font-size: 13px; color: #666; margin-bottom: 4px; }
    .stat-card .value { display: block; font-size: 1.75rem; font-weight: 500; }
    .panels { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .panel { border: 1px solid #eee; border-radius: 10px; padding: 1rem; }
    .loan-row { display: flex; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
    .loan-info { flex: 1; } .loan-info strong { display: block; font-size: 14px; } .loan-info span { font-size: 12px; color: #888; }
    .badge { font-size: 12px; padding: 3px 10px; border-radius: 99px; font-weight: 500; }
    .badge.active { background: #e6f1fb; color: #185fa5; }
    .badge.returned { background: #f5f5f5; color: #666; }
    .badge.overdue { background: #fcebeb; color: #a32d2d; }
    .cat-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-size: 13px; }
    .bar-wrap { flex: 1; height: 6px; background: #f0f0f0; border-radius: 99px; overflow: hidden; }
    .bar { height: 100%; background: #185fa5; border-radius: 99px; }
    .muted { color: #888; }
    .empty { color: #aaa; font-size: 13px; }
    .error { color: #a32d2d; }
  `]
})
export class DashboardComponent implements OnInit {
  summary?: DashboardSummary;
  error = '';

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.dashboardService.getSummary().subscribe({
      next: (s) => (this.summary = s),
      error: () => (this.error = 'Failed to load dashboard.')
    });
  }
}
