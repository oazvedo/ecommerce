using api.Domain;
using api.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace api.infra.repository
{
    public class CategoriaProdutoRepository : RepositoryBase<CategoriaProduto>, ICategoriaProdutoRepository
    {
        public CategoriaProdutoRepository(DatabaseContext context) : base(context) { }

        public async Task<(IEnumerable<CategoriaProduto> Items, int TotalCount)> SearchPagedAsync(int page, int pageSize, bool? ativo)
        {
            var query = _dbSet.AsNoTracking();

            if (ativo.HasValue)
                query = query.Where(c => c.Ativo == ativo.Value);

            query = query.OrderBy(c => c.Nome);

            var totalCount = await query.CountAsync();
            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }

        public async Task<bool> ExisteNomeAsync(string nome, Guid? ignorarId = null)
        {
            var query = _dbSet.AsNoTracking().Where(c => EF.Functions.ILike(c.Nome, nome));

            if (ignorarId.HasValue)
                query = query.Where(c => c.Id != ignorarId.Value);

            return await query.AnyAsync();
        }
    }
}
