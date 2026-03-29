using JwtAuthDotNet9.Entities;
using JwtAuthDotNet9.Models;
using Microsoft.AspNetCore.Identity;
using JwtAuthDotNet9.Entities;
using JwtAuthDotNet9.Models.User;

namespace JwtAuthDotNet9.Services.IServico
{
    public interface IAuthService
    {
        Task<User?> RegisterAsync(UserDTO request);

        Task<TokenResponseDTO?> LoginAsync(UserDTO request);
        Task<TokenResponseDTO?> RefreshTokenAsync(RefreshTokenRequestDTO request);
    }
}
