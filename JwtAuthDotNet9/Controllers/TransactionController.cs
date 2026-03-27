using JwtAuthDotNet9.Entities;
using JwtAuthDotNet9.Models;
using JwtAuthDotNet9.Services;
using JwtAuthDotNet9.Services.IServico;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JwtAuthDotNet9.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class TransactionController : GenericController<Transaction>
    {
        private readonly ITransactionService serviceTransaction;
        public TransactionController(IGenericService<Transaction> service, ITransactionService serviceTransaction) : base(service)
        {
            this.serviceTransaction = serviceTransaction;
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateTransaction(TransactionCreateDTO dto)
        {
            try
            {
                Transaction transaction = new Transaction
                {
                    Amount = dto.Amount,
                    Description = dto.Description,
                    Date = dto.Date,
                    WalletInformationId = dto.WalletInformationId,
                    TagName = dto.TagName
                };

                await serviceTransaction.CreateAsync(transaction);

                return Ok(transaction.Id);
            }
            catch (Exception ex)
            {
                return BadRequest("Error to create transaction");
            }
        }

        [HttpPost("listall")]
        public async Task<IActionResult> ListAllTransaction([FromBody] WalletIdDTO dto)
        {
            try
            {
                List<Transaction> transactions = await serviceTransaction.ListAllTransaction(dto.WalletInformationId);

                return Ok(transactions);
            }
            catch (Exception ex)
            {
                return BadRequest("Error to create transaction");
            }
        }

        [HttpPost("listalltag")]
        public async Task<IActionResult> ListAllTagTransaction([FromBody] WalletIdDTO dto)
        {
            try
            {
                Console.WriteLine("test 1");

                List<Transaction> transactions = await serviceTransaction.ListAllTagTransaction(dto.WalletInformationId);

                return Ok(transactions);
            }
            catch (Exception ex)
            {
                return BadRequest("Error to create transaction");
            }
        }
    }
}
