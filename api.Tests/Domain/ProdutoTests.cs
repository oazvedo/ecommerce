using api.Domain;
using Xunit;

namespace api.Tests.Domain
{
    public class ProdutoTests
    {
        [Fact]
        public void Constructor_DeveInicializarCorretamente()
        {
            var produto = new Produto("Produto A", "Descricao A", 99.99m, "COD001", Guid.NewGuid());

            Assert.NotEqual(Guid.Empty, produto.Id);
            Assert.Equal("Produto A", produto.Nome);
            Assert.Equal("Descricao A", produto.Descricao);
            Assert.Equal(99.99m, produto.Preco);
            Assert.Equal("COD001", produto.Codigo);
            Assert.Null(produto.AtualizadoEm);
        }

        [Theory]
        [InlineData("", "Desc", "COD", 10)]
        [InlineData("Nome", "", "COD", 10)]
        [InlineData("Nome", "Desc", "", 10)]
        [InlineData("Nome", "Desc", "COD", 0)]
        [InlineData("Nome", "Desc", "COD", -1)]
        public void Constructor_QuandoDadosInvalidos_DeveLancarInvalidOperationException(
            string nome, string descricao, string codigo, decimal preco)
        {
            Assert.Throws<InvalidOperationException>(() => new Produto(nome, descricao, preco, codigo, Guid.NewGuid()));
        }

        [Fact]
        public void AtualizarProduto_DeveAlterarCamposESetarAtualizadoEm()
        {
            var produto = new Produto("Produto A", "Descricao A", 99.99m, "COD001", Guid.NewGuid());

            produto.AtualizarProduto("Produto B", "Descricao B", true, "COD002", 199.99m, 5, false, null);

            Assert.Equal("Produto B", produto.Nome);
            Assert.Equal("Descricao B", produto.Descricao);
            Assert.Equal("COD002", produto.Codigo);
            Assert.Equal(199.99m, produto.Preco);
            Assert.Equal(5, produto.Estoque);
            Assert.NotNull(produto.AtualizadoEm);
        }

        [Theory]
        [InlineData("", "Desc", "COD", 10)]
        [InlineData("Nome", "", "COD", 10)]
        [InlineData("Nome", "Desc", "", 10)]
        [InlineData("Nome", "Desc", "COD", 0)]
        public void AtualizarProduto_QuandoDadosInvalidos_DeveLancarInvalidOperationException(
            string nome, string descricao, string codigo, decimal preco)
        {
            var produto = new Produto("Produto A", "Descricao A", 99.99m, "COD001", Guid.NewGuid());

            Assert.Throws<InvalidOperationException>(() => produto.AtualizarProduto(nome, descricao, true, codigo, preco, 5, false, null));
        }
    }
}
