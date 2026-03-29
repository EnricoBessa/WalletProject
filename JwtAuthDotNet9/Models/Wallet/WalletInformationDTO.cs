using JwtAuthDotNet9.Models.Transaction;

namespace JwtAuthDotNet9.Models.Wallet
{
    public class WalletInformationDTO
    {
        public Guid Id { get; set; }
        public decimal Income { get; set; }
        public decimal Goal { get; set; }
        public List<TransactionInformationDTO> Transactions { get; set; }
    }
}
