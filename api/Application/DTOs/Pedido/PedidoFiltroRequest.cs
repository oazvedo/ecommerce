using api.Domain.Enums;

namespace api.Application.DTOs.Pedido
{
    public class PedidoFiltroRequest
    {
        public PedidoStatus? Status { get; set; }
        public PedidoTipoContratacaoEnum? Contratacao { get; set; }
        public Guid? UsuarioId { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}
