namespace JwtAuthDotNet9.Models.Transaction
{
    public class TransactionInformationDTO
    {
        public Guid Id { get; set; }
        public decimal Amount { get; set; }
        public string Description { get; set; }
        public string TagName { get; set; } = string.Empty;
        public DateTime Date { get; set; }
    }
}
