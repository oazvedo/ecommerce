using api.Domain;
using Xunit;

namespace api.Tests.Domain
{
    public class CarteiraDomainTests
    {
        [Fact]
        public void Constructor_DeveInicializarCorretamente()
        {
            var usuarioId = Guid.NewGuid();

            var carteira = new Carteira(usuarioId);

            Assert.NotEqual(Guid.Empty, carteira.Id);
            Assert.Equal(usuarioId, carteira.UsuarioId);
            Assert.Equal(0, carteira.Saldo);
            Assert.Null(carteira.AtualizadoEm);
        }

        [Fact]
        public void UpdateBalance_DeveAdicionarAoSaldo()
        {
            var carteira = new Carteira(Guid.NewGuid());

            carteira.UpdateBalance(100);

            Assert.Equal(100, carteira.Saldo);
            Assert.NotNull(carteira.AtualizadoEm);
        }

        [Fact]
        public void UpdateBalance_DeveAcumularSaldo()
        {
            var carteira = new Carteira(Guid.NewGuid());
            carteira.UpdateBalance(100);
            carteira.UpdateBalance(50);

            Assert.Equal(150, carteira.Saldo);
        }

        [Theory]
        [InlineData("BONUS10", 100, 110)]
        [InlineData("BONUS20", 100, 120)]
        [InlineData("BONUS35", 100, 135)]
        public void ApplyBonus_DeveTerBonusCorreto(string cupom, double saldo, double esperado)
        {
            var carteira = new Carteira(Guid.NewGuid());

            carteira.ApplyBonus(saldo, cupom);

            Assert.Equal(esperado, carteira.Saldo);
            Assert.NotNull(carteira.AtualizadoEm);
        }

        [Fact]
        public void ApplyBonus_ComCupomInvalido_NaoAlteraSaldo()
        {
            var carteira = new Carteira(Guid.NewGuid());

            carteira.ApplyBonus(100, "INVALIDO");

            Assert.Equal(0, carteira.Saldo);
        }
    }
}
