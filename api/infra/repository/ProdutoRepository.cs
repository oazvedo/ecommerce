using api.Domain;
using api.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace api.infra.repository
{
    public class ProdutoRepository : RepositoryBase<Produto>, IProdutoRepository
    {
        public ProdutoRepository(DatabaseContext context) : base(context) {}

        public override async Task<Produto?> GetByIdAsync(Guid id)
            => await _dbSet.Include(p => p.CategoriaProduto).FirstOrDefaultAsync(p => p.Id == id);

        public async Task<(IEnumerable<Produto> Items, int TotalCount)> SearchPagedAsync(
            int page, int pageSize, Guid? empresaId, string? nome, bool? disponivel, bool? freteGratis,
            decimal? precoMin, decimal? precoMax, string? orderBy, Guid? categoriaId)
        {
            IQueryable<Produto> query = _dbSet.AsNoTracking().Include(p => p.CategoriaProduto);

            if (empresaId.HasValue)
                query = query.Where(p => p.EmpresaId == empresaId.Value);

            if (!string.IsNullOrWhiteSpace(nome))
                query = query.Where(p => EF.Functions.ILike(p.Nome, $"%{nome}%") || EF.Functions.ILike(p.Codigo, $"%{nome}%"));

            if (disponivel.HasValue)
                query = query.Where(p => p.Status == disponivel.Value);

            if (freteGratis.HasValue)
                query = query.Where(p => p.FreteGratis == freteGratis.Value);

            if (precoMin.HasValue)
                query = query.Where(p => p.Preco >= precoMin.Value);

            if (precoMax.HasValue)
                query = query.Where(p => p.Preco <= precoMax.Value);

            if (categoriaId.HasValue)
                query = query.Where(p => p.CategoriaId == categoriaId.Value);

            query = orderBy switch
            {
                "preco_asc" => query.OrderBy(p => p.Preco),
                "preco_desc" => query.OrderByDescending(p => p.Preco),
                "nome_asc" => query.OrderBy(p => p.Nome),
                _ => query.OrderByDescending(p => p.CriadoEm),
            };

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