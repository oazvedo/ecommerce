using api.Application.DTOs.Common;
using api.Application.DTOs.Permissao;
using api.application.services.interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PermissaoController : ControllerBase
    {
        private readonly IPermissaoService _service;

        public PermissaoController(IPermissaoService service)
        {
            _service = service;
        }

        [HttpGet]
        [Authorize(Policy = "Permissao.Read")]
        public async Task<ActionResult<PagedResult<PermissaoDto>>> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 10;

            var permissoes = await _service.GetAllAsync(page, pageSize);
            return Ok(permissoes);
        }

        [HttpGet("usuario/{usuarioId}")]
        [Authorize(Policy = "Permissao.Read")]
        public async Task<ActionResult<IEnumerable<PermissaoDto>>> GetByUsuario(Guid usuarioId)
        {
            var permissoes = await _service.GetByUsuarioIdAsync(usuarioId);
            return Ok(permissoes);
        }

        [HttpPost("usuario/{usuarioId}/{permissaoId}")]
        [Authorize(Policy = "Permissao.Assign")]
        public async Task<IActionResult> Adicionar(Guid usuarioId, Guid permissaoId)
        {
            var adicionado = await _service.AdicionarAsync(usuarioId, permissaoId);
            if (!adicionado)
                return Conflict(new { mensagem = "Usuário ou permissão não encontrado, ou permissão já atribuída." });

            return NoContent();
        }

        [HttpDelete("usuario/{usuarioId}/{permissaoId}")]
        [Authorize(Policy = "Permissao.Remove")]
        public async Task<IActionResult> Remover(Guid usuarioId, Guid permissaoId)
        {
            var removido = await _service.RemoverAsync(usuarioId, permissaoId);
            if (!removido)
                return NotFound(new { mensagem = "Vínculo entre usuário e permissão não encontrado." });

            return NoContent();
        }

        [HttpDelete("usuario/{usuarioId}")]
        [Authorize(Policy = "Permissao.RemoveAll")]
        public async Task<IActionResult> RemoverTodas(Guid usuarioId)
        {
            var removido = await _service.RemoverTodasPermissoesAsync(usuarioId);
            if (!removido)
                return NotFound(new { mensagem = "Usuário não encontrado ou sem permissões atribuídas." });

            return NoContent();
        }
    }
}
