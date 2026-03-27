using JwtAuthDotNet9.Entities;

namespace JwtAuthDotNet9.Services.IServico
{
    public interface ITransactionService
    {
        Task CreateAsync(Transaction transaction);
        Task<List<Transaction>> ListAllTransaction(Guid WalletID);
        Task<List<Transaction>> ListAllTagTransaction(Guid WalletID);

    }
}
