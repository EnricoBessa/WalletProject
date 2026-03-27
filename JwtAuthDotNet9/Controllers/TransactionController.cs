using JwtAuthDotNet9.Entities;
using JwtAuthDotNet9.Services;
using Microsoft.AspNetCore.Mvc;

namespace JwtAuthDotNet9.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TransactionController : GenericController<Transaction>
    {
        public TransactionController(IGenericService<Transaction> service) : base(service)
        {
        }
    }
}
