using api.Domain;
using api.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace api.infra.repository
{
    public class ProdutoRepository : RepositoryBase<Produto>, IProdutoRepository
    {
        public ProdutoRepository(DatabaseContext context) : base(context) {}

        public async Task<(IEnumerable<Produto> Items, int TotalCount)> SearchPagedAsync(
            int page, int pageSize, Guid? empresaId, string? nome, bool? disponivel, bool? freteGratis)
        {
            var query = _dbSet.AsNoTracking();

            if (empresaId.HasValue)
                query = query.Where(p => p.EmpresaId == empresaId.Value);

            if (!string.IsNullOrWhiteSpace(nome))
                query = query.Where(p => EF.Functions.ILike(p.Nome, $"%{nome}%") || EF.Functions.ILike(p.Codigo, $"%{nome}%"));

            if (disponivel.HasValue)
                query = query.Where(p => p.Status == disponivel.Value);

            if (freteGratis.HasValue)
                query = query.Where(p => p.FreteGratis == freteGratis.Value);

            var totalCount = await query.CountAsync();
            var items = await query
                .OrderByDescending(p => p.CriadoEm)
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