using api.Domain;
using api.Domain.Enums.UsuarioEnums;
using api.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace api.infra.repository
{
    public class CargoPermissaoRepository : ICargoPermissaoRepository
    {
        private readonly DatabaseContext _context;

        public CargoPermissaoRepository(DatabaseContext context) => _context = context;

        public async Task<IEnumerable<CargoPermissao>> GetAllAsync()
            => await _context.CargoPermissoes
                .Include(cp => cp.Permissao)
                .AsNoTracking()
                .ToListAsync();

        public async Task<IEnumerable<CargoPermissao>> GetByCargoAsync(UsuarioCargo cargo)
            => await _context.CargoPermissoes
                .Include(cp => cp.Permissao)
                .Where(cp => cp.Cargo == cargo)
                .AsNoTracking()
                .ToListAsync();

        public async Task SetCargoPermissoesAsync(UsuarioCargo cargo, IEnumerable<Guid> permissaoIds)
        {
            var existing = await _context.CargoPermissoes
                .Where(cp => cp.Cargo == cargo)
                .ToListAsync();

            _context.CargoPermissoes.RemoveRange(existing);

            foreach (var pid in permissaoIds)
            {
                _context.CargoPermissoes.Add(new CargoPermissao { Cargo = cargo, PermissaoId = pid });
            }

            await _context.SaveChangesAsync();
        }
    }
}
