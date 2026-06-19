using JwtAuthDotNet9.Services.IServico;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace JwtAuthDotNet9.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class GenericController<T> : ControllerBase where T : class
    {
        protected readonly IGenericService<T> _service;

        public GenericController(IGenericService<T> service)
        {
            _service = service;
        }

        private Guid GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            return Guid.Parse(claim!.Value);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var userId = GetUserId();
                var data = await _service.GetAllAsync(userId);
                return Ok(data);
            }
            catch (Exception ex)
            {
                return BadRequest("Error to get all");
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] T entity)
        {
            try
            {
                var userId = GetUserId();

                var prop = entity.GetType().GetProperty("UserId");

                prop?.SetValue(entity, userId);

                var result = await _service.CreateAsync(entity);

                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine("ERRO" + ex.Message);
                return BadRequest("Error to create");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var userId = GetUserId();

                var success = await _service.DeleteAsync(id, userId);

                if (!success)
                    return NotFound();

                return NoContent();
            }
            catch (Exception ex)
            {
                Console.WriteLine("ERRO" + ex.Message);
                return BadRequest("Error to delete");
            }
        }
    }
}