using api.Application.Services.Interfaces;
using api.Domain.Enums;

namespace api.Application.Jobs
{
    public class PedidoProgressaoJob(IPedidoService pedidoService, ILogger<PedidoProgressaoJob> logger)
    {
        public async Task ExecutarProcessamento(Guid pedidoId)
        {
            var pedido = await pedidoService.GetPedidoById(pedidoId);

            if (pedido == null)
            {
                logger.LogWarning("PedidoProgressao: pedido {PedidoId} não encontrado.", pedidoId);
                return;
            }

            if (pedido.Status != PedidoStatus.Criado)
            {
                logger.LogInformation(
                    "PedidoProgressao: pedido {PedidoId} já está em {Status}, pulando transição para EmProcessamento.",
                    pedidoId, pedido.Status);
                return;
            }

            await pedidoService.UpdatePedidoStatus(pedidoId, PedidoStatus.EmProcessamento);
            logger.LogInformation("PedidoProgressao: pedido {PedidoId} → EmProcessamento.", pedidoId);
        }

        public async Task ExecutarFinalizacao(Guid pedidoId)
        {
            var pedido = await pedidoService.GetPedidoById(pedidoId);

            if (pedido == null || pedido.Status != PedidoStatus.EmProcessamento)
            {
                logger.LogInformation(
                    "PedidoProgressao: pedido {PedidoId} não está em EmProcessamento (status: {Status}), pulando finalização.",
                    pedidoId, pedido?.Status);
                return;
            }

            await pedidoService.UpdatePedidoStatus(pedidoId, PedidoStatus.Finalizado);
            logger.LogInformation("PedidoProgressao: pedido {PedidoId} → Finalizado.", pedidoId);
        }
    }
}
