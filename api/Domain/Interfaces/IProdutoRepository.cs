using api.domain.interfaces;
using api.Domain;

namespace api.Domain.Interfaces
{
    public interface IProdutoRepository : IRepositoryBase<Produto>
    {
        Task<(IEnumerable<Produto> Items, int TotalCount)> GetPagedByEmpresaAsync(Guid empresaId, int page, int pageSize);
    }
}