using JwtAuthDotNet9.Entities;
using JwtAuthDotNet9.Services;
using Microsoft.AspNetCore.Mvc;

namespace JwtAuthDotNet9.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WalletController : GenericController<Tag>
    {
        public WalletController(IGenericService<Tag> service) : base(service)
        {
        }
    }
}
