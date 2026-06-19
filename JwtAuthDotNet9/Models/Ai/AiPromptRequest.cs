namespace JwtAuthDotNet9.Models.Ai
{
    public class AiPromptRequest
    {
        public decimal Income { get; set; }
        public decimal TotalExpenses { get; set; }
        public decimal Goal { get; set; }
        public int Month { get; set; }
        public List<AiTagExpense> TagExpenses { get; set; } = new();
    }

    public class AiTagExpense
    {
        public string TagName { get; set; } = string.Empty;
        public decimal Amount { get; set; }
    }
}
