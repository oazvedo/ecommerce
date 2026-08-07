using api.application.services.interfaces;
using api.Application.DTOs.Common;
using api.Application.DTOs.Produto;
using api.Application.Services.Interfaces;
using api.Application.Utils;
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
        private readonly IUsuarioService _usuarioService;

        public ProdutoController(IProdutoService service, IUsuarioService usuarioService)
        {
            _service = service;
            _usuarioService = usuarioService;
        }

        [HttpGet]
        [Authorize(Policy = "Produto.Read")]
        public async Task<ActionResult<PagedResult<ProdutoDto>>> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] Guid? empresaId = null)
        {
            try
            {
                if (page < 1) page = 1;
                if (pageSize < 1) pageSize = 10;

                // Catálogo por loja: filtra pela loja vendedora quando empresaId é informado.
                var produtos = empresaId.HasValue
                    ? await _service.GetPagedByEmpresaAsync(empresaId.Value, page, pageSize)
                    : await _service.GetPagedAsync(page, pageSize);
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
                var usuario = await _usuarioService.GetByIdAsync(User.GetId());
                if (usuario == null)
                    return NotFound(new { mensagem = "Usuário não encontrado." });

                var entity = new Produto(request.Nome, request.Descricao, request.Preco, request.Codigo, usuario.EmpresaId, request.Status)
                {
                    Estoque = request.Estoque,
                    FreteGratis = request.FreteGratis,
                    Variantes = request.Variantes
                };
                var produto = await _service.CreateAsync(entity);
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
                var produto = await _service.UpdateAsync(id, request);
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
