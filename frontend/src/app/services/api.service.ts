// src/app/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Book, BookRequest, Member, MemberRequest, Loan, LoanRequest, DashboardSummary } from '../models/models';

const BASE = 'http://localhost:5453/api';

@Injectable({ providedIn: 'root' })
export class BookService {
  constructor(private http: HttpClient) {}

  getAll(category?: string, search?: string): Observable<Book[]> {
    let params = new HttpParams();
    if (category) params = params.set('category', category);
    if (search)   params = params.set('search', search);
    return this.http.get<Book[]>(`${BASE}/books`, { params });
  }

  getById(id: number): Observable<Book> {
    return this.http.get<Book>(`${BASE}/books/${id}`);
  }

  create(body: BookRequest): Observable<Book> {
    return this.http.post<Book>(`${BASE}/books`, body);
  }

  update(id: number, body: BookRequest): Observable<Book> {
    return this.http.put<Book>(`${BASE}/books/${id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${BASE}/books/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class MemberService {
  constructor(private http: HttpClient) {}

  getAll(search?: string): Observable<Member[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    return this.http.get<Member[]>(`${BASE}/members`, { params });
  }

  getById(id: number): Observable<Member> {
    return this.http.get<Member>(`${BASE}/members/${id}`);
  }

  create(body: MemberRequest): Observable<Member> {
    return this.http.post<Member>(`${BASE}/members`, body);
  }

  update(id: number, body: MemberRequest): Observable<Member> {
    return this.http.put<Member>(`${BASE}/members/${id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${BASE}/members/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class LoanService {
  constructor(private http: HttpClient) {}

  getAll(status?: string): Observable<Loan[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<Loan[]>(`${BASE}/loans`, { params });
  }

  create(body: LoanRequest): Observable<Loan> {
    return this.http.post<Loan>(`${BASE}/loans`, body);
  }

  return(id: number): Observable<Loan> {
    return this.http.put<Loan>(`${BASE}/loans/${id}/return`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${BASE}/loans/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private http: HttpClient) {}

  getSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${BASE}/dashboard/summary`);
  }
}
