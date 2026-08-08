using api.Domain;
using api.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace api.infra.repository
{
    public class AvaliacaoRepository(DatabaseContext db) : IAvaliacaoRepository
    {
        public Task<Avaliacao?> GetByUsuarioEProdutoAsync(Guid usuarioId, Guid produtoId) =>
            db.Avaliacoes.FirstOrDefaultAsync(a => a.UsuarioId == usuarioId && a.ProdutoId == produtoId);

        public Task<Avaliacao?> GetByUsuarioEEmpresaAsync(Guid usuarioId, Guid empresaId) =>
            db.Avaliacoes.FirstOrDefaultAsync(a => a.UsuarioId == usuarioId && a.EmpresaId == empresaId);

        public async Task<Avaliacao> AddAsync(Avaliacao avaliacao)
        {
            db.Avaliacoes.Add(avaliacao);
            await db.SaveChangesAsync();
            return avaliacao;
        }

        public async Task UpdateAsync(Avaliacao avaliacao)
        {
            db.Avaliacoes.Update(avaliacao);
            await db.SaveChangesAsync();
        }

        public async Task<(IEnumerable<Avaliacao> Items, int TotalCount)> GetPagedByProdutoAsync(Guid produtoId, int page, int pageSize)
        {
            var query = db.Avaliacoes.AsNoTracking().Include(a => a.Usuario).Where(a => a.ProdutoId == produtoId);
            var totalCount = await query.CountAsync();
            var items = await query.OrderByDescending(a => a.CriadoEm).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
            return (items, totalCount);
        }

        public async Task<(IEnumerable<Avaliacao> Items, int TotalCount)> GetPagedByEmpresaAsync(Guid empresaId, int page, int pageSize)
        {
            var query = db.Avaliacoes.AsNoTracking().Include(a => a.Usuario).Where(a => a.EmpresaId == empresaId);
            var totalCount = await query.CountAsync();
            var items = await query.OrderByDescending(a => a.CriadoEm).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
            return (items, totalCount);
        }

        public async Task<(double Media, int Total)> GetResumoByProdutoAsync(Guid produtoId)
        {
            var query = db.Avaliacoes.AsNoTracking().Where(a => a.ProdutoId == produtoId);
            var total = await query.CountAsync();
            if (total == 0) return (0, 0);
            var media = await query.AverageAsync(a => a.Nota);
            return (media, total);
        }

        public async Task<(double Media, int Total)> GetResumoByEmpresaAsync(Guid empresaId)
        {
            var query = db.Avaliacoes.AsNoTracking().Where(a => a.EmpresaId == empresaId);
            var total = await query.CountAsync();
            if (total == 0) return (0, 0);
            var media = await query.AverageAsync(a => a.Nota);
            return (media, total);
        }

        public async Task<Dictionary<Guid, (double Media, int Total)>> GetResumoByProdutosAsync(IEnumerable<Guid> produtoIds)
        {
            var ids = produtoIds.ToList();
            if (ids.Count == 0) return new Dictionary<Guid, (double, int)>();

            var resumos = await db.Avaliacoes
                .AsNoTracking()
                .Where(a => a.ProdutoId != null && ids.Contains(a.ProdutoId.Value))
                .GroupBy(a => a.ProdutoId!.Value)
                .Select(g => new { ProdutoId = g.Key, Media = g.Average(a => a.Nota), Total = g.Count() })
                .ToListAsync();

            return resumos.ToDictionary(r => r.ProdutoId, r => (r.Media, r.Total));
        }
    }
}
