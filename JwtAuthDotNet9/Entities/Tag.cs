namespace JwtAuthDotNet9.Entities
{
    public class Tag
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public double Value { get; set; }
        public Guid UserId { get; set; }
    }
}
