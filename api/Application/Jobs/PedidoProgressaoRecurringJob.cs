using api.Application.DTOs.Pedido;
using api.Application.Services.Interfaces;
using api.Domain.Enums;
using Hangfire;

namespace api.Application.Jobs
{
    public class PedidoProgressaoRecurringJob(IPedidoService pedidoService, IBackgroundJobClient backgroundJobs, ILogger<PedidoProgressaoRecurringJob> logger)
    {
        public async Task Executar()
        {
            await EnfileirarProcessamento();
            await EnfileirarFinalizacao();
        }

        private async Task EnfileirarProcessamento()
        {
            var resultado = await pedidoService.GetAllPedidos(new PedidoFiltroRequest
            {
                Status = PedidoStatus.Criado,
                Page = 1,
                PageSize = 500
            });

            foreach (var pedido in resultado.Items)
            {
                backgroundJobs.Enqueue<PedidoProgressaoJob>(job => job.ExecutarProcessamento(pedido.Id));
                logger.LogInformation("PedidoProgressaoRecurring: enfileirado processamento do pedido {PedidoId}.", pedido.Id);
            }
        }

        private async Task EnfileirarFinalizacao()
        {
            var resultado = await pedidoService.GetAllPedidos(new PedidoFiltroRequest
            {
                Status = PedidoStatus.EmProcessamento,
                Page = 1,
                PageSize = 500
            });

            foreach (var pedido in resultado.Items)
            {
                backgroundJobs.Enqueue<PedidoProgressaoJob>(job => job.ExecutarFinalizacao(pedido.Id));
                logger.LogInformation("PedidoProgressaoRecurring: enfileirada finalização do pedido {PedidoId}.", pedido.Id);
            }
        }
    }
}
