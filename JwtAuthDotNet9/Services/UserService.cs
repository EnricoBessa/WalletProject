using JwtAuthDotNet9.Data;
using JwtAuthDotNet9.Entities;
using JwtAuthDotNet9.Services.IServico;
using Microsoft.EntityFrameworkCore;

namespace JwtAuthDotNet9.Services
{
    public class UserService : IUserService
    {
        private readonly UserDbContext context;

        public UserService(UserDbContext context)
        {
            this.context = context;
        }

        public async Task<List<WalletInformation>> GetWalletInformationAsync(Guid userId)
        {
            User? user = await context.Users.Include(u => u.WalletInformations).ThenInclude(w => w.Transactions).FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return new List<WalletInformation>();

            user.WalletInformations = user.WalletInformations.OrderByDescending(w => w.DateCreation).ToList();

            return user.WalletInformations;
        }
    }
}
