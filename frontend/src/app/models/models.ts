// src/app/models/models.ts

export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  category: string;
  status: 'Available' | 'Borrowed';
  createdAt: string;
}

export interface BookRequest {
  title: string;
  author: string;
  isbn: string;
  category: string;
}

export interface Member {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  activeLoans: number;
  createdAt: string;
}

export interface MemberRequest {
  fullName: string;
  email: string;
  phone: string;
}

export interface Loan {
  id: number;
  bookId: number;
  bookTitle: string;
  memberId: number;
  memberName: string;
  status: 'Active' | 'Returned' | 'Overdue';
  borrowedAt: string;
  dueDate: string;
  returnedAt: string | null;
}

export interface LoanRequest {
  bookId: number;
  memberId: number;
  dueDate: string;
}

export interface DashboardSummary {
  totalBooks: number;
  availableBooks: number;
  activeLoans: number;
  overdueLoans: number;
  totalMembers: number;
  booksByCategory: { category: string; count: number }[];
  recentLoans: Loan[];
}
