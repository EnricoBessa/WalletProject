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

        public async Task<WalletInformation> CreateWalletAsync(WalletInformation wallet)
        {
            context.WalletInformation.Add(wallet);
            await context.SaveChangesAsync();
            return wallet;
        }

        public async Task<WalletInformation?> GetByIdAsync(Guid id)
        {
            return await context.WalletInformation.Where(w => w.Id == id).FirstOrDefaultAsync();
        }

        public async Task<WalletInformation?> GetWalletByUserIdAsync(Guid userId)
        {
            return await context.WalletInformation.Where(w => w.UserId == userId).OrderByDescending(w => w.DateCreation).FirstOrDefaultAsync();
        }
    }
}