using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace JwtAuthDotNet9.Data
{
    public class UserDbContext(DbContextOptions<UserDbContext> options) : DbContext(options)
    {
        public DbSet<IdentityUser> Users{ get; set; }
    }
}
