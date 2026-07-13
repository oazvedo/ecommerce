using api.application.services.interfaces;
using api.Application.DTOs.Produto;
using api.Domain;

namespace api.Application.Services.Interfaces
{
    public interface IProdutoService : IServiceBase<Produto, ProdutoDto>
    {
        Task<ProdutoDto?> UpdateAsync(Guid id, UpdateProdutoRequest request);
        Task AtualizarImagemAsync(Guid id, string url);
    }
}
