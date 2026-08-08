using api.Application.DTOs.Auditoria;
using api.Application.DTOs.Common;
using api.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuditoriaController : ControllerBase
    {
        private readonly IAuditoriaService _service;

        public AuditoriaController(IAuditoriaService service)
        {
            _service = service;
        }

        [HttpGet]
        [Authorize(Policy = "Auditoria.Read")]
        public async Task<ActionResult<PagedResult<AuditoriaLogDto>>> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            try
            {
                if (page < 1) page = 1;
                if (pageSize < 1) pageSize = 20;
                if (pageSize > 100) pageSize = 100;

                var logs = await _service.GetPagedAsync(page, pageSize);
                return Ok(logs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }
    }
}
