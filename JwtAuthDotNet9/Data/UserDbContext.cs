using JwtAuthDotNet9.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace JwtAuthDotNet9.Data
{
    public class UserDbContext(DbContextOptions<UserDbContext> options) : DbContext(options)
    {
        public DbSet<User> Users { get; set; }
        public DbSet<WalletInformation> WalletInformation { get; set; }
        public DbSet<Transaction> Transaction { get; set; }
        public DbSet<Tag> Tags { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<WalletInformation>()
                .HasOne(w => w.User)
                .WithMany(u => u.WalletInformations)
                .HasForeignKey(w => w.UserId);

            modelBuilder.Entity<Tag>()
                .HasOne(t => t.User)
                .WithMany(u => u.Tags)
                .HasForeignKey(t => t.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Transaction>()
                .HasOne(t => t.WalletInformation)
                .WithMany(w => w.Transactions)
                .HasForeignKey(t => t.WalletInformationId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Transaction>()
                .Property(t => t.Amount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<WalletInformation>()
                .Property(w => w.Income)
                .HasPrecision(18, 2);

            modelBuilder.Entity<WalletInformation>()
                .Property(w => w.Goal)
                .HasPrecision(18, 2);
        }
    }
}
