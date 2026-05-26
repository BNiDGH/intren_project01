# Library Book Lending & Return System

Full-stack project: **Angular 17** frontend + **C# ASP.NET Core 8** backend.

---

## Project Structure


## API Endpoints

| Method | Endpoint                  | Description              |
|--------|---------------------------|--------------------------|
| GET    | /api/books                | List all books           |
| POST   | /api/books                | Create a book            |
| PUT    | /api/books/{id}           | Update a book            |
| DELETE | /api/books/{id}           | Delete a book            |
| GET    | /api/members              | List all members         |
| POST   | /api/members              | Create a member          |
| PUT    | /api/members/{id}         | Update a member          |
| DELETE | /api/members/{id}         | Delete a member          |
| GET    | /api/loans                | List all loans           |
| POST   | /api/loans                | Create a loan            |
| PUT    | /api/loans/{id}/return    | Mark a loan as returned  |
| DELETE | /api/loans/{id}           | Delete a loan record     |
| GET    | /api/dashboard/summary    | Dashboard counts & stats |

---

## How to Run

### Backend

**Requirements:** .NET 8 SDK

```bash
cd project01.Sever
dotnet run
# Runs on http://localhost:5000
# Swagger UI at http://localhost:5000/swagger
```

### Frontend

**Requirements:** Node.js 18+, Angular CLI

```bash
cd frontend
npm install
ng serve
# Runs on http://localhost:4200
```

Open http://localhost:4200 in your browser.

---

## Data Model

| Entity | Fields |
|--------|--------|
| Book   | Id, Title, Author, ISBN, Category, Status, CreatedAt |
| Member | Id, FullName, Email, Phone, CreatedAt |
| Loan   | Id, BookId, MemberId, Status, BorrowedAt, DueDate, ReturnedAt |

**Loan.Status** auto-updates to `Overdue` when DueDate passes.
**Book.Status** switches to `Borrowed` on loan create, back to `Available` on return.

---

## Features Implemented

- List page for Books, Members, Loans
- Create / Edit forms with Angular Reactive Forms + validation
- Delete with guard (no delete if active loan exists)
- Status workflow: Active → Overdue → Returned
- Dashboard summary counts calculated by backend
- Real Angular services calling real C# API (no mock data)
- Swagger/Postman testable at /swagger
- SQLite database (zero setup)
- CORS configured for localhost:4200
