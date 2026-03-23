using JwtAuthDotNet9.Data;
using JwtAuthDotNet9.Entities;
using JwtAuthDotNet9.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.Azure.Documents;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace JwtAuthDotNet9.Services
{
    public class AuthService(UserDbContext context, IConfiguration configuration) : IAuthService
    {
        public async Task<string?> LoginAsync(UserDTO request)
        {
            var user = await context.Users.FirstOrDefaultAsync(u => u.UserName == request.Username);

            if (user is null)
                return null;

            if (new PasswordHasher<IdentityUser>().VerifyHashedPassword(user, user.PasswordHash, request.Password) == PasswordVerificationResult.Failed)
                return null;

            return CreateToken(user);
        }

        public async Task<IdentityUser?> RegisterAsync(UserDTO request)
        {
            if(await context.Users.AnyAsync(u => u.UserName == request.Username))
                return null;

            IdentityUser user = new IdentityUser();

            string hashedPassword = new PasswordHasher<IdentityUser>().HashPassword(user, request.Password);

            user.UserName = request.Username;
            user.PasswordHash = hashedPassword;

            context.Users.Add(user);
            await context.SaveChangesAsync();

            return user;
        }

        private string CreateToken(IdentityUser user)
        {
            List<Claim> clains = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.UserName),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
            };

            SymmetricSecurityKey key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration.GetValue<string>("AppSettings:Token")!));

            SigningCredentials creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512);

            JwtSecurityToken tokenDescriptor = new JwtSecurityToken(issuer: configuration.GetValue<string>("AppSettings:Issuer"),
                audience: configuration.GetValue<string>("AppSettings:Audience"),
                claims: clains,
                expires: DateTime.UtcNow.AddDays(1),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(tokenDescriptor);
        }
    }
}
