using api.Application.Events;
using api.Domain;
using api.infra;
using MassTransit;

namespace api.Application.Consumers
{
    public class PedidoTrackingConsumer(DatabaseContext db, ILogger<PedidoTrackingConsumer> logger)
        : IConsumer<PedidoStatusAlteradoEvent>
    {
        public async Task Consume(ConsumeContext<PedidoStatusAlteradoEvent> context)
        {
            var evento = context.Message;

            var historico = new PedidoHistorico
            {
                Id = Guid.NewGuid(),
                PedidoId = evento.PedidoId,
                UsuarioId = evento.UsuarioId,
                EmpresaId = evento.EmpresaId,
                StatusAnterior = evento.StatusAnterior,
                StatusNovo = evento.StatusNovo,
                ValorTotal = evento.ValorTotal,
                OcorridoEm = evento.OcorridoEm
            };

            db.PedidoHistoricos.Add(historico);
            await db.SaveChangesAsync();

            logger.LogInformation(
                "Tracking pedido {PedidoId}: {StatusAnterior} → {StatusNovo} em {OcorridoEm:u}",
                evento.PedidoId,
                evento.StatusAnterior?.ToString() ?? "—",
                evento.StatusNovo,
                evento.OcorridoEm);
        }
    }
}
