using api.application.services.interfaces;
using api.Application.DTOs.Categoria;
using api.Application.DTOs.Common;
using api.Domain;

namespace api.Application.Services.Interfaces
{
    public interface ICategoriaProdutoService : IServiceBase<CategoriaProduto, CategoriaProdutoDto>
    {
        Task<PagedResult<CategoriaProdutoDto>> SearchPagedAsync(int page, int pageSize, bool? ativo);
        Task<CategoriaProdutoDto> CriarAsync(string nome);
        Task<CategoriaProdutoDto?> AtualizarAsync(Guid id, string nome, bool ativo);
    }
}
