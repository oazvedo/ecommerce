using api.Application.DTOs.Carteira;
using api.Domain.Interfaces;

namespace api.Application.Jobs
{
    public class CarteiraReembolsoJob(ICarteiraRepository carteiraRepository, ILogger<CarteiraReembolsoJob> logger)
    {
        public async Task Executar(Guid usuarioId, double valor)
        {
            var carteira = await carteiraRepository.GetCarteiraByUsuarioId(usuarioId);

            if (carteira == null)
            {
                logger.LogWarning("CarteiraReembolso: carteira do usuário {UsuarioId} não encontrada.", usuarioId);
                return;
            }

            carteira.UpdateBalance(valor);
            await carteiraRepository.UpdateAsync(carteira);

            logger.LogInformation(
                "CarteiraReembolso: R$ {Valor:F2} estornado para carteira do usuário {UsuarioId}.",
                valor, usuarioId);
        }
    }
}
