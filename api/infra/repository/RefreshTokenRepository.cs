using api.Domain;
using api.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace api.infra.repository
{
    public class RefreshTokenRepository : IRefreshTokenRepository
    {
        private readonly DatabaseContext _context;

        public RefreshTokenRepository(DatabaseContext context)
        {
            _context = context;
        }

        public async Task<RefreshToken> CreateAsync(RefreshToken refreshToken)
        {
            _context.RefreshTokens.Add(refreshToken);
            await _context.SaveChangesAsync();
            return refreshToken;
        }

        public async Task<RefreshToken?> GetByTokenAsync(string token)
        {
            return await _context.RefreshTokens
                .Include(rt => rt.Usuario)
                .ThenInclude(u => u!.UsuarioPermissoes)
                .ThenInclude(up => up.Permissao)
                .FirstOrDefaultAsync(rt => rt.Token == token);
        }

        public async Task RevogarAsync(string token)
        {
            var refreshToken = await _context.RefreshTokens.FirstOrDefaultAsync(rt => rt.Token == token);
            if (refreshToken is null) return;

            refreshToken.Revogado = true;
            await _context.SaveChangesAsync();
        }

        public async Task RevogarTodosDoUsuarioAsync(Guid usuarioId)
        {
            var tokens = await _context.RefreshTokens
                .Where(rt => rt.UsuarioId == usuarioId && !rt.Revogado)
                .ToListAsync();

            foreach (var token in tokens)
                token.Revogado = true;

            await _context.SaveChangesAsync();
        }
    }
}
