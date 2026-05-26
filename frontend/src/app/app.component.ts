// src/app/app.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  template: `
    <div class="app-shell">
      <nav class="sidebar">
        <div class="brand">
          <span class="brand-icon">📚</span>
          <span class="brand-name">Library</span>
        </div>
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">⊞</span> Dashboard
        </a>
        <a routerLink="/books" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">📖</span> Books
        </a>
        <a routerLink="/members" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">👤</span> Members
        </a>
        <a routerLink="/loans" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">↔</span> Loans
        </a>
      </nav>
      <main class="content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-shell { display: flex; height: 100vh; font-family: system-ui, sans-serif; }
    .sidebar { width: 220px; background: #0f172a; display: flex; flex-direction: column; gap: 4px; padding: 1.5rem 1rem; flex-shrink: 0; }
    .brand { display: flex; align-items: center; gap: 8px; color: #fff; font-size: 1.1rem; font-weight: 500; margin-bottom: 1.5rem; padding: 0 8px; }
    .brand-icon { font-size: 1.4rem; }
    .nav-item { display: flex; align-items: center; gap: 10px; color: #94a3b8; text-decoration: none; padding: 8px 12px; border-radius: 8px; font-size: 14px; transition: all 0.15s; }
    .nav-item:hover { background: rgba(255,255,255,0.08); color: #fff; }
    .nav-item.active { background: #185fa5; color: #fff; }
    .nav-icon { font-size: 16px; }
    .content { flex: 1; overflow-y: auto; background: #f9fafb; }
  `]
})
export class AppComponent {}

// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { BooksComponent } from './components/book/books.component';
import { MembersComponent } from './components/members/members.component';
import { LoansComponent } from './components/loans/loans.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'books', component: BooksComponent },
  { path: 'members', component: MembersComponent },
  { path: 'loans', component: LoansComponent },
];

// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
  ]
};
