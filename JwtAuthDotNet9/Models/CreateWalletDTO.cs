namespace JwtAuthDotNet9.Models
{
    public class CreateWalletDTO
    {
        public double Income { get; set; }
        public double Goal { get; set; }
        public List<CreateTransactionDTO> Transactions { get; set; }
    }
}
