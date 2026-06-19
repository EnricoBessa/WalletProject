using JwtAuthDotNet9.Data;
using JwtAuthDotNet9.Entities;
using JwtAuthDotNet9.Services.IServico;
using Microsoft.EntityFrameworkCore;

namespace JwtAuthDotNet9.Services
{
    public class TransactionService(UserDbContext context) : ITransactionService
    {
        public async Task CreateAsync(Transaction transaction)
        {
            context.Transaction.Add(transaction);
            await context.SaveChangesAsync();
        }

        public async Task<List<Transaction>> ListAllTransaction(Guid WalletID)
        {
            Task<List<Transaction>>? transactions = context.Transaction.Where(t => t.WalletInformationId == WalletID).ToListAsync();

            return await transactions;
        }

        public async Task<List<Transaction>> ListAllTagTransaction(Guid WalletID)
        {
            List<Transaction>? taggedTransactions = await context.Transaction.Where(t => t.WalletInformationId == WalletID && !string.IsNullOrEmpty(t.TagName)).ToListAsync();

            return taggedTransactions;
        }
    }
}
