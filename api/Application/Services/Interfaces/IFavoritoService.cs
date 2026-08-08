using api.Application.DTOs.Common;
using api.Application.DTOs.Produto;

namespace api.Application.Services.Interfaces
{
    public interface IFavoritoService
    {
        Task AdicionarAsync(Guid usuarioId, Guid produtoId);
        Task RemoverAsync(Guid usuarioId, Guid produtoId);
        Task<bool> EstaFavoritadoAsync(Guid usuarioId, Guid produtoId);
        Task<HashSet<Guid>> GetProdutoIdsFavoritadosAsync(Guid usuarioId);
        Task<PagedResult<ProdutoDto>> GetPagedAsync(Guid usuarioId, int page, int pageSize);
    }
}
