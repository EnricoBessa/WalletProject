using JwtAuthDotNet9.Models.Transaction;

namespace JwtAuthDotNet9.Models.Wallet
{
    public class CreateWalletDTO
    {
        public double Income { get; set; }
        public double Goal { get; set; }
        public List<CreateTransactionDTO> Transactions { get; set; }
    }
}
