using JwtAuthDotNet9.Entities;

namespace JwtAuthDotNet9.Services.IServico
{
    public interface IWalletInformationtService
    {
        Task<WalletInformation> GetWalletByUserIdAsync(Guid userId);
    }
}
