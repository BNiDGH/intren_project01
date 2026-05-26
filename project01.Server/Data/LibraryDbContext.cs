using LibraryApi.Models;
using Microsoft.EntityFrameworkCore;

namespace LibraryApi.Data;

public class LibraryDbContext : DbContext
{
    public LibraryDbContext(DbContextOptions<LibraryDbContext> options) : base(options) { }

    public DbSet<Book> Books => Set<Book>();
    public DbSet<Member> Members => Set<Member>();
    public DbSet<Loan> Loans => Set<Loan>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Loan>()
            .HasOne(l => l.Book)
            .WithMany(b => b.Loans)
            .HasForeignKey(l => l.BookId);

        modelBuilder.Entity<Loan>()
            .HasOne(l => l.Member)
            .WithMany(m => m.Loans)
            .HasForeignKey(l => l.MemberId);
    }
}

public static class DbSeeder
{
    public static void Seed(LibraryDbContext db)
    {
        if (db.Books.Any()) return;

        var books = new[]
        {
            new Book { Title = "The Great Gatsby", Author = "F. Scott Fitzgerald", ISBN = "978-0-7432-7356-5", Category = "Fiction" },
            new Book { Title = "A Brief History of Time", Author = "Stephen Hawking", ISBN = "978-0-553-38016-3", Category = "Science", Status = BookStatus.Borrowed },
            new Book { Title = "Sapiens", Author = "Yuval Noah Harari", ISBN = "978-0-06-231609-7", Category = "History" },
            new Book { Title = "Clean Code", Author = "Robert C. Martin", ISBN = "978-0-13-235088-4", Category = "Technology", Status = BookStatus.Borrowed },
            new Book { Title = "Dune", Author = "Frank Herbert", ISBN = "978-0-441-17271-9", Category = "Fiction" },
        };
        db.Books.AddRange(books);

        var members = new[]
        {
            new Member { FullName = "Alice Johnson", Email = "alice@example.com", Phone = "555-0101" },
            new Member { FullName = "Bob Smith", Email = "bob@example.com", Phone = "555-0102" },
            new Member { FullName = "Carol White", Email = "carol@example.com", Phone = "555-0103" },
        };
        db.Members.AddRange(members);
        db.SaveChanges();

        db.Loans.AddRange(
            new Loan { BookId = books[1].Id, MemberId = members[0].Id, DueDate = DateTime.UtcNow.AddDays(-9), Status = LoanStatus.Overdue },
            new Loan { BookId = books[3].Id, MemberId = members[1].Id, DueDate = DateTime.UtcNow.AddDays(4), Status = LoanStatus.Active }
        );
        db.SaveChanges();
    }
}
