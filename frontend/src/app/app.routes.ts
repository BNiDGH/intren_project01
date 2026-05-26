import { Routes } from '@angular/router';

// นำเข้า Components ต่างๆ ที่เราสร้างไว้
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { BooksComponent } from './components/book/books.component';
import { MembersComponent } from './components/members/members.component';
import { LoansComponent } from './components/loans/loans.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'books', component: BooksComponent },
  { path: 'members', component: MembersComponent },
  { path: 'loans', component: LoansComponent }
];