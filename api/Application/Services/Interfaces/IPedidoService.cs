using api.Application.DTOs.Common;
using api.Application.DTOs.Pedido;
using api.Domain.Enums;

namespace api.Application.Services.Interfaces
{
    public interface IPedidoService
    {
        Task<PagedResult<PedidoDto>> GetAllPedidos(PedidoFiltroRequest filtro);
        Task<IEnumerable<PedidoDto>> GetPedidosByUsuarioId(Guid usuarioId);
        Task<PagedResult<PedidoDto>> GetPedidosByUsuarioId(Guid usuarioId, int page, int pageSize);
        Task<PedidoDto?> GetPedidoById(Guid id);
        Task<PedidoDto> CreatePedido(Guid usuarioId, CreatePedidoRequest request);
        Task<PedidoDto?> UpdatePedido(Guid pedidoId, UpdatePedidoRequest request);
        Task<PedidoDto?> UpdatePedidoStatus(Guid id, PedidoStatus newStatus);
        Task<PedidoDto?> UpdatePedidoContratacao(Guid id, PedidoTipoContratacaoEnum novaContratacao);
        Task<bool> DeleteAsync(Guid id);
        Task<IEnumerable<PedidoDto>> GetPedidosByPeriodo(DateTime dataInicio, DateTime dataFim);
        Task<PedidoDto?> CancelarPedido(Guid pedidoId);
        Task<PagedResult<PedidoDto>> GetPedidosByEmpresaId(Guid empresaId, int page, int pageSize);
    }
}
