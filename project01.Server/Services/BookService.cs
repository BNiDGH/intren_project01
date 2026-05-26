using LibraryApi.Data;
using LibraryApi.DTOs;
using LibraryApi.Models;
using Microsoft.EntityFrameworkCore;

namespace LibraryApi.Services;

public interface IBookService
{
    Task<IEnumerable<BookResponse>> GetAllAsync(string? category, string? search);
    Task<BookResponse?> GetByIdAsync(int id);
    Task<BookResponse> CreateAsync(BookRequest request);
    Task<BookResponse?> UpdateAsync(int id, BookRequest request);
    Task<bool> DeleteAsync(int id);
}

public class BookService : IBookService
{
    private readonly LibraryDbContext _db;
    public BookService(LibraryDbContext db) => _db = db;

    public async Task<IEnumerable<BookResponse>> GetAllAsync(string? category, string? search)
    {
        var query = _db.Books.AsQueryable();
        if (!string.IsNullOrWhiteSpace(category))
            query = query.Where(b => b.Category == category);
        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(b => b.Title.Contains(search) || b.Author.Contains(search));

        return await query.Select(b => ToResponse(b)).ToListAsync();
    }

    public async Task<BookResponse?> GetByIdAsync(int id)
    {
        var b = await _db.Books.FindAsync(id);
        return b == null ? null : ToResponse(b);
    }

    public async Task<BookResponse> CreateAsync(BookRequest request)
    {
        var book = new Book
        {
            Title = request.Title,
            Author = request.Author,
            ISBN = request.ISBN,
            Category = request.Category
        };
        _db.Books.Add(book);
        await _db.SaveChangesAsync();
        return ToResponse(book);
    }

    public async Task<BookResponse?> UpdateAsync(int id, BookRequest request)
    {
        var book = await _db.Books.FindAsync(id);
        if (book == null) return null;

        book.Title = request.Title;
        book.Author = request.Author;
        book.ISBN = request.ISBN;
        book.Category = request.Category;
        await _db.SaveChangesAsync();
        return ToResponse(book);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var book = await _db.Books.Include(b => b.Loans).FirstOrDefaultAsync(b => b.Id == id);
        if (book == null) return false;
        if (book.Loans.Any(l => l.Status != LoanStatus.Returned))
            throw new InvalidOperationException("Cannot delete a book with active loans.");

        _db.Books.Remove(book);
        await _db.SaveChangesAsync();
        return true;
    }

    private static BookResponse ToResponse(Book b) =>
        new(b.Id, b.Title, b.Author, b.ISBN, b.Category, b.Status.ToString(), b.CreatedAt);
}
