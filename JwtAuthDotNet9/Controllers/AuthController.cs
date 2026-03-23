using JwtAuthDotNet9.Entities;
using JwtAuthDotNet9.Models;
using JwtAuthDotNet9.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using RouteAttribute = Microsoft.AspNetCore.Components.RouteAttribute;

namespace JwtAuthDotNet9.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController(IAuthService authService) : ControllerBase
    {
        public static IdentityUser user = new IdentityUser();

        [HttpPost("register")]
        public async Task<ActionResult<ActionResult<IdentityUser>>> RegisterAsync(UserDTO request)
        {
            var user = await authService.RegisterAsync(request);

            if(user is null)
                return BadRequest("User already exists.");

            return Ok(user);
        }

        [HttpPost("login")]
        public async Task<ActionResult<string>> Login(UserDTO request)
        {
            string? token = await authService.LoginAsync(request);

            if(token is null)
                return BadRequest("Username or password is incorrect.");

            return Ok(token);
        }

        [Authorize]
        [HttpGet]
        public IActionResult AuthenticatedOnlyEndpoint()
        {
            return Ok("You are authenticated!");
        }
    }
}
