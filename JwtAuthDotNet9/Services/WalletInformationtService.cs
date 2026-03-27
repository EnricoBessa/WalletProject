using JwtAuthDotNet9.Data;
using JwtAuthDotNet9.Entities;
using JwtAuthDotNet9.Models;
using JwtAuthDotNet9.Services.IServico;
using Microsoft.EntityFrameworkCore;

namespace JwtAuthDotNet9.Services
{
    public class WalletInformationtService : IWalletInformationtService
    {
        private readonly UserDbContext context;

        public WalletInformationtService(UserDbContext context)
        {
            this.context = context;
        }

        public async Task<WalletInformation?> GetWalletByUserIdAsync(Guid userId)
        {
            return await context.WalletInformation
                .Where(w => w.UserId == userId)
                .OrderByDescending(w => w.DateCreation)
                .FirstOrDefaultAsync();
        }
    }
}