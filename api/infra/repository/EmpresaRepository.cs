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

        public async Task<bool> DeleteComCascadeAsync(Guid empresaId)
        {
            var empresa = await _context.Empresas.FindAsync(empresaId);
            if (empresa == null) return false;

            var produtoIds = await _context.Produtos
                .Where(p => p.EmpresaId == empresaId)
                .Select(p => p.Id)
                .ToListAsync();

            // Remove pedido_itens referencing this empresa's produtos (Restrict FK: PedidoItem → Produto)
            if (produtoIds.Any())
            {
                var itensDoProduto = await _context.PedidoItens
                    .Where(i => produtoIds.Contains(i.ProdutoId))
                    .ToListAsync();
                if (itensDoProduto.Any())
                    _context.PedidoItens.RemoveRange(itensDoProduto);
            }

            // Delete pedidos of this empresa; EF cascades remaining PedidoItens via Cascade config
            var pedidos = await _context.Pedidos
                .Include(p => p.Itens)
                .Where(p => p.EmpresaId == empresaId)
                .ToListAsync();
            if (pedidos.Any())
                _context.Pedidos.RemoveRange(pedidos);

            // Now safe to delete produtos (no more PedidoItens referencing them)
            if (produtoIds.Any())
            {
                var produtos = await _context.Produtos.Where(p => p.EmpresaId == empresaId).ToListAsync();
                _context.Produtos.RemoveRange(produtos);
            }

            // Move usuarios to default empresa (Restrict FK: Usuario → Empresa)
            var usuarios = await _context.Usuarios.Where(u => u.EmpresaId == empresaId).ToListAsync();
            foreach (var u in usuarios)
                u.EmpresaId = EmpresaSeed.DefaultEmpresaId;

            await _context.SaveChangesAsync();

            _context.Empresas.Remove(empresa);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
