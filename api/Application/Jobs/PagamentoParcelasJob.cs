using api.Domain.Enums;
using api.Domain.Interfaces;

namespace api.Application.Jobs
{
    public class PagamentoParcelasJob(
        ICarteiraRepository carteiraRepository,
        IPedidoRepository pedidoRepository,
        ILogger<PagamentoParcelasJob> logger)
    {
        public async Task Executar(Guid pedidoId, Guid usuarioId, decimal valorParcela, int numeroParcela, int totalParcelas)
        {
            var pedido = await pedidoRepository.GetPedidoById(pedidoId);
            if (pedido == null || pedido.Status == PedidoStatus.Cancelado)
            {
                logger.LogInformation(
                    "PagamentoParcela: parcela {n}/{total} do pedido {PedidoId} ignorada — pedido cancelado ou não encontrado.",
                    numeroParcela, totalParcelas, pedidoId);
                return;
            }

            var carteira = await carteiraRepository.GetCarteiraByUsuarioId(usuarioId);
            if (carteira == null)
            {
                logger.LogWarning(
                    "PagamentoParcela: carteira do usuário {UsuarioId} não encontrada para parcela {n}/{total} do pedido {PedidoId}.",
                    usuarioId, numeroParcela, totalParcelas, pedidoId);
                return;
            }

            carteira.UpdateBalance(-(double)valorParcela);
            await carteiraRepository.UpdateAsync(carteira);

            logger.LogInformation(
                "PagamentoParcela: parcela {n}/{total} de R$ {Valor:F2} debitada da carteira do usuário {UsuarioId} (pedido {PedidoId}).",
                numeroParcela, totalParcelas, valorParcela, usuarioId, pedidoId);
        }
    }
}
