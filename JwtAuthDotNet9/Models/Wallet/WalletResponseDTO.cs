namespace JwtAuthDotNet9.Models.Wallet
{    public class WalletResponseDTO
    {
        public Guid Id { get; set; }
        public decimal Income { get; set; }
        public decimal Goal { get; set; }
        public decimal Current { get; set; }
        public DateTime DateCreation { get; set; }
    }
}
