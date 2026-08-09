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
        private readonly IAuditoriaService _auditoriaService;

        public ProdutoController(IProdutoService service, IUsuarioService usuarioService, IAuditoriaService auditoriaService)
        {
            _service = service;
            _usuarioService = usuarioService;
            _auditoriaService = auditoriaService;
        }

        [HttpGet]
        [Authorize(Policy = "Produto.Read")]
        public async Task<ActionResult<PagedResult<ProdutoDto>>> GetAll(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] Guid? empresaId = null,
            [FromQuery] string? nome = null,
            [FromQuery] bool? disponivel = null,
            [FromQuery] bool? freteGratis = null,
            [FromQuery] decimal? precoMin = null,
            [FromQuery] decimal? precoMax = null,
            [FromQuery] string? orderBy = null,
            [FromQuery] Guid? categoriaId = null)
        {
            try
            {
                if (page < 1) page = 1;
                if (pageSize < 1) pageSize = 10;

                // empresaId filtra o catálogo pela loja vendedora; nome busca em nome/codigo.
                // orderBy aceita: preco_asc, preco_desc, nome_asc (padrão: mais recentes).
                var produtos = await _service.SearchPagedAsync(
                    page, pageSize, empresaId, nome, disponivel, freteGratis, precoMin, precoMax, orderBy, categoriaId);
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
                    Variantes = request.Variantes,
                    CategoriaId = request.CategoriaId
                };
                var produto = await _service.CreateAsync(entity);
                await _auditoriaService.RegistrarAsync(User.GetId(), User.GetNome() ?? "", "Criar", "Produto", produto.Id, usuario.EmpresaId);
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

                await _auditoriaService.RegistrarAsync(User.GetId(), User.GetNome() ?? "", "Atualizar", "Produto", produto.Id, produto.EmpresaId);
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
                var produto = await _service.GetByIdAsync(id);
                var removido = await _service.DeleteAsync(id);
                if (!removido)
                    return NotFound(new { mensagem = "Produto não encontrado." });

                await _auditoriaService.RegistrarAsync(User.GetId(), User.GetNome() ?? "", "Excluir", "Produto", id, produto?.EmpresaId);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }
    }
}
