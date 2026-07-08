using api.Application.DTOs.Pedido;
using api.Domain;

namespace api.Domain.Interfaces
{
    public interface IPedidoRepository
    {
        Task<IEnumerable<Pedido>> GetPedidosAsync();
        Task<(IEnumerable<Pedido> Items, int TotalCount)> GetPedidosPagedAsync(PedidoFiltroRequest filtro);
        Task<IEnumerable<Pedido>> GetPedidosByUsuarioIdAsync(Guid usuarioId);
        Task<Pedido?> GetPedidoById(Guid id);
        Task<Pedido> AdicionarPedido(Pedido pedido);
        Task<Pedido?> AtualizarPedido(Guid id, Pedido pedido, List<PedidoItem>? newItems = null);
        Task<bool> RemoverPedido(Guid id);
        Task<IEnumerable<Pedido>> GetPedidosByPeriodoAsync(DateTime dataInicio, DateTime dataFim);
        Task<IEnumerable<Pedido>> GetPedidosByEmpresaIdAsync(Guid empresaId);
        Task<IEnumerable<Pedido>> GetByEmpresaCNPJ(string cnpj);
    }
}
