using api.domain;
using api.Domain;
using api.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace api.infra.repository
{
    public class EmpresaRepository : RepositoryBase<Empresa>, IEmpresaRepository
    {
        public EmpresaRepository(DatabaseContext context) : base(context) {}

        public async Task<(IEnumerable<Produto> Items, int TotalCount)> GetProdutosAsync(Guid empresaId, int page, int pageSize)
        {
            var query = _context.Produtos.AsNoTracking()
                .Where(p => p.EmpresaId == empresaId)
                .OrderBy(p => p.Nome);
            var total = await query.CountAsync();
            var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
            return (items, total);
        }

        public async Task<(IEnumerable<Usuario> Items, int TotalCount)> GetUsuariosAsync(Guid empresaId, int page, int pageSize)
        {
            var query = _context.Usuarios.AsNoTracking()
                .Where(u => u.EmpresaId == empresaId)
                .OrderBy(u => u.Nome);
            var total = await query.CountAsync();
            var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
            return (items, total);
        }

        public async Task<bool> AdicionarUsuarioAsync(Guid empresaId, Guid usuarioId)
        {
            var empresa = await _context.Empresas.FindAsync(empresaId);
            if (empresa == null) return false;

            var usuario = await _context.Usuarios.FindAsync(usuarioId);
            if (usuario == null) return false;

            usuario.EmpresaId = empresaId;
            usuario.AtualizadoEm = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}