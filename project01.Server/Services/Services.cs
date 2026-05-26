using LibraryApi.Data;
using LibraryApi.DTOs;
using LibraryApi.Models;
using Microsoft.EntityFrameworkCore;

namespace LibraryApi.Services;

// ── Member Service ──────────────────────────────────────────────────
public interface IMemberService
{
    Task<IEnumerable<MemberResponse>> GetAllAsync(string? search);
    Task<MemberResponse?> GetByIdAsync(int id);
    Task<MemberResponse> CreateAsync(MemberRequest request);
    Task<MemberResponse?> UpdateAsync(int id, MemberRequest request);
    Task<bool> DeleteAsync(int id);
}

public class MemberService : IMemberService
{
    private readonly LibraryDbContext _db;
    public MemberService(LibraryDbContext db) => _db = db;

    public async Task<IEnumerable<MemberResponse>> GetAllAsync(string? search)
    {
        var query = _db.Members.Include(m => m.Loans).AsQueryable();
        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(m => m.FullName.Contains(search) || m.Email.Contains(search));

        return await query.Select(m => ToResponse(m)).ToListAsync();
    }

    public async Task<MemberResponse?> GetByIdAsync(int id)
    {
        var m = await _db.Members.Include(m => m.Loans).FirstOrDefaultAsync(m => m.Id == id);
        return m == null ? null : ToResponse(m);
    }

    public async Task<MemberResponse> CreateAsync(MemberRequest request)
    {
        var member = new Member { FullName = request.FullName, Email = request.Email, Phone = request.Phone };
        _db.Members.Add(member);
        await _db.SaveChangesAsync();
        return ToResponse(member);
    }

    public async Task<MemberResponse?> UpdateAsync(int id, MemberRequest request)
    {
        var member = await _db.Members.FindAsync(id);
        if (member == null) return null;
        member.FullName = request.FullName;
        member.Email = request.Email;
        member.Phone = request.Phone;
        await _db.SaveChangesAsync();
        return ToResponse(member);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var member = await _db.Members.Include(m => m.Loans).FirstOrDefaultAsync(m => m.Id == id);
        if (member == null) return false;
        if (member.Loans.Any(l => l.Status != LoanStatus.Returned))
            throw new InvalidOperationException("Cannot delete a member with active loans.");
        _db.Members.Remove(member);
        await _db.SaveChangesAsync();
        return true;
    }

    private static MemberResponse ToResponse(Member m) =>
        new(m.Id, m.FullName, m.Email, m.Phone,
            m.Loans.Count(l => l.Status != LoanStatus.Returned), m.CreatedAt);
}

// ── Loan Service ─────────────────────────────────────────────────────
public interface ILoanService
{
    Task<IEnumerable<LoanResponse>> GetAllAsync(string? status);
    Task<LoanResponse> CreateAsync(LoanRequest request);
    Task<LoanResponse?> ReturnAsync(int id);
    Task<bool> DeleteAsync(int id);
}

public class LoanService : ILoanService
{
    private readonly LibraryDbContext _db;
    public LoanService(LibraryDbContext db) => _db = db;

    public async Task<IEnumerable<LoanResponse>> GetAllAsync(string? status)
    {
        await SyncOverdueAsync();
        var query = _db.Loans.Include(l => l.Book).Include(l => l.Member).AsQueryable();
        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<LoanStatus>(status, true, out var s))
            query = query.Where(l => l.Status == s);

        return await query.OrderByDescending(l => l.BorrowedAt).Select(l => ToResponse(l)).ToListAsync();
    }

    public async Task<LoanResponse> CreateAsync(LoanRequest request)
    {
        var book = await _db.Books.FindAsync(request.BookId)
            ?? throw new InvalidOperationException("Book not found.");
        if (book.Status != BookStatus.Available)
            throw new InvalidOperationException("Book is not available.");
        var member = await _db.Members.FindAsync(request.MemberId)
            ?? throw new InvalidOperationException("Member not found.");

        book.Status = BookStatus.Borrowed;
        var loan = new Loan
        {
            BookId = request.BookId,
            MemberId = request.MemberId,
            DueDate = request.DueDate,
            Status = request.DueDate < DateTime.UtcNow ? LoanStatus.Overdue : LoanStatus.Active
        };
        _db.Loans.Add(loan);
        await _db.SaveChangesAsync();

        loan.Book = book;
        loan.Member = member;
        return ToResponse(loan);
    }

    public async Task<LoanResponse?> ReturnAsync(int id)
    {
        var loan = await _db.Loans.Include(l => l.Book).Include(l => l.Member).FirstOrDefaultAsync(l => l.Id == id);
        if (loan == null || loan.Status == LoanStatus.Returned) return null;

        loan.Status = LoanStatus.Returned;
        loan.ReturnedAt = DateTime.UtcNow;
        loan.Book.Status = BookStatus.Available;
        await _db.SaveChangesAsync();
        return ToResponse(loan);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var loan = await _db.Loans.FindAsync(id);
        if (loan == null) return false;
        _db.Loans.Remove(loan);
        await _db.SaveChangesAsync();
        return true;
    }

    private async Task SyncOverdueAsync()
    {
        var activeLoans = await _db.Loans
            .Where(l => l.Status == LoanStatus.Active && l.DueDate < DateTime.UtcNow)
            .ToListAsync();
        foreach (var l in activeLoans) l.Status = LoanStatus.Overdue;
        if (activeLoans.Any()) await _db.SaveChangesAsync();
    }

    private static LoanResponse ToResponse(Loan l) =>
        new(l.Id, l.BookId, l.Book?.Title ?? "", l.MemberId, l.Member?.FullName ?? "",
            l.Status.ToString(), l.BorrowedAt, l.DueDate, l.ReturnedAt);
}

// ── Dashboard Service ─────────────────────────────────────────────────
public interface IDashboardService
{
    Task<DashboardSummary> GetSummaryAsync();
}

public class DashboardService : IDashboardService
{
    private readonly LibraryDbContext _db;
    public DashboardService(LibraryDbContext db) => _db = db;

    public async Task<DashboardSummary> GetSummaryAsync()
    {
        var books = await _db.Books.ToListAsync();
        var loans = await _db.Loans.Include(l => l.Book).Include(l => l.Member).ToListAsync();
        var now = DateTime.UtcNow;

        foreach (var l in loans.Where(l => l.Status == LoanStatus.Active && l.DueDate < now))
            l.Status = LoanStatus.Overdue;
        await _db.SaveChangesAsync();

        var recentLoans = loans.OrderByDescending(l => l.BorrowedAt).Take(5)
            .Select(l => new LoanResponse(l.Id, l.BookId, l.Book?.Title ?? "", l.MemberId,
                l.Member?.FullName ?? "", l.Status.ToString(), l.BorrowedAt, l.DueDate, l.ReturnedAt));

        var byCategory = books.GroupBy(b => b.Category)
            .Select(g => new CategoryCount(g.Key, g.Count()));

        return new DashboardSummary(
            books.Count,
            books.Count(b => b.Status == BookStatus.Available),
            loans.Count(l => l.Status == LoanStatus.Active),
            loans.Count(l => l.Status == LoanStatus.Overdue),
            await _db.Members.CountAsync(),
            byCategory,
            recentLoans
        );
    }
}
