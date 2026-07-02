using api.Domain;
using api.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace api.infra.repository
{
    public class CarteiraRepository : RepositoryBase<Carteira>, ICarteiraRepository
    {
        public CarteiraRepository(DatabaseContext context) : base(context) {}

        public async Task <Carteira?> GetCarteiraByUsuarioId(Guid id)
        {
            return await _context.Carteiras
                .Include(c => c.Usuario)
                .FirstOrDefaultAsync(u => u.UsuarioId == id);
        }
        public override async Task<IEnumerable<Carteira>> GetAllAsync()
            => await _dbSet.Include(c => c.Usuario).ToListAsync();

        public override async Task<Carteira?> GetByIdAsync(Guid id)
            => await _dbSet.Include(c => c.Usuario).FirstOrDefaultAsync(c => c.Id == id);
    }
}