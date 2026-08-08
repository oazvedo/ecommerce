using api.Domain;
using api.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace api.infra.repository
{
    public class FavoritoRepository(DatabaseContext db) : IFavoritoRepository
    {
        public Task<Favorito?> GetByUsuarioEProdutoAsync(Guid usuarioId, Guid produtoId) =>
            db.Favoritos.FirstOrDefaultAsync(f => f.UsuarioId == usuarioId && f.ProdutoId == produtoId);

        public async Task AddAsync(Favorito favorito)
        {
            db.Favoritos.Add(favorito);
            await db.SaveChangesAsync();
        }

        public async Task RemoveAsync(Favorito favorito)
        {
            db.Favoritos.Remove(favorito);
            await db.SaveChangesAsync();
        }

        public async Task<HashSet<Guid>> GetProdutoIdsByUsuarioAsync(Guid usuarioId)
        {
            var ids = await db.Favoritos.AsNoTracking()
                .Where(f => f.UsuarioId == usuarioId)
                .Select(f => f.ProdutoId)
                .ToListAsync();
            return ids.ToHashSet();
        }

        public async Task<(IEnumerable<Produto> Items, int TotalCount)> GetPagedProdutosByUsuarioAsync(Guid usuarioId, int page, int pageSize)
        {
            var query = db.Favoritos.AsNoTracking()
                .Where(f => f.UsuarioId == usuarioId)
                .OrderByDescending(f => f.CriadoEm)
                .Join(db.Produtos, f => f.ProdutoId, p => p.Id, (f, p) => p);

            var totalCount = await query.CountAsync();
            var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
            return (items, totalCount);
        }
    }
}
