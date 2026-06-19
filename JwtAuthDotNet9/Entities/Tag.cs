namespace JwtAuthDotNet9.Entities
{
    public class Tag
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public string Name { get; set; }

        // FK dono da tag
        public Guid UserId { get; set; }
        public User User { get; set; }

        // Relacionamento
        public List<Transaction> Transactions { get; set; } = new();
    }
}
