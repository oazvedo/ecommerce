using api.domain;

namespace api.domain.interfaces
{
    public interface IUsuarioRepository
    {
        Task<IEnumerable<Usuario>> GetAllAsync();
        Task<(IEnumerable<Usuario> Items, int TotalCount)> GetPagedAsync(int page, int pageSize);
        Task<Usuario?> GetByIdAsync(Guid id);
        Task<Usuario?> GetByEmailAsync(string email);
        Task<Usuario> CreateAsync(Usuario usuario);
        Task<Usuario?> UpdateAsync(Usuario usuario);
        Task<Usuario?> UpdateEmailAsync(Guid id, string email);
        Task<bool> UpdatePasswordAsync(Guid id, string newPassword);
        Task<bool> DeleteAsync(Guid id);
    }
}