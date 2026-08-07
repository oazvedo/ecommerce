using api.application.services;
using api.Application.DTOs.AbacatePay;
using api.Application.DTOs.Carteira;
using api.Application.Services.Interfaces;
using api.Domain;
using api.Domain.Enums.CarteiraEnums;
using api.Domain.Interfaces;

namespace api.Application.Services
{
    public class CarteiraService : ServiceBase<Carteira, CarteiraDto>, ICarteiraService
    {
        private readonly ICarteiraRepository _carteiraRepository;
        private readonly ICarteiraTransacaoRepository _transacaoRepository;
        private readonly IAbacatePayService _abacatePayService;
        private readonly IPixRecargaRepository _pixRecargaRepository;

        public CarteiraService(
            ICarteiraRepository repository,
            ICarteiraTransacaoRepository transacaoRepository,
            IAbacatePayService abacatePayService,
            IPixRecargaRepository pixRecargaRepository) : base(repository)
        {
            _carteiraRepository = repository;
            _transacaoRepository = transacaoRepository;
            _abacatePayService = abacatePayService;
            _pixRecargaRepository = pixRecargaRepository;
        }

        public async Task<CarteiraDto> UpdateCarteira(Guid id, UpdateCarteiraRequest request)
        {
            var carteira = await _repository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException($"Carteira {id} não encontrada");

            var saldoAntes = carteira.Saldo;

            if (string.IsNullOrWhiteSpace(request.Cupom))
                carteira.UpdateBalance(request.Saldo);
            else
                carteira.ApplyBonus(request.Saldo, request.Cupom);

            var updated = await _repository.UpdateAsync(carteira);

            var delta = carteira.Saldo - saldoAntes;
            if (delta != 0)
            {
                var tipo = delta > 0 ? CarteiraTransacaoTipo.Recarga : CarteiraTransacaoTipo.Debito;
                var descricao = string.IsNullOrWhiteSpace(request.Cupom)
                    ? (delta > 0 ? "Recarga administrativa" : "Débito administrativo")
                    : $"Recarga com cupom {request.Cupom}";
                await _transacaoRepository.AddAsync(new CarteiraTransacao(carteira.Id, tipo, Math.Abs(delta), descricao));
            }

            return ToDto(updated!);
        }

        public async Task<CarteiraDto> UpdateMyBalanceAsync(Guid usuarioId, UpdateCarteiraRequest request)
        {
            var carteira = await GetCarteiraEntityAsync(usuarioId);
            var saldoAntes = carteira.Saldo;

            if (string.IsNullOrWhiteSpace(request.Cupom))
                carteira.UpdateBalance(request.Saldo);
            else
                carteira.ApplyBonus(request.Saldo, request.Cupom);

            var updated = await _repository.UpdateAsync(carteira);

            var delta = carteira.Saldo - saldoAntes;
            if (delta != 0)
            {
                var tipo = delta > 0 ? CarteiraTransacaoTipo.Recarga : CarteiraTransacaoTipo.Debito;
                var descricao = string.IsNullOrWhiteSpace(request.Cupom)
                    ? "Recarga"
                    : $"Recarga com cupom {request.Cupom}";
                await _transacaoRepository.AddAsync(new CarteiraTransacao(carteira.Id, tipo, Math.Abs(delta), descricao));
            }

            return ToDto(updated!);
        }

        public async Task<CarteiraDto> GetMyCarteiraAsync(Guid usuarioId)
        {
            var carteira = await GetCarteiraEntityAsync(usuarioId);
            return ToDto(carteira);
        }

        public async Task<IEnumerable<CarteiraTransacaoDto>> GetMinhasTransacoesAsync(Guid usuarioId)
        {
            var carteira = await GetCarteiraEntityAsync(usuarioId);
            var transacoes = await _transacaoRepository.GetByCarteiraIdAsync(carteira.Id);
            return transacoes.Select(t => new CarteiraTransacaoDto
            {
                Id = t.Id,
                Tipo = t.Tipo.ToString(),
                Valor = t.Valor,
                Descricao = t.Descricao,
                ReferenciaId = t.ReferenciaId,
                OcorridoEm = t.OcorridoEm
            });
        }

        private async Task<Carteira> GetCarteiraEntityAsync(Guid usuarioId)
        {
            return await _carteiraRepository.GetCarteiraByUsuarioId(usuarioId)
                ?? throw new KeyNotFoundException($"Carteira para usuário {usuarioId} não encontrada");
        }

        public async Task<PixRecargaResponse> IniciarRecargaPixAsync(Guid usuarioId, double valor)
        {
            if (valor < 1.00)
                throw new ArgumentException("Valor mínimo para recarga via PIX é R$ 1,00.");

            var carteira = await GetCarteiraEntityAsync(usuarioId);
            var descricao = $"Recarga via PIX - R$ {valor:F2}";

            var (abacatePayId, brCode, brCodeBase64) = await _abacatePayService.CriarPixAsync(valor, descricao);

            var pixRecarga = new PixRecarga(carteira.Id, abacatePayId, valor);
            await _pixRecargaRepository.AddAsync(pixRecarga);

            return new PixRecargaResponse
            {
                PixRecargaId = pixRecarga.Id,
                BrCode = brCode,
                BrCodeBase64 = brCodeBase64,
                Valor = valor,
                CriadoEm = pixRecarga.CriadoEm
            };
        }

        public async Task ConfirmarRecargaPixAsync(string abacatePayId)
        {
            var pixRecarga = await _pixRecargaRepository.GetByAbacatePayIdAsync(abacatePayId)
                ?? throw new KeyNotFoundException($"PixRecarga {abacatePayId} não encontrada.");

            if (pixRecarga.Status != Domain.Enums.PixRecargaEnums.PixRecargaStatus.Pendente)
                return;

            pixRecarga.Confirmar();
            await _pixRecargaRepository.UpdateAsync(pixRecarga);

            var carteira = await _carteiraRepository.GetByIdAsync(pixRecarga.CarteiraId)
                ?? throw new KeyNotFoundException($"Carteira {pixRecarga.CarteiraId} não encontrada.");

            carteira.UpdateBalance(pixRecarga.Valor);
            await _carteiraRepository.UpdateAsync(carteira);

            await _transacaoRepository.AddAsync(new CarteiraTransacao(
                carteira.Id,
                CarteiraTransacaoTipo.Recarga,
                pixRecarga.Valor,
                "Recarga via PIX (AbacatePay)",
                pixRecarga.Id));
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
