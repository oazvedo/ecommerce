using api.Application.DTOs.Pedido;
using api.Application.Services.Interfaces;
using api.Domain.Enums;

namespace api.Application.Jobs
{
    public class PedidosPresosJob(IPedidoService pedidoService, ILogger<PedidosPresosJob> logger)
    {
        public async Task Executar()
        {
            var limite = DateTime.UtcNow.AddHours(-24);

            var resultado = await pedidoService.GetAllPedidos(new PedidoFiltroRequest
            {
                Page = 1,
                PageSize = 500,
                Status = PedidoStatus.Criado
            });

            var presos = resultado.Items.Where(p => p.CriadoEm < limite).ToList();

            if (presos.Count == 0)
            {
                logger.LogInformation("PedidosPresos: nenhum pedido preso encontrado.");
                return;
            }

            logger.LogWarning("PedidosPresos: {Count} pedido(s) em Criado há mais de 24h.", presos.Count);

            foreach (var pedido in presos)
            {
                logger.LogWarning(
                    "PedidosPresos: pedido {PedidoId} criado em {CriadoEm:u} ainda está em Criado.",
                    pedido.Id, pedido.CriadoEm);
            }
        }
    }
}
