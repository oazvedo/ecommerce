using api.Domain.Enums;

namespace api.Application.Events
{
    public record PedidoStatusAlteradoEvent
    {
        public Guid PedidoId { get; init; }
        public Guid UsuarioId { get; init; }
        public Guid? EmpresaId { get; init; }
        public PedidoStatus? StatusAnterior { get; init; }
        public PedidoStatus StatusNovo { get; init; }
        public decimal ValorTotal { get; init; }
        public DateTime OcorridoEm { get; init; }
    }
}
