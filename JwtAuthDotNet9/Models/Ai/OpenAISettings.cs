namespace JwtAuthDotNet9.Models.Ai
{
    public class OpenAISettings
    {
        public string ApiKey { get; set; } = string.Empty;
        public string Model { get; set; } = "gpt-4o-mini";
        public string ApiUrl { get; set; } = "https://api.openai.com/v1/chat/completions";
    }
}
