namespace JwtAuthDotNet9.Models.Transaction
{
    public class TransactionCreateDTO
    {
        public string TagName { get; set; } = null!;
        public decimal Amount { get; set; }
        public string? Description { get; set; }
        public DateTime Date { get; set; }
        public Guid WalletInformationId { get; set; }
    }
}
