using JwtAuthDotNet9.Data;
using JwtAuthDotNet9.Entities;
using JwtAuthDotNet9.Models;
using JwtAuthDotNet9.Models.Transaction;
using JwtAuthDotNet9.Models.User;
using JwtAuthDotNet9.Models.Wallet;
using JwtAuthDotNet9.Services.IServico;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace JwtAuthDotNet9.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : GenericController<User>
    {
        private readonly IUserService serviceUser;
        private readonly UserDbContext context;

        public UserController(IGenericService<User> service, IUserService serviceUser, UserDbContext context) : base(service)
        {
            this.serviceUser = serviceUser;
            this.context = context;
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
                    Current = w.Current,
                    DateCreation = w.DateCreation,
                    Transactions = w.Transactions.Select(t => new TransactionInformationDTO
                    {
                        Id = t.Id,
                        Amount = t.Amount,
                        Description = t.Description,
                        TagName = t.TagName,
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

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            try
            {
                Claim? userIdClaim = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.NameIdentifier);

                if (userIdClaim is null)
                    return Unauthorized("User token not found");

                Guid userId = Guid.Parse(userIdClaim.Value);
                User? user = await context.Users.FindAsync(userId);

                if (user is null)
                    return NotFound("User not found");

                return Ok(new UserProfileDTO
                {
                    Username = user.Username,
                    Email = user.Email
                });
            }
            catch
            {
                return BadRequest("Error to get profile");
            }
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile(UserProfileDTO dto)
        {
            try
            {
                Claim? userIdClaim = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.NameIdentifier);

                if (userIdClaim is null)
                    return Unauthorized("User token not found");

                Guid userId = Guid.Parse(userIdClaim.Value);
                User? user = await context.Users.FindAsync(userId);

                if (user is null)
                    return NotFound("User not found");

                if (await context.Users.AnyAsync(u => u.Id != userId && (u.Username == dto.Username || u.Email == dto.Email)))
                    return BadRequest("Username or email already in use");

                user.Username = dto.Username;
                user.Email = dto.Email;

                await context.SaveChangesAsync();
                return Ok(new UserProfileDTO
                {
                    Username = user.Username,
                    Email = user.Email
                });
            }
            catch
            {
                return BadRequest("Error to update profile");
            }
        }

        [HttpGet("chartdata")]
        public async Task<IActionResult> GetChartData([FromQuery] int month = 0)
        {
            try
            {
                Claim? userIdClaim = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.NameIdentifier);

                if (userIdClaim is null)
                    return Unauthorized("User token not found");

                Guid userId = Guid.Parse(userIdClaim.Value);
                List<WalletInformation>? wallets = await serviceUser.GetWalletInformationAsync(userId);

                var points = wallets
                    .Where(w => month == 0 || w.DateCreation.Month == month)
                    .Select(w => new ChartPointDTO
                    {
                        Date = w.DateCreation,
                        Balance = w.Current,
                        Goal = w.Goal
                    })
                    .OrderBy(w => w.Date)
                    .ToList();

                return Ok(points);
            }
            catch
            {
                return BadRequest("Error to get chart data");
            }
        }
    }
}
