namespace JwtAuthDotNet9.Models.Transaction
{
    public class CreateTransactionDTO
    {
        public Guid TagId { get; set; }
        public double Amount { get; set; }
        public string Description { get; set; }
    }
}
