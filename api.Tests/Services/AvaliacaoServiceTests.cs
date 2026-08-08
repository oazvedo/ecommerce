using api.Application.DTOs.Avaliacao;
using api.Application.Services;
using api.Domain;
using api.Domain.Interfaces;
using Moq;
using Xunit;

namespace api.Tests.Services
{
    public class AvaliacaoServiceTests
    {
        private readonly Mock<IAvaliacaoRepository> _repoMock;
        private readonly AvaliacaoService _service;

        public AvaliacaoServiceTests()
        {
            _repoMock = new Mock<IAvaliacaoRepository>();
            _service = new AvaliacaoService(_repoMock.Object);
        }

        [Fact]
        public async Task AvaliarAsync_ComAmbosProdutoIdEEmpresaId_DeveLancarInvalidOperationException()
        {
            var request = new CreateAvaliacaoRequest { ProdutoId = Guid.NewGuid(), EmpresaId = Guid.NewGuid(), Nota = 5 };

            await Assert.ThrowsAsync<InvalidOperationException>(
                () => _service.AvaliarAsync(Guid.NewGuid(), request));
        }

        [Fact]
        public async Task AvaliarAsync_SemProdutoIdNemEmpresaId_DeveLancarInvalidOperationException()
        {
            var request = new CreateAvaliacaoRequest { Nota = 5 };

            await Assert.ThrowsAsync<InvalidOperationException>(
                () => _service.AvaliarAsync(Guid.NewGuid(), request));
        }

        [Fact]
        public async Task AvaliarAsync_PrimeiraVez_DeveCriarNovaAvaliacao()
        {
            var usuarioId = Guid.NewGuid();
            var produtoId = Guid.NewGuid();
            var request = new CreateAvaliacaoRequest { ProdutoId = produtoId, Nota = 4, Comentario = "Bom produto" };

            _repoMock.Setup(r => r.GetByUsuarioEProdutoAsync(usuarioId, produtoId)).ReturnsAsync((Avaliacao?)null);
            _repoMock.Setup(r => r.AddAsync(It.IsAny<Avaliacao>())).ReturnsAsync((Avaliacao a) => a);

            var result = await _service.AvaliarAsync(usuarioId, request);

            Assert.Equal(produtoId, result.ProdutoId);
            Assert.Equal(4, result.Nota);
            _repoMock.Verify(r => r.AddAsync(It.IsAny<Avaliacao>()), Times.Once);
            _repoMock.Verify(r => r.UpdateAsync(It.IsAny<Avaliacao>()), Times.Never);
        }

        [Fact]
        public async Task AvaliarAsync_QuandoJaExiste_DeveAtualizarEmVezDeCriar()
        {
            var usuarioId = Guid.NewGuid();
            var produtoId = Guid.NewGuid();
            var existente = new Avaliacao(produtoId, null, usuarioId, 2, "Ruim");
            var request = new CreateAvaliacaoRequest { ProdutoId = produtoId, Nota = 5, Comentario = "Mudei de ideia" };

            _repoMock.Setup(r => r.GetByUsuarioEProdutoAsync(usuarioId, produtoId)).ReturnsAsync(existente);

            var result = await _service.AvaliarAsync(usuarioId, request);

            Assert.Equal(5, result.Nota);
            Assert.Equal("Mudei de ideia", result.Comentario);
            _repoMock.Verify(r => r.UpdateAsync(existente), Times.Once);
            _repoMock.Verify(r => r.AddAsync(It.IsAny<Avaliacao>()), Times.Never);
        }

        [Fact]
        public async Task GetResumoByProdutoAsync_DeveRetornarMediaETotal()
        {
            var produtoId = Guid.NewGuid();
            _repoMock.Setup(r => r.GetResumoByProdutoAsync(produtoId)).ReturnsAsync((4.5, 2));

            var result = await _service.GetResumoByProdutoAsync(produtoId);

            Assert.Equal(4.5, result.Media);
            Assert.Equal(2, result.Total);
        }
    }
}
