using api.application.services;
using api.Application.DTOs.Carteira;
using api.Application.Services.Interfaces;
using api.Domain;
using api.Domain.Interfaces;

namespace api.Application.Services
{
    public class CarteiraService : ServiceBase<Carteira, CarteiraDto>, ICarteiraService
    {
        private readonly ICarteiraRepository _carteiraRepository;

        public CarteiraService(ICarteiraRepository repository) : base(repository)
        {
            _carteiraRepository = repository;
        }

        public async Task<CarteiraDto> UpdateCarteira(Guid id, UpdateCarteiraRequest request)
        {
            var carteira = await _repository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException($"Carteira {id} não encontrada");

            if (string.IsNullOrWhiteSpace(request.Cupom))
            {
                carteira.UpdateBalance(request.Saldo);
            }
            else
            {
                carteira.ApplyBonus(request.Saldo, request.Cupom);
            }

            var updated = await _repository.UpdateAsync(carteira);
            return ToDto(updated!);
        }


        public async Task<CarteiraDto> UpdateMyBalanceAsync(Guid usuarioId, UpdateCarteiraRequest request)
        {
            var carteira = await GetCarteiraEntityAsync(usuarioId);

            if (string.IsNullOrWhiteSpace(request.Cupom))
            {
                carteira.UpdateBalance(request.Saldo);
            }
            else
            {
                carteira.ApplyBonus(request.Saldo, request.Cupom);
            }

            var updated = await _repository.UpdateAsync(carteira);
            return ToDto(updated!);
        }

        public async Task<CarteiraDto> GetMyCarteiraAsync(Guid usuarioId)
        {
            var carteira = await GetCarteiraEntityAsync(usuarioId);
            return ToDto(carteira);
        }

        private async Task<Carteira> GetCarteiraEntityAsync(Guid usuarioId)
        {
            return await _carteiraRepository.GetCarteiraByUsuarioId(usuarioId)
                ?? throw new KeyNotFoundException($"Carteira para usuário {usuarioId} não encontrada");
        }


        protected override CarteiraDto ToDto(Carteira entity) => new()
        {
            Id = entity.Id,
            UsuarioId = entity.UsuarioId,
            UsuarioNome = entity.Usuario.Nome,
            UsuarioEmail = entity.Usuario.Email,
            Saldo = entity.Saldo,
            CriadoEm = entity.CriadoEm,
            AtualizadoEm = entity.AtualizadoEm
        };

    }
}