using api.Application.DTOs.Categoria;
using api.Application.DTOs.Common;
using api.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriaProdutoController(ICategoriaProdutoService service) : ControllerBase
    {
        [HttpGet]
        [Authorize(Policy = "Categoria.Read")]
        public async Task<ActionResult<PagedResult<CategoriaProdutoDto>>> GetAll(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50,
            [FromQuery] bool? ativo = null)
        {
            try
            {
                if (page < 1) page = 1;
                if (pageSize < 1) pageSize = 50;

                var categorias = await service.SearchPagedAsync(page, pageSize, ativo);
                return Ok(categorias);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }

        [HttpGet("{id}")]
        [Authorize(Policy = "Categoria.Read")]
        public async Task<ActionResult<CategoriaProdutoDto?>> GetById(Guid id)
        {
            try
            {
                var categoria = await service.GetByIdAsync(id);
                if (categoria == null)
                    return NotFound(new { mensagem = "Categoria não encontrada." });

                return Ok(categoria);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }

        [HttpPost]
        [Authorize(Policy = "Categoria.Manage")]
        public async Task<ActionResult<CategoriaProdutoDto>> Create(CreateCategoriaProdutoRequest request)
        {
            try
            {
                var categoria = await service.CriarAsync(request.Nome);
                return CreatedAtAction(nameof(GetById), new { id = categoria.Id }, categoria);
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

        [HttpPut("{id}")]
        [Authorize(Policy = "Categoria.Manage")]
        public async Task<ActionResult<CategoriaProdutoDto>> Update(Guid id, UpdateCategoriaProdutoRequest request)
        {
            try
            {
                var categoria = await service.AtualizarAsync(id, request.Nome, request.Ativo);
                if (categoria == null)
                    return NotFound(new { mensagem = "Categoria não encontrada." });

                return Ok(categoria);
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

        [HttpDelete("{id}")]
        [Authorize(Policy = "Categoria.Manage")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var categoria = await service.GetByIdAsync(id);
                if (categoria == null)
                    return NotFound(new { mensagem = "Categoria não encontrada." });

                // Soft delete: produtos podem referenciar a categoria, então ela é apenas
                // desativada em vez de removida, ficando indisponível para novas seleções.
                await service.AtualizarAsync(id, categoria.Nome, false);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }
    }
}
