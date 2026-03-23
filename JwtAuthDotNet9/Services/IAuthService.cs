using JwtAuthDotNet9.Entities;
using JwtAuthDotNet9.Models;
using Microsoft.AspNetCore.Identity;

namespace JwtAuthDotNet9.Services
{
    public interface IAuthService
    {
        Task<IdentityUser?> RegisterAsync(UserDTO request);

        Task<string?> LoginAsync(UserDTO request);
    }
}
