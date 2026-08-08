using api.Application.Services;
using api.Domain;
using api.domain.interfaces;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace api.Tests.Services
{
    public class AuditoriaServiceTests
    {
        private readonly Mock<IRepositoryBase<AuditoriaLog>> _repoMock;
        private readonly Mock<ILogger<AuditoriaService>> _loggerMock;
        private readonly AuditoriaService _service;

        public AuditoriaServiceTests()
        {
            _repoMock = new Mock<IRepositoryBase<AuditoriaLog>>();
            _loggerMock = new Mock<ILogger<AuditoriaService>>();
            _service = new AuditoriaService(_repoMock.Object, _loggerMock.Object);
        }

        [Fact]
        public async Task RegistrarAsync_DevePersistirLogComAutorAcaoEEntidade()
        {
            var autorId = Guid.NewGuid();
            var entidadeId = Guid.NewGuid();
            var empresaId = Guid.NewGuid();
            AuditoriaLog? capturado = null;
            _repoMock.Setup(r => r.CreateAsync(It.IsAny<AuditoriaLog>()))
                .Callback<AuditoriaLog>(log => capturado = log)
                .ReturnsAsync((AuditoriaLog log) => log);

            await _service.RegistrarAsync(autorId, "Admin Teste", "Excluir", "Produto", entidadeId, empresaId, "detalhe");

            Assert.NotNull(capturado);
            Assert.Equal(autorId, capturado!.AutorId);
            Assert.Equal("Admin Teste", capturado.AutorNome);
            Assert.Equal("Excluir", capturado.Acao);
            Assert.Equal("Produto", capturado.Entidade);
            Assert.Equal(entidadeId, capturado.EntidadeId);
            Assert.Equal(empresaId, capturado.EmpresaId);
            Assert.Equal("detalhe", capturado.Detalhes);
            Assert.NotEqual(Guid.Empty, capturado.Id);
        }

        [Fact]
        public async Task RegistrarAsync_QuandoRepositorioFalha_NaoDevePropagarExcecao()
        {
            _repoMock.Setup(r => r.CreateAsync(It.IsAny<AuditoriaLog>()))
                .ThrowsAsync(new InvalidOperationException("falha de banco"));

            var ex = await Record.ExceptionAsync(() =>
                _service.RegistrarAsync(Guid.NewGuid(), "Admin Teste", "Criar", "Empresa"));

            Assert.Null(ex);
        }

        [Fact]
        public async Task GetPagedAsync_DeveRetornarResultadoPaginado()
        {
            var logs = new List<AuditoriaLog>
            {
                new() { Id = Guid.NewGuid(), AutorId = Guid.NewGuid(), AutorNome = "A", Acao = "Criar", Entidade = "Produto", OcorridoEm = DateTime.UtcNow }
            };
            _repoMock.Setup(r => r.GetPagedAsync(1, 10)).ReturnsAsync((logs.AsEnumerable(), 1));

            var result = await _service.GetPagedAsync(1, 10);

            Assert.Equal(1, result.TotalCount);
            Assert.Single(result.Items);
        }
    }
}
