using JwtAuthDotNet9.Entities;
using JwtAuthDotNet9.Services;
using Microsoft.AspNetCore.Mvc;

namespace JwtAuthDotNet9.Controllers
{
    public class TagController(IGenericService<Tag> service) : GenericController<Tag>(service)
    {
    }
}
