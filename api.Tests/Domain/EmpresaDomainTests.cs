using api.Domain;
using api.Domain.Enums;
using Xunit;

namespace api.Tests.Domain
{
    public class EmpresaDomainTests
    {
        [Fact]
        public void Constructor_DeveInicializarCorretamente()
        {
            var responsavelId = Guid.NewGuid();

            var empresa = new Empresa("Empresa Teste", "00.000.000/0001-00", "Responsavel", responsavelId, "(11) 0000-0000", EmpresaTipo.Parceira);

            Assert.NotEqual(Guid.Empty, empresa.Id);
            Assert.Equal("Empresa Teste", empresa.Nome);
            Assert.Equal("00.000.000/0001-00", empresa.Cnpj);
            Assert.Equal("Responsavel", empresa.Responsavel);
            Assert.Equal(responsavelId, empresa.ResponsavelId);
            Assert.Equal("(11) 0000-0000", empresa.Telefone);
            Assert.Equal(EmpresaTipo.Parceira, empresa.Tipo);
            Assert.True(empresa.Status);
            Assert.Null(empresa.AtualizadoEm);
        }

        [Fact]
        public void Constructor_StatusPadraoDeveSerAtivo()
        {
            var empresa = new Empresa("Empresa", "00.000.000/0001-00", "Resp", Guid.NewGuid(), "0000-0000", EmpresaTipo.Central);

            Assert.True(empresa.Status);
        }

        [Theory]
        [InlineData(EmpresaTipo.Central)]
        [InlineData(EmpresaTipo.Parceira)]
        [InlineData(EmpresaTipo.Filial)]
        public void Constructor_SuportaTodosTipos(EmpresaTipo tipo)
        {
            var empresa = new Empresa("Nome", "00.000.000/0001-00", "Resp", Guid.NewGuid(), "0000-0000", tipo);

            Assert.Equal(tipo, empresa.Tipo);
        }
    }
}
