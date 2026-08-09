using api.domain.interfaces;
using api.Domain;

namespace api.Domain.Interfaces
{
    public interface ICategoriaProdutoRepository : IRepositoryBase<CategoriaProduto>
    {
        Task<(IEnumerable<CategoriaProduto> Items, int TotalCount)> SearchPagedAsync(int page, int pageSize, bool? ativo);
        Task<bool> ExisteNomeAsync(string nome, Guid? ignorarId = null);
    }
}
