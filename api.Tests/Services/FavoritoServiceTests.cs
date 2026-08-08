using api.Application.Services;
using api.Domain;
using api.Domain.Interfaces;
using Moq;
using Xunit;

namespace api.Tests.Services
{
    public class FavoritoServiceTests
    {
        private readonly Mock<IFavoritoRepository> _repoMock;
        private readonly Mock<IAvaliacaoRepository> _avaliacaoRepoMock;
        private readonly FavoritoService _service;

        public FavoritoServiceTests()
        {
            _repoMock = new Mock<IFavoritoRepository>();
            _avaliacaoRepoMock = new Mock<IAvaliacaoRepository>();
            _service = new FavoritoService(_repoMock.Object, _avaliacaoRepoMock.Object);
        }

        [Fact]
        public async Task AdicionarAsync_QuandoNaoExiste_DeveCriar()
        {
            var usuarioId = Guid.NewGuid();
            var produtoId = Guid.NewGuid();
            _repoMock.Setup(r => r.GetByUsuarioEProdutoAsync(usuarioId, produtoId)).ReturnsAsync((Favorito?)null);

            await _service.AdicionarAsync(usuarioId, produtoId);

            _repoMock.Verify(r => r.AddAsync(It.Is<Favorito>(f => f.UsuarioId == usuarioId && f.ProdutoId == produtoId)), Times.Once);
        }

        [Fact]
        public async Task AdicionarAsync_QuandoJaExiste_DeveSerIdempotente()
        {
            var usuarioId = Guid.NewGuid();
            var produtoId = Guid.NewGuid();
            _repoMock.Setup(r => r.GetByUsuarioEProdutoAsync(usuarioId, produtoId))
                .ReturnsAsync(new Favorito(usuarioId, produtoId));

            await _service.AdicionarAsync(usuarioId, produtoId);

            _repoMock.Verify(r => r.AddAsync(It.IsAny<Favorito>()), Times.Never);
        }

        [Fact]
        public async Task RemoverAsync_QuandoExiste_DeveRemover()
        {
            var usuarioId = Guid.NewGuid();
            var produtoId = Guid.NewGuid();
            var favorito = new Favorito(usuarioId, produtoId);
            _repoMock.Setup(r => r.GetByUsuarioEProdutoAsync(usuarioId, produtoId)).ReturnsAsync(favorito);

            await _service.RemoverAsync(usuarioId, produtoId);

            _repoMock.Verify(r => r.RemoveAsync(favorito), Times.Once);
        }

        [Fact]
        public async Task RemoverAsync_QuandoNaoExiste_NaoDeveLancar()
        {
            var usuarioId = Guid.NewGuid();
            var produtoId = Guid.NewGuid();
            _repoMock.Setup(r => r.GetByUsuarioEProdutoAsync(usuarioId, produtoId)).ReturnsAsync((Favorito?)null);

            await _service.RemoverAsync(usuarioId, produtoId);

            _repoMock.Verify(r => r.RemoveAsync(It.IsAny<Favorito>()), Times.Never);
        }

        [Fact]
        public async Task EstaFavoritadoAsync_QuandoExiste_DeveRetornarTrue()
        {
            var usuarioId = Guid.NewGuid();
            var produtoId = Guid.NewGuid();
            _repoMock.Setup(r => r.GetByUsuarioEProdutoAsync(usuarioId, produtoId))
                .ReturnsAsync(new Favorito(usuarioId, produtoId));

            var result = await _service.EstaFavoritadoAsync(usuarioId, produtoId);

            Assert.True(result);
        }

        [Fact]
        public async Task GetPagedAsync_DeveRetornarProdutosComResumoDeAvaliacao()
        {
            var usuarioId = Guid.NewGuid();
            var produto = new Produto("Produto A", "Desc", 10m, "COD001", Guid.NewGuid());
            _repoMock.Setup(r => r.GetPagedProdutosByUsuarioAsync(usuarioId, 1, 20))
                .ReturnsAsync((new List<Produto> { produto }, 1));
            _avaliacaoRepoMock.Setup(r => r.GetResumoByProdutosAsync(It.IsAny<IEnumerable<Guid>>()))
                .ReturnsAsync(new Dictionary<Guid, (double, int)> { [produto.Id] = (4.5, 3) });

            var result = await _service.GetPagedAsync(usuarioId, 1, 20);

            Assert.Equal(1, result.TotalCount);
            var dto = Assert.Single(result.Items);
            Assert.Equal(4.5, dto.NotaMedia);
            Assert.Equal(3, dto.TotalAvaliacoes);
        }
    }
}
