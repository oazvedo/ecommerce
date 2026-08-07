using api.Domain;
using api.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace api.infra.repository
{
    public class ProdutoRepository : RepositoryBase<Produto>, IProdutoRepository
    {
        public ProdutoRepository(DatabaseContext context) : base(context) {}

        public async Task<(IEnumerable<Produto> Items, int TotalCount)> GetPagedByEmpresaAsync(Guid empresaId, int page, int pageSize)
        {
            var query = _dbSet.AsNoTracking().Where(p => p.EmpresaId == empresaId);
            var totalCount = await query.CountAsync();
            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }

        public async Task<bool> TryDecrementarEstoqueAsync(Guid produtoId, int quantidade)
        {
            // UPDATE atômico: só baixa se houver saldo. A condição estoque >= quantidade
            // no WHERE garante que dois pedidos simultâneos não zerem/negativem o estoque.
            var linhasAfetadas = await _dbSet
                .Where(p => p.Id == produtoId && p.Estoque >= quantidade)
                .ExecuteUpdateAsync(s => s.SetProperty(p => p.Estoque, p => p.Estoque - quantidade));

            return linhasAfetadas > 0;
        }
    }
}