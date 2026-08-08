using api.Application.DTOs.Common;
using api.Application.DTOs.Favorito;
using api.Application.DTOs.Produto;
using api.Application.Services.Interfaces;
using api.Application.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FavoritoController(IFavoritoService service) : ControllerBase
    {
        [HttpPost("{produtoId}")]
        [Authorize(Policy = "Favorito.Manage")]
        public async Task<IActionResult> Adicionar(Guid produtoId)
        {
            await service.AdicionarAsync(User.GetId(), produtoId);
            return NoContent();
        }

        [HttpDelete("{produtoId}")]
        [Authorize(Policy = "Favorito.Manage")]
        public async Task<IActionResult> Remover(Guid produtoId)
        {
            await service.RemoverAsync(User.GetId(), produtoId);
            return NoContent();
        }

        [HttpGet("{produtoId}/status")]
        [Authorize(Policy = "Favorito.Read")]
        public async Task<ActionResult<FavoritoStatusDto>> GetStatus(Guid produtoId)
        {
            var favoritado = await service.EstaFavoritadoAsync(User.GetId(), produtoId);
            return Ok(new FavoritoStatusDto { Favoritado = favoritado });
        }

        [HttpGet("ids")]
        [Authorize(Policy = "Favorito.Read")]
        public async Task<ActionResult<IEnumerable<Guid>>> GetIds()
            => Ok(await service.GetProdutoIdsFavoritadosAsync(User.GetId()));

        [HttpGet]
        [Authorize(Policy = "Favorito.Read")]
        public async Task<ActionResult<PagedResult<ProdutoDto>>> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 20;
            return Ok(await service.GetPagedAsync(User.GetId(), page, pageSize));
        }
    }
}
