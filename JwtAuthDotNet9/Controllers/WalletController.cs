using JwtAuthDotNet9.Entities;
using JwtAuthDotNet9.Models;
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

        [HttpGet("current")]
        public async Task<IActionResult> GetWallet()
        {
            Claim? userIdClaim = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.NameIdentifier);

            if (userIdClaim is null)
                return Unauthorized("Usuário não encontrado no token");

            Guid userId = Guid.Parse(userIdClaim.Value);

            var wallet = await walletService.GetWalletByUserIdAsync(userId);

            if (wallet is null)
                return NotFound("Wallet not found");

            return Ok(wallet.Id);
        }
    }
}
