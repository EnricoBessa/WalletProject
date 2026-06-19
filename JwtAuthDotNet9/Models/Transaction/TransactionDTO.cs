namespace JwtAuthDotNet9.Models.Transaction
{
    public class TransactionDTO
    {
        public decimal Amount { get; set; }
        public string? Description { get; set; }
        public string TagName { get; set; } = string.Empty;
    }
}
