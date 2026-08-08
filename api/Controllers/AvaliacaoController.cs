using api.Application.DTOs.Avaliacao;
using api.Application.DTOs.Common;
using api.Application.Services.Interfaces;
using api.Application.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AvaliacaoController(IAvaliacaoService service) : ControllerBase
    {
        [HttpPost]
        [Authorize(Policy = "Avaliacao.Create")]
        public async Task<ActionResult<AvaliacaoDto>> Avaliar(CreateAvaliacaoRequest request)
        {
            try
            {
                var avaliacao = await service.AvaliarAsync(User.GetId(), request);
                return Ok(avaliacao);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { mensagem = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }

        [HttpGet("produto/{produtoId}")]
        [Authorize(Policy = "Avaliacao.Read")]
        public async Task<ActionResult<PagedResult<AvaliacaoDto>>> GetByProduto(Guid produtoId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 10;
            return Ok(await service.GetPagedByProdutoAsync(produtoId, page, pageSize));
        }

        [HttpGet("produto/{produtoId}/resumo")]
        [Authorize(Policy = "Avaliacao.Read")]
        public async Task<ActionResult<AvaliacaoResumoDto>> GetResumoProduto(Guid produtoId)
            => Ok(await service.GetResumoByProdutoAsync(produtoId));

        [HttpGet("empresa/{empresaId}")]
        [Authorize(Policy = "Avaliacao.Read")]
        public async Task<ActionResult<PagedResult<AvaliacaoDto>>> GetByEmpresa(Guid empresaId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 10;
            return Ok(await service.GetPagedByEmpresaAsync(empresaId, page, pageSize));
        }

        [HttpGet("empresa/{empresaId}/resumo")]
        [Authorize(Policy = "Avaliacao.Read")]
        public async Task<ActionResult<AvaliacaoResumoDto>> GetResumoEmpresa(Guid empresaId)
            => Ok(await service.GetResumoByEmpresaAsync(empresaId));
    }
}
