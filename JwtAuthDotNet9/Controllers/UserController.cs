using JwtAuthDotNet9.Entities;
using JwtAuthDotNet9.Models;
using JwtAuthDotNet9.Models.Transaction;
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
    public class UserController : GenericController<User>
    {
        private readonly IUserService serviceUser;

        public UserController(IGenericService<User> service, IUserService serviceUser) : base(service)
        {
            this.serviceUser = serviceUser;
        }

        [HttpGet("currentwalletinformation")]
        public async Task<IActionResult> GetWalletInformation()
        {
            try
            {
                Claim? userIdClaim = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.NameIdentifier);

                if (userIdClaim is null)
                    return Unauthorized("User token not found");

                Guid userId = Guid.Parse(userIdClaim.Value);

                List<WalletInformation>? wallets = await serviceUser.GetWalletInformationAsync(userId);

                var result = wallets.Select(w => new WalletInformationDTO
                {
                    Id = w.Id,
                    Income = w.Income,
                    Goal = w.Goal,
                    Transactions = w.Transactions.Select(t => new TransactionInformationDTO
                    {
                        Id = t.Id,
                        Amount = t.Amount,
                        Description = t.Description,
                        Date = t.Date
                    }).ToList()
                });

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest("Error to get wallet information");
            }
        }
    }
}
