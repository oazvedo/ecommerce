
using api.application.services.interfaces;
using api.Application.DTOs.AbacatePay;
using api.Application.DTOs.Carteira;
using api.Domain;

namespace api.Application.Services.Interfaces
{
    public interface ICarteiraService : IServiceBase<Carteira, CarteiraDto>
    {
        Task <CarteiraDto> UpdateCarteira(Guid id, UpdateCarteiraRequest request);
        Task<CarteiraDto> GetMyCarteiraAsync(Guid usuarioId);
        Task <CarteiraDto> UpdateMyBalanceAsync(Guid usuarioId, UpdateCarteiraRequest request);
        Task<IEnumerable<CarteiraTransacaoDto>> GetMinhasTransacoesAsync(Guid usuarioId);
        Task<PixRecargaResponse> IniciarRecargaPixAsync(Guid usuarioId, double valor);
        Task ConfirmarRecargaPixAsync(string abacatePayId);
    }
}