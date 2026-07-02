using api.domain;
using api.domain.interfaces;
using Microsoft.EntityFrameworkCore;

namespace api.infra.repository
{
    public class UsuarioRepository : IUsuarioRepository
    {
        private readonly DatabaseContext _context;

        public UsuarioRepository(DatabaseContext context)
        {
            _context = context;
        }

        public async Task<Usuario> CreateAsync(Usuario usuario)
        {
            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();
            return usuario;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario == null) return false;

            _context.Usuarios.Remove(usuario);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<Usuario>> GetAllAsync()
        {
            return await _context.Usuarios
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<(IEnumerable<Usuario> Items, int TotalCount)> GetPagedAsync(int page, int pageSize)
        {
            var query = _context.Usuarios
                .AsNoTracking()
                .OrderBy(u => u.Nome);

            var totalCount = await query.CountAsync();
            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }

        public async Task<Usuario?> GetByIdAsync(Guid id)
        {
            return await _context.Usuarios
                .Include(u => u.UsuarioPermissoes)
                .ThenInclude(up => up.Permissao)
                .FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task<Usuario?> GetByEmailAsync(string email)
        {
            return await _context.Usuarios
                .Include(u => u.UsuarioPermissoes)
                .ThenInclude(up => up.Permissao)
                .FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<Usuario?> UpdateAsync(Usuario usuario)
        {
            _context.Usuarios.Update(usuario);
            await _context.SaveChangesAsync();
            return usuario;
        }

        public async Task<Usuario?> UpdateEmailAsync(Guid id, string email)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario == null) return null;

            usuario.Email = email;
            usuario.AtualizadoEm = DateTime.UtcNow;

            _context.Usuarios.Update(usuario);
            await _context.SaveChangesAsync();
            return usuario;
        }

        public async Task<bool> UpdatePasswordAsync(Guid id, string newPassword)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario == null) return false;

            usuario.UpdatePassword(newPassword);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
