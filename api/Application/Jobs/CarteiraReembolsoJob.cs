using api.Domain;
using api.Domain.Enums.CarteiraEnums;
using api.Domain.Interfaces;

namespace api.Application.Jobs
{
    public class CarteiraReembolsoJob(
        ICarteiraRepository carteiraRepository,
        ICarteiraTransacaoRepository transacaoRepository,
        ILogger<CarteiraReembolsoJob> logger)
    {
        public async Task Executar(Guid usuarioId, double valor, Guid? pedidoId = null)
        {
            var carteira = await carteiraRepository.GetCarteiraByUsuarioId(usuarioId);

            if (carteira == null)
            {
                logger.LogWarning("CarteiraReembolso: carteira do usuário {UsuarioId} não encontrada.", usuarioId);
                return;
            }

            carteira.UpdateBalance(valor);
            await carteiraRepository.UpdateAsync(carteira);

            var descricao = pedidoId.HasValue
                ? $"Reembolso — Pedido #{pedidoId.Value.ToString()[..8].ToUpper()}"
                : "Reembolso";
            await transacaoRepository.AddAsync(new CarteiraTransacao(
                carteira.Id, CarteiraTransacaoTipo.Reembolso, valor, descricao, pedidoId));

            logger.LogInformation(
                "CarteiraReembolso: R$ {Valor:F2} estornado para carteira do usuário {UsuarioId}.",
                valor, usuarioId);
        }
    }
}
