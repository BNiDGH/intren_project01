namespace LibraryApi.DTOs;

// Book DTOs
public record BookRequest(
    string Title,
    string Author,
    string ISBN,
    string Category
);

public record BookResponse(
    int Id,
    string Title,
    string Author,
    string ISBN,
    string Category,
    string Status,
    DateTime CreatedAt
);

// Member DTOs
public record MemberRequest(
    string FullName,
    string Email,
    string Phone
);

public record MemberResponse(
    int Id,
    string FullName,
    string Email,
    string Phone,
    int ActiveLoans,
    DateTime CreatedAt
);

// Loan DTOs
public record LoanRequest(
    int BookId,
    int MemberId,
    DateTime DueDate
);

public record LoanResponse(
    int Id,
    int BookId,
    string BookTitle,
    int MemberId,
    string MemberName,
    string Status,
    DateTime BorrowedAt,
    DateTime DueDate,
    DateTime? ReturnedAt
);

// Dashboard DTOs
public record DashboardSummary(
    int TotalBooks,
    int AvailableBooks,
    int ActiveLoans,
    int OverdueLoans,
    int TotalMembers,
    IEnumerable<CategoryCount> BooksByCategory,
    IEnumerable<LoanResponse> RecentLoans
);

public record CategoryCount(string Category, int Count);
