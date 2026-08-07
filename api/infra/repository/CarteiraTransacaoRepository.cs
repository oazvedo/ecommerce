using api.Domain;
using api.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace api.infra.repository
{
    public class CarteiraTransacaoRepository(DatabaseContext db) : ICarteiraTransacaoRepository
    {
        public async Task AddAsync(CarteiraTransacao transacao)
        {
            db.CarteiraTransacoes.Add(transacao);
            await db.SaveChangesAsync();
        }

        public async Task<IEnumerable<CarteiraTransacao>> GetByCarteiraIdAsync(Guid carteiraId)
        {
            return await db.CarteiraTransacoes
                .Where(t => t.CarteiraId == carteiraId)
                .OrderByDescending(t => t.OcorridoEm)
                .ToListAsync();
        }
    }
}
