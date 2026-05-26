// src/app/components/books/books.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators,FormGroup } from '@angular/forms';
import { BookService } from '../../services/api.service';
import { Book } from '../../models/models';

@Component({
  selector: 'app-books',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="page">
      <div class="toolbar">
        <h2>Books</h2>
        <div class="filters">
          <input [(ngModel)]="search" (ngModelChange)="load()" placeholder="Search books..." class="input-sm">
          <select [(ngModel)]="categoryFilter" (ngModelChange)="load()" class="input-sm">
            <option value="">All categories</option>
            <option *ngFor="let c of categories">{{ c }}</option>
          </select>
        </div>
        <button class="btn-primary" (click)="openForm()">+ Add book</button>
      </div>

      <table class="table">
        <thead>
          <tr><th>Title</th><th>Author</th><th>Category</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let b of books">
            <td><strong>{{ b.title }}</strong></td>
            <td>{{ b.author }}</td>
            <td>{{ b.category }}</td>
            <td><span class="badge" [class]="b.status.toLowerCase()">{{ b.status }}</span></td>
            <td class="actions">
              <button class="btn-sm" (click)="openForm(b)">Edit</button>
              <button class="btn-sm danger" (click)="delete(b.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p *ngIf="!books.length" class="empty">No books found.</p>

      <!-- Modal -->
      <div class="overlay" *ngIf="showForm" (click)="closeForm()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <span>{{ editId ? 'Edit book' : 'Add book' }}</span>
            <button (click)="closeForm()">✕</button>
          </div>
          <form [formGroup]="form" (ngSubmit)="save()">
            <label>Title *</label>
            <input formControlName="title" class="input" placeholder="Book title">
            <label>Author *</label>
            <input formControlName="author" class="input" placeholder="Author name">
            <label>ISBN</label>
            <input formControlName="isbn" class="input" placeholder="ISBN">
            <label>Category</label>
            <select formControlName="category" class="input">
              <option *ngFor="let c of categories">{{ c }}</option>
            </select>
            <p class="error" *ngIf="formError">{{ formError }}</p>
            <div class="modal-footer">
              <button type="button" class="btn-sm" (click)="closeForm()">Cancel</button>
              <button type="submit" class="btn-primary" [disabled]="form.invalid">{{ editId ? 'Update' : 'Add' }}</button>
            </div>
          </form>
        </div>
      </div>

      <p *ngIf="error" class="error">{{ error }}</p>
    </div>
  `,
  styles: [`
    .page { padding: 1.5rem; }
    .toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 1rem; }
    .toolbar h2 { font-size: 1.25rem; font-weight: 500; margin-right: auto; }
    .filters { display: flex; gap: 8px; }
    .input-sm { font-size: 13px; padding: 6px 10px; border: 1px solid #ddd; border-radius: 6px; }
    .btn-primary { background: #185fa5; color: #fff; border: none; padding: 7px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-sm { font-size: 12px; padding: 4px 10px; border: 1px solid #ddd; border-radius: 5px; background: #fff; cursor: pointer; }
    .btn-sm.danger { color: #a32d2d; border-color: #f7c1c1; }
    .table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .table th { text-align: left; padding: 8px 8px; color: #888; font-weight: 500; border-bottom: 1px solid #eee; }
    .table td { padding: 10px 8px; border-bottom: 1px solid #f5f5f5; }
    .table td strong { font-size: 14px; }
    .actions { text-align: right; display: flex; gap: 6px; justify-content: flex-end; }
    .badge { font-size: 12px; padding: 3px 10px; border-radius: 99px; font-weight: 500; }
    .badge.available { background: #eaf3de; color: #3b6d11; }
    .badge.borrowed { background: #e6f1fb; color: #185fa5; }
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
export class BooksComponent implements OnInit {
  books: Book[] = [];
  categories = ['Fiction', 'Non-fiction', 'Science', 'History', 'Technology'];
  search = '';
  categoryFilter = '';
  showForm = false;
  editId: number | null = null;
  error = '';
  formError = '';
  form: FormGroup;
  constructor(private bookService: BookService, private fb: FormBuilder) {
  this.form=this.fb.group({
    title: ['', Validators.required],
    author: ['', Validators.required],
    isbn: [''],
    category: ['Fiction']
  });
}

  ngOnInit() { this.load(); }

  load() {
    this.bookService.getAll(this.categoryFilter || undefined, this.search || undefined).subscribe({
      next: (books) => (this.books = books),
      error: () => (this.error = 'Failed to load books.')
    });
  }

  openForm(book?: Book) {
    this.editId = book?.id ?? null;
    this.formError = '';
    this.form.reset({ title: book?.title ?? '', author: book?.author ?? '', isbn: book?.isbn ?? '', category: book?.category ?? 'Fiction' });
    this.showForm = true;
  }

  closeForm() { this.showForm = false; }

  save() {
    if (this.form.invalid) return;
    const body = this.form.value as any;
    const obs = this.editId
      ? this.bookService.update(this.editId, body)
      : this.bookService.create(body);

    obs.subscribe({
      next: () => { this.closeForm(); this.load(); },
      error: (e) => (this.formError = e.error?.message ?? 'Save failed.')
    });
  }

  delete(id: number) {
    if (!confirm('Delete this book?')) return;
    this.bookService.delete(id).subscribe({
      next: () => this.load(),
      error: (e) => (this.error = e.error?.message ?? 'Delete failed.')
    });
  }
}
