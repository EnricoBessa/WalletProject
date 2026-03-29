using JwtAuthDotNet9.Entities;

namespace JwtAuthDotNet9.Services.IServico
{
    public interface IUserService
    {
        Task<List<WalletInformation>> GetWalletInformationAsync(Guid userId);
    }
}
