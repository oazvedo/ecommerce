using api.Application.DTOs.Carteira;
using api.Application.Services;
using api.domain;
using api.Domain;
using api.Domain.Interfaces;
using Moq;
using Xunit;

namespace api.Tests.Services
{
    public class CarteiraServiceTests
    {
        private readonly Mock<ICarteiraRepository> _repoMock;
        private readonly CarteiraService _service;

        public CarteiraServiceTests()
        {
            _repoMock = new Mock<ICarteiraRepository>();
            _service = new CarteiraService(_repoMock.Object);
        }

        private static Carteira CriarCarteira(Guid? usuarioId = null)
        {
            var id = usuarioId ?? Guid.NewGuid();
            var carteira = new Carteira(id);
            carteira.Usuario = new Usuario { Id = id, Nome = "Usuario Teste", Email = "teste@email.com" };
            return carteira;
        }

        [Fact]
        public async Task GetMyCarteiraAsync_QuandoExiste_DeveRetornarDto()
        {
            var usuarioId = Guid.NewGuid();
            var carteira = CriarCarteira(usuarioId);
            _repoMock.Setup(r => r.GetCarteiraByUsuarioId(usuarioId)).ReturnsAsync(carteira);

            var result = await _service.GetMyCarteiraAsync(usuarioId);

            Assert.Equal(carteira.Id, result.Id);
            Assert.Equal(usuarioId, result.UsuarioId);
            Assert.Equal("Usuario Teste", result.UsuarioNome);
        }

        [Fact]
        public async Task GetMyCarteiraAsync_QuandoNaoExiste_DeveLancarKeyNotFoundException()
        {
            _repoMock.Setup(r => r.GetCarteiraByUsuarioId(It.IsAny<Guid>())).ReturnsAsync((Carteira?)null);

            await Assert.ThrowsAsync<KeyNotFoundException>(
                () => _service.GetMyCarteiraAsync(Guid.NewGuid()));
        }

        [Fact]
        public async Task UpdateCarteira_SemCupom_DeveAtualizarSaldo()
        {
            var carteira = CriarCarteira();
            var request = new UpdateCarteiraRequest { Saldo = 100 };
            _repoMock.Setup(r => r.GetByIdAsync(carteira.Id)).ReturnsAsync(carteira);
            _repoMock.Setup(r => r.UpdateAsync(carteira)).ReturnsAsync(carteira);

            var result = await _service.UpdateCarteira(carteira.Id, request);

            Assert.Equal(100, result.Saldo);
        }

        [Theory]
        [InlineData("BONUS10", 100, 110)]
        [InlineData("BONUS20", 100, 120)]
        [InlineData("BONUS35", 100, 135)]
        public async Task UpdateCarteira_ComCupom_DeveAplicarBonusCorreto(string cupom, double saldo, double esperado)
        {
            var carteira = CriarCarteira();
            var request = new UpdateCarteiraRequest { Saldo = saldo, Cupom = cupom };
            _repoMock.Setup(r => r.GetByIdAsync(carteira.Id)).ReturnsAsync(carteira);
            _repoMock.Setup(r => r.UpdateAsync(carteira)).ReturnsAsync(carteira);

            var result = await _service.UpdateCarteira(carteira.Id, request);

            Assert.Equal(esperado, result.Saldo);
        }

        [Fact]
        public async Task UpdateCarteira_QuandoNaoExiste_DeveLancarKeyNotFoundException()
        {
            _repoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Carteira?)null);

            await Assert.ThrowsAsync<KeyNotFoundException>(
                () => _service.UpdateCarteira(Guid.NewGuid(), new UpdateCarteiraRequest { Saldo = 50 }));
        }
    }
}
