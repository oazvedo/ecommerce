using api.Domain;
using api.Domain.Enums;
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
            // Padrao de um produto novo: bem fisico, sem restricao de contratacao, a vista.
            Assert.Equal(ProdutoTipoEnum.Fisico, produto.Tipo);
            Assert.Equal(ProdutoContratacaoPermitidaEnum.Ambas, produto.ContratacaoPermitida);
            Assert.Equal(1, produto.MaxParcelas);
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
            var categoriaId = Guid.NewGuid();

            produto.AtualizarProduto("Produto B", "Descricao B", true, "COD002", 199.99m, 5, false, null, categoriaId,
                ProdutoTipoEnum.Servico, ProdutoContratacaoPermitidaEnum.Anual, 12);

            Assert.Equal("Produto B", produto.Nome);
            Assert.Equal("Descricao B", produto.Descricao);
            Assert.Equal("COD002", produto.Codigo);
            Assert.Equal(199.99m, produto.Preco);
            Assert.Equal(5, produto.Estoque);
            Assert.Equal(categoriaId, produto.CategoriaId);
            Assert.Equal(ProdutoTipoEnum.Servico, produto.Tipo);
            Assert.Equal(ProdutoContratacaoPermitidaEnum.Anual, produto.ContratacaoPermitida);
            Assert.Equal(12, produto.MaxParcelas);
            Assert.NotNull(produto.AtualizadoEm);
        }

        [Theory]
        [InlineData(-1)]
        [InlineData(Produto.MaxParcelasLimite + 1)]
        public void AtualizarProduto_QuandoMaxParcelasForaDoLimite_DeveLancarInvalidOperationException(int maxParcelas)
        {
            var produto = new Produto("Produto A", "Descricao A", 99.99m, "COD001", Guid.NewGuid());

            Assert.Throws<InvalidOperationException>(() => produto.AtualizarProduto(
                "Produto A", "Descricao A", true, "COD001", 99.99m, 5, false, null, null,
                ProdutoTipoEnum.Fisico, ProdutoContratacaoPermitidaEnum.Ambas, maxParcelas));
        }

        [Theory]
        [InlineData(0)]
        [InlineData(1)]
        [InlineData(Produto.MaxParcelasLimite)]
        public void AtualizarProduto_QuandoMaxParcelasNoLimite_DeveAceitar(int maxParcelas)
        {
            var produto = new Produto("Produto A", "Descricao A", 99.99m, "COD001", Guid.NewGuid());

            produto.AtualizarProduto("Produto A", "Descricao A", true, "COD001", 99.99m, 5, false, null, null,
                ProdutoTipoEnum.Fisico, ProdutoContratacaoPermitidaEnum.Ambas, maxParcelas);

            Assert.Equal(maxParcelas, produto.MaxParcelas);
        }

        [Fact]
        public void AtualizarProduto_QuandoEnumInvalido_DeveLancarInvalidOperationException()
        {
            var produto = new Produto("Produto A", "Descricao A", 99.99m, "COD001", Guid.NewGuid());

            Assert.Throws<InvalidOperationException>(() => produto.AtualizarProduto(
                "Produto A", "Descricao A", true, "COD001", 99.99m, 5, false, null, null,
                (ProdutoTipoEnum)99, ProdutoContratacaoPermitidaEnum.Ambas, 1));

            Assert.Throws<InvalidOperationException>(() => produto.AtualizarProduto(
                "Produto A", "Descricao A", true, "COD001", 99.99m, 5, false, null, null,
                ProdutoTipoEnum.Fisico, (ProdutoContratacaoPermitidaEnum)99, 1));
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

            Assert.Throws<InvalidOperationException>(() => produto.AtualizarProduto(nome, descricao, true, codigo, preco, 5, false, null, null,
                ProdutoTipoEnum.Fisico, ProdutoContratacaoPermitidaEnum.Ambas, 1));
        }
    }
}
