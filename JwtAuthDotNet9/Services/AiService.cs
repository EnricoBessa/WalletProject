using JwtAuthDotNet9.Models.Ai;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace JwtAuthDotNet9.Services
{
    public class AiService
    {
        private readonly HttpClient _httpClient;
        private readonly OpenAISettings _settings;

        public AiService(HttpClient httpClient, OpenAISettings settings)
        {
            _httpClient = httpClient;
            _settings = settings;
        }

        public async Task<AiInsightResponse> GenerateInsightsAsync(AiPromptRequest request)
        {
            var prompt = BuildSystemPrompt(request, "Gere insights automáticos sobre os gastos do usuário e ofereça recomendações claras.");
            return await SendOpenAiRequest(prompt);
        }

        public async Task<AiInsightResponse> AskQuestionAsync(string question, AiPromptRequest request)
        {
            var prompt = BuildSystemPrompt(request, question);
            return await SendOpenAiRequest(prompt);
        }

        private async Task<AiInsightResponse> SendOpenAiRequest(string prompt)
        {
            if (string.IsNullOrWhiteSpace(_settings.ApiKey))
                throw new InvalidOperationException("OpenAI API key is not configured.");

            var body = new
            {
                model = _settings.Model,
                temperature = 0.7,
                messages = new[]
                {
                    new { role = "system", content = "Você é um assistente financeiro inteligente e objetivo, capaz de analisar gastos, metas e padrões de economia." },
                    new { role = "user", content = prompt }
                }
            };

            using var httpRequest = new HttpRequestMessage(HttpMethod.Post, _settings.ApiUrl)
            {
                Content = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json")
            };

            httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _settings.ApiKey);

            var response = await _httpClient.SendAsync(httpRequest);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            using var document = JsonDocument.Parse(json);
            var text = document.RootElement
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString() ?? string.Empty;

            return new AiInsightResponse { Message = text.Trim() };
        }

        private static string BuildSystemPrompt(AiPromptRequest request, string userQuestion)
        {
            var tagExpenses = request.TagExpenses.Any()
                ? string.Join("\n", request.TagExpenses.Select(t => $"- {t.TagName}: {t.Amount:C}"))
                : "Nenhuma categoria encontrada.";

            return $@"Dados do usuário:
Renda: {request.Income:C}
Gastos totais: {request.TotalExpenses:C}
Meta: {request.Goal:C}
Mês referência: {request.Month}
Gastos por categoria:
{tagExpenses}

Pergunta / instrução: {userQuestion}

Responda em português de forma natural e focada em finanças.";
        }
    }
}
