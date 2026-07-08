using api.Domain.Enums;

namespace api.Domain
{
    public class PedidoHistorico
    {
        public Guid Id { get; set; }
        public Guid PedidoId { get; set; }
        public Guid UsuarioId { get; set; }
        public Guid? EmpresaId { get; set; }
        public PedidoStatus? StatusAnterior { get; set; }
        public PedidoStatus StatusNovo { get; set; }
        public decimal ValorTotal { get; set; }
        public DateTime OcorridoEm { get; set; }
    }
}
