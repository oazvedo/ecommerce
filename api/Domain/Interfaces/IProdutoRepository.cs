using api.domain.interfaces;
using api.Domain;

namespace api.Domain.Interfaces
{
    public interface IProdutoRepository : IRepositoryBase<Produto>
    {
        Task<(IEnumerable<Produto> Items, int TotalCount)> GetPagedByEmpresaAsync(Guid empresaId, int page, int pageSize);

        /// <summary>
        /// Baixa atômica de estoque: decrementa só se houver saldo suficiente.
        /// Retorna false se o estoque for insuficiente (protege contra oversell concorrente).
        /// </summary>
        Task<bool> TryDecrementarEstoqueAsync(Guid produtoId, int quantidade);
    }
}