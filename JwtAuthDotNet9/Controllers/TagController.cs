using JwtAuthDotNet9.Entities;
using JwtAuthDotNet9.Models;
using JwtAuthDotNet9.Services.IServico;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace JwtAuthDotNet9.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TagController : GenericController<Tag>
    {
        public TagController(IGenericService<Tag> service) : base(service)
        {
        }

        [HttpPost]
        public async Task<IActionResult> CreateTag([FromBody] CreateTagDTO dto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (userId == null)
                    return Unauthorized();

                var tag = new Tag
                {
                    Name = dto.Name,
                    UserId = Guid.Parse(userId)
                };

                var result = await _service.CreateAsync(tag);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
