// src/app/components/members/members.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MemberService } from '../../services/api.service';
import { Member } from '../../models/models';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="page">
      <div class="toolbar">
        <h2>Members</h2>
        <input [(ngModel)]="search" (ngModelChange)="load()" placeholder="Search members..." class="input-sm">
        <button class="btn-primary" (click)="openForm()">+ Add member</button>
      </div>

      <div class="member-list">
        <div class="member-card" *ngFor="let m of members">
          <div class="avatar">{{ initials(m.fullName) }}</div>
          <div class="info">
            <strong>{{ m.fullName }}</strong>
            <span>{{ m.email }} · {{ m.phone }}</span>
          </div>
          <span class="loans">{{ m.activeLoans }} active loan{{ m.activeLoans !== 1 ? 's' : '' }}</span>
          <div class="actions">
            <button class="btn-sm" (click)="openForm(m)">Edit</button>
            <button class="btn-sm danger" (click)="delete(m.id)">Delete</button>
          </div>
        </div>
      </div>
      <p *ngIf="!members.length" class="empty">No members found.</p>

      <!-- Modal -->
      <div class="overlay" *ngIf="showForm" (click)="closeForm()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <span>{{ editId ? 'Edit member' : 'Add member' }}</span>
            <button (click)="closeForm()">✕</button>
          </div>
          <form [formGroup]="form" (ngSubmit)="save()">
            <label>Full name *</label>
            <input formControlName="fullName" class="input" placeholder="Full name">
            <label>Email *</label>
            <input formControlName="email" class="input" placeholder="email@example.com" type="email">
            <label>Phone</label>
            <input formControlName="phone" class="input" placeholder="Phone number">
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
    .input-sm { font-size: 13px; padding: 6px 10px; border: 1px solid #ddd; border-radius: 6px; }
    .btn-primary { background: #185fa5; color: #fff; border: none; padding: 7px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; }
    .btn-primary:disabled { opacity: 0.5; }
    .btn-sm { font-size: 12px; padding: 4px 10px; border: 1px solid #ddd; border-radius: 5px; background: #fff; cursor: pointer; }
    .btn-sm.danger { color: #a32d2d; border-color: #f7c1c1; }
    .member-list { display: flex; flex-direction: column; gap: 8px; }
    .member-card { display: flex; align-items: center; gap: 12px; padding: 10px 14px; border: 1px solid #eee; border-radius: 8px; }
    .avatar { width: 36px; height: 36px; border-radius: 50%; background: #e6f1fb; color: #185fa5; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 500; flex-shrink: 0; }
    .info { flex: 1; } .info strong { display: block; font-size: 14px; } .info span { font-size: 12px; color: #888; }
    .loans { font-size: 12px; color: #888; white-space: nowrap; }
    .actions { display: flex; gap: 6px; }
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
export class MembersComponent implements OnInit {
  members: Member[] = [];
  search = '';
  showForm = false;
  editId: number | null = null;
  error = '';
  formError = '';

  form: FormGroup;

  constructor(private memberService: MemberService, private fb: FormBuilder) {
    this.form=this.fb.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['']
  });

  }

  ngOnInit() { this.load(); }

  load() {
    this.memberService.getAll(this.search || undefined).subscribe({
      next: (members) => (this.members = members),
      error: () => (this.error = 'Failed to load members.')
    });
  }

  initials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  openForm(member?: Member) {
    this.editId = member?.id ?? null;
    this.formError = '';
    this.form.reset({ fullName: member?.fullName ?? '', email: member?.email ?? '', phone: member?.phone ?? '' });
    this.showForm = true;
  }

  closeForm() { this.showForm = false; }

  save() {
    if (this.form.invalid) return;
    const body = this.form.value as any;
    const obs = this.editId ? this.memberService.update(this.editId, body) : this.memberService.create(body);
    obs.subscribe({
      next: () => { this.closeForm(); this.load(); },
      error: (e) => (this.formError = e.error?.message ?? 'Save failed.')
    });
  }

  delete(id: number) {
    if (!confirm('Delete this member?')) return;
    this.memberService.delete(id).subscribe({
      next: () => this.load(),
      error: (e) => (this.error = e.error?.message ?? 'Delete failed.')
    });
  }
}
