using api.Application.Services;
using api.Application.DTOs.Produto;
using api.Domain;
using api.Domain.Enums;
using api.Domain.Interfaces;
using Moq;
using Xunit;

namespace api.Tests.Services
{
    public class ProdutoServiceTests
    {
        private readonly Mock<IProdutoRepository> _repoMock;
        private readonly Mock<IAvaliacaoRepository> _avaliacaoRepoMock;
        private readonly ProdutoService _service;

        private static Produto CriarProduto() => new("Produto A", "Descricao A", 99.99m, "COD001", Guid.NewGuid());

        public ProdutoServiceTests()
        {
            _repoMock = new Mock<IProdutoRepository>();
            _avaliacaoRepoMock = new Mock<IAvaliacaoRepository>();
            _avaliacaoRepoMock.Setup(r => r.GetResumoByProdutoAsync(It.IsAny<Guid>())).ReturnsAsync((0, 0));
            _service = new ProdutoService(_repoMock.Object, _avaliacaoRepoMock.Object);
        }

        [Fact]
        public async Task GetAllAsync_DeveRetornarTodosComoDto()
        {
            var produtos = new List<Produto> { CriarProduto(), CriarProduto() };
            _repoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(produtos);

            var result = await _service.GetAllAsync();

            Assert.Equal(2, result.Count());
        }

        [Fact]
        public async Task GetPagedAsync_DeveRetornarResultadoPaginado()
        {
            var produtos = new List<Produto> { CriarProduto() };
            _repoMock.Setup(r => r.GetPagedAsync(1, 10)).ReturnsAsync((produtos.AsEnumerable(), 1));

            var result = await _service.GetPagedAsync(1, 10);

            Assert.Equal(1, result.TotalCount);
            Assert.Single(result.Items);
        }

        [Fact]
        public async Task GetByIdAsync_QuandoExiste_DeveRetornarDto()
        {
            var produto = CriarProduto();
            _repoMock.Setup(r => r.GetByIdAsync(produto.Id)).ReturnsAsync(produto);

            var result = await _service.GetByIdAsync(produto.Id);

            Assert.NotNull(result);
            Assert.Equal(produto.Id, result.Id);
            Assert.Equal(produto.Nome, result.Nome);
        }

        [Fact]
        public async Task GetByIdAsync_QuandoNaoExiste_DeveRetornarNull()
        {
            _repoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Produto?)null);

            var result = await _service.GetByIdAsync(Guid.NewGuid());

            Assert.Null(result);
        }

        [Fact]
        public async Task CreateAsync_DeveCriarERetornarDto()
        {
            var produto = CriarProduto();
            _repoMock.Setup(r => r.CreateAsync(produto)).ReturnsAsync(produto);

            var result = await _service.CreateAsync(produto);

            Assert.Equal(produto.Id, result.Id);
            Assert.Equal(produto.Nome, result.Nome);
            Assert.Equal(produto.Preco, result.Preco);
        }

        [Fact]
        public async Task UpdateAsync_QuandoExiste_DeveRetornarDto()
        {
            var produto = CriarProduto();
            _repoMock.Setup(r => r.UpdateAsync(produto)).ReturnsAsync(produto);

            var result = await _service.UpdateAsync(produto);

            Assert.NotNull(result);
            Assert.Equal(produto.Id, result!.Id);
        }

        [Fact]
        public async Task UpdateAsync_QuandoNaoExiste_DeveRetornarNull()
        {
            var produto = CriarProduto();
            _repoMock.Setup(r => r.UpdateAsync(produto)).ReturnsAsync((Produto?)null);

            var result = await _service.UpdateAsync(produto);

            Assert.Null(result);
        }

        [Fact]
        public async Task DeleteAsync_QuandoExiste_DeveRetornarTrue()
        {
            var id = Guid.NewGuid();
            _repoMock.Setup(r => r.DeleteAsync(id)).ReturnsAsync(true);

            var result = await _service.DeleteAsync(id);

            Assert.True(result);
            _repoMock.Verify(r => r.DeleteAsync(id), Times.Once);
        }

        [Fact]
        public async Task DeleteAsync_QuandoNaoExiste_DeveRetornarFalse()
        {
            _repoMock.Setup(r => r.DeleteAsync(It.IsAny<Guid>())).ReturnsAsync(false);

            var result = await _service.DeleteAsync(Guid.NewGuid());

            Assert.False(result);
        }

        [Fact]
        public async Task UpdateAsync_ComRequest_DeveAtualizarCategoria()
        {
            var produto = CriarProduto();
            var categoriaId = Guid.NewGuid();
            _repoMock.Setup(r => r.GetByIdAsync(produto.Id)).ReturnsAsync(produto);
            _repoMock.Setup(r => r.UpdateAsync(produto)).ReturnsAsync(produto);
            var request = new UpdateProdutoRequest
            {
                Nome = produto.Nome,
                Descricao = produto.Descricao,
                Codigo = produto.Codigo,
                Preco = produto.Preco,
                Status = true,
                CategoriaId = categoriaId
            };

            var result = await _service.UpdateAsync(produto.Id, request);

            Assert.NotNull(result);
            Assert.Equal(categoriaId, result!.CategoriaId);
            Assert.Equal(categoriaId, produto.CategoriaId);
        }

        [Fact]
        public async Task UpdateAsync_ComRequest_DeveAtualizarTipoERegrasDeContratacao()
        {
            var produto = CriarProduto();
            _repoMock.Setup(r => r.GetByIdAsync(produto.Id)).ReturnsAsync(produto);
            _repoMock.Setup(r => r.UpdateAsync(produto)).ReturnsAsync(produto);
            var request = new UpdateProdutoRequest
            {
                Nome = produto.Nome,
                Descricao = produto.Descricao,
                Codigo = produto.Codigo,
                Preco = produto.Preco,
                Status = true,
                Tipo = ProdutoTipoEnum.Servico,
                ContratacaoPermitida = ProdutoContratacaoPermitidaEnum.Mensal,
                MaxParcelas = 6
            };

            var result = await _service.UpdateAsync(produto.Id, request);

            Assert.NotNull(result);
            Assert.Equal(ProdutoTipoEnum.Servico, result!.Tipo);
            Assert.Equal(ProdutoContratacaoPermitidaEnum.Mensal, result.ContratacaoPermitida);
            Assert.Equal(6, result.MaxParcelas);
        }

        [Fact]
        public async Task UpdateAsync_ComMaxParcelasInvalido_DeveLancarInvalidOperationException()
        {
            var produto = CriarProduto();
            _repoMock.Setup(r => r.GetByIdAsync(produto.Id)).ReturnsAsync(produto);
            var request = new UpdateProdutoRequest
            {
                Nome = produto.Nome,
                Descricao = produto.Descricao,
                Codigo = produto.Codigo,
                Preco = produto.Preco,
                Status = true,
                MaxParcelas = Produto.MaxParcelasLimite + 1
            };

            await Assert.ThrowsAsync<InvalidOperationException>(() => _service.UpdateAsync(produto.Id, request));
        }
    }
}
