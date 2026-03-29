using JwtAuthDotNet9.Entities;
using JwtAuthDotNet9.Models;
using JwtAuthDotNet9.Models.Wallet;
using JwtAuthDotNet9.Services.IServico;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace JwtAuthDotNet9.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class WalletController : GenericController<WalletInformation>
    {
        private readonly IWalletInformationtService walletService;

        public WalletController(IGenericService<WalletInformation> service, IWalletInformationtService walletService) : base(service)
        {
            this.walletService = walletService;
        }

        [HttpPost("createbydto")]
        public async Task<IActionResult> CreateWallet([FromBody] WalletCreateDTO dto)
        {
            try
            {
                var claim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (claim == null)
                    return Unauthorized("User not found");

                Guid userId = Guid.Parse(claim.Value);

                WalletInformation? lastWallet = await walletService.GetWalletByUserIdAsync(userId);

                decimal previousCurrent = lastWallet?.Current ?? 0;

                decimal totalTransactions = dto.Transactions.Sum(t => t.Amount);

                decimal monthResult = dto.Income + totalTransactions;

                decimal newCurrent;

                if (monthResult >= 0)
                    newCurrent = previousCurrent + monthResult;
                else
                    newCurrent = previousCurrent + monthResult;

                WalletInformation wallet = new WalletInformation
                {
                    Income = dto.Income,
                    Goal = dto.Goal,
                    Current = newCurrent,
                    UserId = userId,
                    DateCreation = DateTime.UtcNow,
                    Transactions = dto.Transactions.Select(tx => new Transaction
                    {
                        Amount = tx.Amount,
                        Description = tx.Description,
                        TagName = tx.TagName,
                        Date = DateTime.UtcNow
                    }).ToList()
                };

                WalletInformation? result = await walletService.CreateWalletAsync(wallet);

                return Ok(new WalletResponseDTO
                {
                    Id = result.Id,
                    Income = result.Income,
                    Goal = result.Goal,
                    Current = result.Current,
                    DateCreation = result.DateCreation
                });
            }
            catch
            {
                return BadRequest("Error to create wallet");
            }
        }

        [HttpGet("current")]
        public async Task<IActionResult> GetWallet()
        {
            Claim? userIdClaim = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.NameIdentifier);

            if (userIdClaim is null)
                return Unauthorized("User token not found");

            Guid userId = Guid.Parse(userIdClaim.Value);

            var wallet = await walletService.GetWalletByUserIdAsync(userId);

            if (wallet is null)
                return NotFound("Wallet not found");

            return Ok(wallet.Id);
        }
    }
}
