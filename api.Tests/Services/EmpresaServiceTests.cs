using api.Application.Services;
using api.Application.DTOs.Empresa;
using api.Domain;
using api.Domain.Enums;
using api.Domain.Interfaces;
using Moq;
using Xunit;

namespace api.Tests.Services
{
    public class EmpresaServiceTests
    {
        private readonly Mock<IEmpresaRepository> _repoMock;
        private readonly EmpresaService _service;

        private static Empresa CriarEmpresa() =>
            new("Empresa A", "00.000.000/0001-00", "Responsavel", Guid.NewGuid(), "(11) 0000-0000", EmpresaTipo.Parceira);

        public EmpresaServiceTests()
        {
            _repoMock = new Mock<IEmpresaRepository>();
            _service = new EmpresaService(_repoMock.Object);
        }

        [Fact]
        public async Task GetAllAsync_DeveRetornarTodosComoDto()
        {
            var empresas = new List<Empresa> { CriarEmpresa(), CriarEmpresa() };
            _repoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(empresas);

            var result = await _service.GetAllAsync();

            Assert.Equal(2, result.Count());
        }

        [Fact]
        public async Task GetPagedAsync_DeveRetornarResultadoPaginado()
        {
            var empresas = new List<Empresa> { CriarEmpresa() };
            _repoMock.Setup(r => r.GetPagedAsync(1, 10)).ReturnsAsync((empresas.AsEnumerable(), 1));

            var result = await _service.GetPagedAsync(1, 10);

            Assert.Equal(1, result.TotalCount);
            Assert.Single(result.Items);
        }

        [Fact]
        public async Task GetByIdAsync_QuandoExiste_DeveRetornarDto()
        {
            var empresa = CriarEmpresa();
            _repoMock.Setup(r => r.GetByIdAsync(empresa.Id)).ReturnsAsync(empresa);

            var result = await _service.GetByIdAsync(empresa.Id);

            Assert.NotNull(result);
            Assert.Equal(empresa.Id, result.Id);
            Assert.Equal(empresa.Nome, result.Nome);
        }

        [Fact]
        public async Task GetByIdAsync_QuandoNaoExiste_DeveRetornarNull()
        {
            _repoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Empresa?)null);

            var result = await _service.GetByIdAsync(Guid.NewGuid());

            Assert.Null(result);
        }

        [Fact]
        public async Task CreateAsync_DeveCriarERetornarDto()
        {
            var empresa = CriarEmpresa();
            _repoMock.Setup(r => r.CreateAsync(empresa)).ReturnsAsync(empresa);

            var result = await _service.CreateAsync(empresa);

            Assert.Equal(empresa.Id, result.Id);
            Assert.Equal(empresa.Nome, result.Nome);
            Assert.Equal(empresa.Cnpj, result.Cnpj);
        }

        [Fact]
        public async Task UpdateAsync_QuandoExiste_DeveRetornarDto()
        {
            var empresa = CriarEmpresa();
            _repoMock.Setup(r => r.UpdateAsync(empresa)).ReturnsAsync(empresa);

            var result = await _service.UpdateAsync(empresa);

            Assert.NotNull(result);
            Assert.Equal(empresa.Id, result!.Id);
        }

        [Fact]
        public async Task UpdateAsync_QuandoNaoExiste_DeveRetornarNull()
        {
            var empresa = CriarEmpresa();
            _repoMock.Setup(r => r.UpdateAsync(empresa)).ReturnsAsync((Empresa?)null);

            var result = await _service.UpdateAsync(empresa);

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
    }
}
