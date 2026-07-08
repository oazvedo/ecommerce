using api.Application.DTOs.Pedido;
using api.Domain;
using api.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace api.infra.repository
{
    public class PedidoRepository : IPedidoRepository
    {
        private readonly DatabaseContext _context;

        public PedidoRepository(DatabaseContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Pedido>> GetPedidosAsync()
        {
            return await _context.Pedidos
                .Include(p => p.Empresa)
                .Include(p => p.Usuario)
                .Include(p => p.Itens).ThenInclude(i => i.Produto)
                .ToListAsync();
        }

        public async Task<(IEnumerable<Pedido> Items, int TotalCount)> GetPedidosPagedAsync(PedidoFiltroRequest filtro)
        {
            var query = _context.Pedidos
                .AsNoTracking()
                .Include(p => p.Empresa)
                .Include(p => p.Usuario)
                .Include(p => p.Itens).ThenInclude(i => i.Produto)
                .AsQueryable();

            if (filtro.Status.HasValue)
                query = query.Where(p => p.Status == filtro.Status.Value);

            if (filtro.Contratacao.HasValue)
                query = query.Where(p => p.Contracacao == filtro.Contratacao.Value);

            if (filtro.UsuarioId.HasValue)
                query = query.Where(p => p.UsuarioId == filtro.UsuarioId.Value);

            query = query.OrderByDescending(p => p.CriadoEm);

            var totalCount = await query.CountAsync();
            var items = await query
                .Skip((filtro.Page - 1) * filtro.PageSize)
                .Take(filtro.PageSize)
                .ToListAsync();

            return (items, totalCount);
        }

        public async Task<IEnumerable<Pedido>> GetPedidosByUsuarioIdAsync(Guid usuarioId)
        {
            return await _context.Pedidos
                .Include(p => p.Empresa)
                .Include(p => p.Usuario)
                .Include(p => p.Itens).ThenInclude(i => i.Produto)
                .Where(p => p.UsuarioId == usuarioId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Pedido>> GetPedidosByPeriodoAsync(DateTime dataInicio, DateTime dataFim)
        {
            return await _context.Pedidos
                .Include(p => p.Empresa)
                .Include(p => p.Usuario)
                .Include(p => p.Itens).ThenInclude(i => i.Produto)
                .Where(p => p.CriadoEm >= dataInicio && p.CriadoEm <= dataFim)
                .ToListAsync();
        }

        public async Task<IEnumerable<Pedido>> GetPedidosByEmpresaIdAsync(Guid empresaId)
        {
            return await _context.Pedidos
                .Include(p => p.Empresa)
                .Include(p => p.Usuario)
                .Include(p => p.Itens).ThenInclude(i => i.Produto)
                .Where(p => p.EmpresaId == empresaId)
                .ToListAsync();
        }

        public async Task<Pedido?> GetPedidoById(Guid id)
        {
            return await _context.Pedidos
                .Include(p => p.Empresa)
                .Include(p => p.Usuario)
                .Include(p => p.Itens).ThenInclude(i => i.Produto)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<Pedido> AdicionarPedido(Pedido pedido)
        {
            _context.Pedidos.Add(pedido);
            await _context.SaveChangesAsync();
            await _context.Entry(pedido).Collection(p => p.Itens).LoadAsync();
            return pedido;
        }

        public async Task<Pedido?> AtualizarPedido(Guid id, Pedido pedido, List<PedidoItem>? newItems = null)
        {
            if (newItems != null)
            {
                await _context.PedidoItens.Where(i => i.PedidoId == id).ExecuteDeleteAsync();
                _context.PedidoItens.AddRange(newItems);
            }

            await _context.SaveChangesAsync();
            return await GetPedidoById(id);
        }

        public async Task<bool> RemoverPedido(Guid id)
        {
            var pedido = await _context.Pedidos.FindAsync(id);
            if (pedido == null) return false;

            _context.Pedidos.Remove(pedido);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
