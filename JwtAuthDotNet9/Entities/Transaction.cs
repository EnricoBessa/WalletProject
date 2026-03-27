namespace JwtAuthDotNet9.Entities
{
    public class Transaction
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public decimal Amount { get; set; }
        public DateTime Date { get; set; }

        public string? Description { get; set; }

        public string TagName { get; set; } = string.Empty;

        // FK Wallet
        public Guid WalletInformationId { get; set; }
        public WalletInformation WalletInformation { get; set; }
    }
}