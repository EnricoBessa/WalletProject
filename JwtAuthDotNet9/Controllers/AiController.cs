using JwtAuthDotNet9.Models.Ai;
using JwtAuthDotNet9.Services;
using JwtAuthDotNet9.Services.IServico;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace JwtAuthDotNet9.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class AiController : ControllerBase
    {
        private readonly AiService _aiService;
        private readonly IUserService _userService;

        public AiController(AiService aiService, IUserService userService)
        {
            _aiService = aiService;
            _userService = userService;
        }

        [HttpGet("insights")]
        public async Task<IActionResult> GetInsights()
        {
            var request = await BuildRequestFromUserAsync();
            var insight = await _aiService.GenerateInsightsAsync(request);
            return Ok(insight);
        }

        [HttpPost("ask")]
        public async Task<IActionResult> AskQuestion([FromBody] AiQuestionRequest body)
        {
            if (string.IsNullOrWhiteSpace(body.Question))
                return BadRequest("Question is required.");

            var request = await BuildRequestFromUserAsync();
            var insight = await _aiService.AskQuestionAsync(body.Question, request);
            return Ok(insight);
        }

        private async Task<AiPromptRequest> BuildRequestFromUserAsync()
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            if (userIdClaim is null)
                throw new InvalidOperationException("User token not found.");

            var userId = Guid.Parse(userIdClaim.Value);
            var wallets = await _userService.GetWalletInformationAsync(userId);
            var latestWallet = wallets.FirstOrDefault();
            if (latestWallet == null)
                return new AiPromptRequest { Income = 0, Goal = 0, TotalExpenses = 0, Month = DateTime.UtcNow.Month };

            var totalExpenses = latestWallet.Transactions.Sum(t => Math.Abs(t.Amount));
            var tagExpenses = latestWallet.Transactions
                .GroupBy(t => t.TagName ?? "Sem categoria")
                .Select(g => new AiTagExpense { TagName = g.Key, Amount = g.Sum(t => Math.Abs(t.Amount)) })
                .OrderByDescending(t => t.Amount)
                .ToList();

            return new AiPromptRequest
            {
                Income = latestWallet.Income,
                Goal = latestWallet.Goal,
                TotalExpenses = totalExpenses,
                Month = latestWallet.DateCreation.Month,
                TagExpenses = tagExpenses
            };
        }
    }

    public class AiQuestionRequest
    {
        public string Question { get; set; } = string.Empty;
    }
}
