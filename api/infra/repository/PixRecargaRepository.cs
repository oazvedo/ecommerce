using api.Domain;
using api.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace api.infra.repository
{
    public class PixRecargaRepository : IPixRecargaRepository
    {
        private readonly DatabaseContext _context;

        public PixRecargaRepository(DatabaseContext context) => _context = context;

        public async Task<PixRecarga> AddAsync(PixRecarga pixRecarga)
        {
            _context.PixRecargas.Add(pixRecarga);
            await _context.SaveChangesAsync();
            return pixRecarga;
        }

        public async Task<PixRecarga?> GetByAbacatePayIdAsync(string abacatePayId)
            => await _context.PixRecargas.FirstOrDefaultAsync(p => p.AbacatePayId == abacatePayId);

        public async Task<PixRecarga?> GetByIdAsync(Guid id)
            => await _context.PixRecargas.FirstOrDefaultAsync(p => p.Id == id);

        public async Task UpdateAsync(PixRecarga pixRecarga)
        {
            _context.PixRecargas.Update(pixRecarga);
            await _context.SaveChangesAsync();
        }
    }
}
