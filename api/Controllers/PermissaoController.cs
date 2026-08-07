using api.Application.DTOs.Common;
using api.Application.DTOs.Permissao;
using api.application.services.interfaces;
using api.Domain.Enums.UsuarioEnums;
using api.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PermissaoController : ControllerBase
    {
        private readonly IPermissaoService _service;
        private readonly ICargoPermissaoRepository _cargoPermissaoRepository;

        public PermissaoController(IPermissaoService service, ICargoPermissaoRepository cargoPermissaoRepository)
        {
            _service = service;
            _cargoPermissaoRepository = cargoPermissaoRepository;
        }

        [HttpGet]
        [Authorize(Policy = "Permissao.Read")]
        public async Task<ActionResult<PagedResult<PermissaoDto>>> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                if (page < 1) page = 1;
                if (pageSize < 1) pageSize = 10;

                var permissoes = await _service.GetAllAsync(page, pageSize);
                return Ok(permissoes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }

        [HttpGet("usuario/{usuarioId}")]
        [Authorize(Policy = "Permissao.Read")]
        public async Task<ActionResult<IEnumerable<PermissaoDto>>> GetByUsuario(Guid usuarioId)
        {
            try
            {
                var permissoes = await _service.GetByUsuarioIdAsync(usuarioId);
                return Ok(permissoes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }

        [HttpPost("usuario/{usuarioId}/{permissaoId}")]
        [Authorize(Policy = "Permissao.Assign")]
        public async Task<IActionResult> Adicionar(Guid usuarioId, Guid permissaoId)
        {
            try
            {
                var adicionado = await _service.AdicionarAsync(usuarioId, permissaoId);
                if (!adicionado)
                    return Conflict(new { mensagem = "Usuário ou permissão não encontrado, ou permissão já atribuída." });

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }

        [HttpDelete("usuario/{usuarioId}/{permissaoId}")]
        [Authorize(Policy = "Permissao.Remove")]
        public async Task<IActionResult> Remover(Guid usuarioId, Guid permissaoId)
        {
            try
            {
                var removido = await _service.RemoverAsync(usuarioId, permissaoId);
                if (!removido)
                    return NotFound(new { mensagem = "Vínculo entre usuário e permissão não encontrado." });

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }

        [HttpDelete("usuario/{usuarioId}")]
        [Authorize(Policy = "Permissao.RemoveAll")]
        public async Task<IActionResult> RemoverTodas(Guid usuarioId)
        {
            try
            {
                var removido = await _service.RemoverTodasPermissoesAsync(usuarioId);
                if (!removido)
                    return NotFound(new { mensagem = "Usuário não encontrado ou sem permissões atribuídas." });

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }

        [HttpGet("cargo")]
        [Authorize(Policy = "Permissao.Read")]
        public async Task<ActionResult<Dictionary<string, IEnumerable<PermissaoDto>>>> GetByCargo()
        {
            try
            {
                var all = await _cargoPermissaoRepository.GetAllAsync();
                var grouped = all
                    .GroupBy(cp => cp.Cargo.ToString())
                    .ToDictionary(
                        g => g.Key,
                        g => g.Select(cp => new PermissaoDto
                        {
                            Id = cp.Permissao.Id,
                            Nome = cp.Permissao.Nome,
                            Descricao = cp.Permissao.Descricao
                        })
                    );
                return Ok(grouped);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }

        [HttpPut("cargo/{cargo}")]
        [Authorize(Policy = "Permissao.Assign")]
        public async Task<IActionResult> SetByCargo(UsuarioCargo cargo, [FromBody] List<Guid> permissaoIds)
        {
            try
            {
                await _cargoPermissaoRepository.SetCargoPermissoesAsync(cargo, permissaoIds);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }
    }
}
