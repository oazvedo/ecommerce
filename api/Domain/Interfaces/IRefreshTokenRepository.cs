using api.Domain;

namespace api.Domain.Interfaces
{
    public interface IRefreshTokenRepository
    {
        Task<RefreshToken> CreateAsync(RefreshToken refreshToken);
        Task<RefreshToken?> GetByTokenAsync(string token);
        Task RevogarAsync(string token);
        Task RevogarTodosDoUsuarioAsync(Guid usuarioId);
    }
}
