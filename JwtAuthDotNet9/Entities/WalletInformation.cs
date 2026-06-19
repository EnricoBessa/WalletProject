namespace JwtAuthDotNet9.Entities
{
    public class WalletInformation
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public decimal Income { get; set; }
        public decimal Goal { get; set; }
        public decimal Current { get; set; }
        public DateTime DateCreation { get; set; }

        // FK
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;

        // Relacionamento
        public List<Transaction> Transactions { get; set; } = new();
    }
}
