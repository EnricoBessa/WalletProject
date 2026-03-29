using JwtAuthDotNet9.Entities;
using JwtAuthDotNet9.Models;

namespace JwtAuthDotNet9.Services.IServico
{
    public interface IWalletInformationtService
    {
        Task<WalletInformation> CreateWalletAsync(WalletInformation wallet);
        Task<WalletInformation> GetWalletByUserIdAsync(Guid userId);
        Task<WalletInformation> GetByIdAsync(Guid id);
    }
}
