using api.Domain;
using Microsoft.EntityFrameworkCore;

namespace api.infra.repository
{
    public class AuditoriaLogRepository : RepositoryBase<AuditoriaLog>
    {
        public AuditoriaLogRepository(DatabaseContext context) : base(context) { }

        public override async Task<(IEnumerable<AuditoriaLog> Items, int TotalCount)> GetPagedAsync(int page, int pageSize)
        {
            var query = _dbSet.AsNoTracking().OrderByDescending(a => a.OcorridoEm);
            var totalCount = await query.CountAsync();
            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }
    }
}
