using api.Application.DTOs.Common;
using api.Application.DTOs.Produto;
using api.Application.Services.Interfaces;
using api.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProdutoController : ControllerBase
    {
        private readonly IProdutoService _service;

        public ProdutoController(IProdutoService service)
        {
            _service = service;
        }

        [HttpGet]
        [Authorize(Policy = "Produto.Read")]
        public async Task<ActionResult<PagedResult<ProdutoDto>>> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                if (page < 1) page = 1;
                if (pageSize < 1) pageSize = 10;

                var produtos = await _service.GetPagedAsync(page, pageSize);
                return Ok(produtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }

        [HttpGet("{id}")]
        [Authorize(Policy = "Produto.Read")]
        public async Task<ActionResult<ProdutoDto?>> GetProdutoById(Guid id)
        {
            try
            {
                var produto = await _service.GetByIdAsync(id);
                if (produto == null)
                    return NotFound(new { mensagem = "Produto não encontrado." });

                return Ok(produto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }

        [HttpPost]
        [Authorize(Policy = "Produto.Create")]
        public async Task<ActionResult<ProdutoDto>> Create(CreateProdutoRequest request)
        {
            try
            {
                var produto = await _service.CreateAsync(new Produto(request.Nome, request.Descricao, request.Preco, request.Codigo, request.Status));
                return CreatedAtAction(nameof(GetProdutoById), new { id = produto.Id }, produto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "Produto.Update")]
        public async Task<ActionResult<ProdutoDto>> Update(Guid id, UpdateProdutoRequest request)
        {
            try
            {
                var entity = new Produto(request.Nome, request.Descricao, request.Preco, request.Codigo, request.Status);
                var produto = await _service.UpdateAsync(entity);
                if (produto == null)
                    return NotFound(new { mensagem = "Produto não encontrado." });

                return Ok(produto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "Produto.Delete")]
        public async Task<ActionResult<ProdutoDto>> Delete(Guid id)
        {
            try
            {
                var removido = await _service.DeleteAsync(id);
                if (!removido)
                    return NotFound(new { mensagem = "Produto não encontrado." });

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }
    }
}
