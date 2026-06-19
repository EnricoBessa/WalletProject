using JwtAuthDotNet9.Models.Transaction;

namespace JwtAuthDotNet9.Models.Wallet
{
    public class WalletCreateDTO
    {
        public decimal Income { get; set; }
        public decimal Goal { get; set; }
        public List<TransactionDTO> Transactions { get; set; } = new();
    }
}
