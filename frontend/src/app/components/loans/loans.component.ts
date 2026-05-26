// src/app/components/loans/loans.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoanService, BookService, MemberService } from '../../services/api.service';
import { Loan, Book, Member } from '../../models/models';

@Component({
  selector: 'app-loans',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="toolbar">
        <h2>Loans</h2>
        <select [(ngModel)]="statusFilter" (ngModelChange)="load()" class="input-sm">
          <option value="">All statuses</option>
          <option>Active</option><option>Returned</option><option>Overdue</option>
        </select>
        <button class="btn-primary" (click)="showForm = true">+ New loan</button>
      </div>

      <table class="table">
        <thead>
          <tr><th>Book</th><th>Member</th><th>Borrowed</th><th>Due date</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let l of loans">
            <td><strong>{{ l.bookTitle }}</strong></td>
            <td>{{ l.memberName }}</td>
            <td>{{ l.borrowedAt | date:'mediumDate' }}</td>
            <td>{{ l.dueDate | date:'mediumDate' }}</td>
            <td><span class="badge" [class]="l.status.toLowerCase()">{{ l.status }}</span></td>
            <td class="actions">
              <button class="btn-sm green" *ngIf="l.status !== 'Returned'" (click)="returnLoan(l.id)">Return</button>
              <button class="btn-sm danger" (click)="delete(l.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p *ngIf="!loans.length" class="empty">No loans found.</p>

      <!-- New Loan Modal -->
      <div class="overlay" *ngIf="showForm" (click)="closeForm()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <span>New loan</span>
            <button (click)="closeForm()">✕</button>
          </div>
          <label>Book *</label>
          <select [(ngModel)]="newLoan.bookId" class="input">
            <option [ngValue]="0" disabled>Select a book...</option>
            <option *ngFor="let b of availableBooks" [ngValue]="b.id">{{ b.title }}</option>
          </select>
          <label>Member *</label>
          <select [(ngModel)]="newLoan.memberId" class="input">
            <option [ngValue]="0" disabled>Select a member...</option>
            <option *ngFor="let m of members" [ngValue]="m.id">{{ m.fullName }}</option>
          </select>
          <label>Due date *</label>
          <input [(ngModel)]="newLoan.dueDate" type="date" class="input">
          <p class="error" *ngIf="formError">{{ formError }}</p>
          <div class="modal-footer">
            <button class="btn-sm" (click)="closeForm()">Cancel</button>
            <button class="btn-primary" (click)="createLoan()">Create loan</button>
          </div>
        </div>
      </div>

      <p *ngIf="error" class="error">{{ error }}</p>
    </div>
  `,
  styles: [`
    .page { padding: 1.5rem; }
    .toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 1rem; }
    .toolbar h2 { font-size: 1.25rem; font-weight: 500; margin-right: auto; }
    .input-sm { font-size: 13px; padding: 6px 10px; border: 1px solid #ddd; border-radius: 6px; }
    .btn-primary { background: #185fa5; color: #fff; border: none; padding: 7px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; }
    .btn-sm { font-size: 12px; padding: 4px 10px; border: 1px solid #ddd; border-radius: 5px; background: #fff; cursor: pointer; }
    .btn-sm.green { background: #eaf3de; color: #3b6d11; border-color: #c0dd97; }
    .btn-sm.danger { color: #a32d2d; border-color: #f7c1c1; }
    .table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .table th { text-align: left; padding: 8px; color: #888; font-weight: 500; border-bottom: 1px solid #eee; }
    .table td { padding: 10px 8px; border-bottom: 1px solid #f5f5f5; }
    .actions { display: flex; gap: 6px; justify-content: flex-end; }
    .badge { font-size: 12px; padding: 3px 10px; border-radius: 99px; font-weight: 500; }
    .badge.active { background: #e6f1fb; color: #185fa5; }
    .badge.returned { background: #f5f5f5; color: #666; }
    .badge.overdue { background: #fcebeb; color: #a32d2d; }
    .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: flex-start; justify-content: center; padding-top: 80px; z-index: 100; }
    .modal { background: #fff; border-radius: 12px; padding: 1.5rem; width: 400px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; font-weight: 500; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 8px; margin-top: 1rem; }
    label { display: block; font-size: 13px; color: #666; margin-bottom: 4px; margin-top: 10px; }
    .input { width: 100%; padding: 7px 10px; font-size: 13px; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box; }
    .empty { color: #aaa; font-size: 13px; text-align: center; padding: 2rem; }
    .error { color: #a32d2d; font-size: 13px; margin-top: 6px; }
  `]
})
export class LoansComponent implements OnInit {
  loans: Loan[] = [];
  availableBooks: Book[] = [];
  members: Member[] = [];
  statusFilter = '';
  showForm = false;
  error = '';
  formError = '';
  newLoan = { bookId: 0, memberId: 0, dueDate: '' };

  constructor(
    private loanService: LoanService,
    private bookService: BookService,
    private memberService: MemberService
  ) {}

  ngOnInit() {
    this.load();
    this.bookService.getAll().subscribe(books => this.availableBooks = books.filter(b => b.status === 'Available'));
    this.memberService.getAll().subscribe(members => this.members = members);
    const due = new Date(); due.setDate(due.getDate() + 14);
    this.newLoan.dueDate = due.toISOString().split('T')[0];
  }

  load() {
    this.loanService.getAll(this.statusFilter || undefined).subscribe({
      next: (loans) => (this.loans = loans),
      error: () => (this.error = 'Failed to load loans.')
    });
  }

  closeForm() { this.showForm = false; this.formError = ''; }

  createLoan() {
    if (!this.newLoan.bookId || !this.newLoan.memberId || !this.newLoan.dueDate) {
      this.formError = 'All fields are required.';
      return;
    }
    this.loanService.create({ ...this.newLoan, dueDate: new Date(this.newLoan.dueDate).toISOString() }).subscribe({
      next: () => { this.closeForm(); this.load(); },
      error: (e) => (this.formError = e.error?.message ?? 'Failed to create loan.')
    });
  }

  returnLoan(id: number) {
    this.loanService.return(id).subscribe({ next: () => this.load(), error: () => (this.error = 'Return failed.') });
  }

  delete(id: number) {
    if (!confirm('Delete this loan record?')) return;
    this.loanService.delete(id).subscribe({ next: () => this.load(), error: () => (this.error = 'Delete failed.') });
  }
}
