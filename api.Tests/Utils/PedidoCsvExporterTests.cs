using System.Text;
using api.Application.DTOs.Pedido;
using api.Application.Utils;
using api.Domain.Enums;
using Xunit;

namespace api.Tests.Utils
{
    public class PedidoCsvExporterTests
    {
        [Fact]
        public void ToCsv_DeveIncluirCabecalhoELinhaPorPedido()
        {
            var pedidos = new List<PedidoDto>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    Status = PedidoStatus.Criado,
                    Contracacao = PedidoTipoContratacaoEnum.Mensal,
                    FormaPagamento = FormaPagamentoEnum.Carteira,
                    ValorTotal = 199.90m,
                    EmpresaNome = "Empresa X",
                    EmpresaCNPJ = "00.000.000/0001-00",
                    UsuarioNome = "João Silva",
                    CriadoEm = new DateTime(2026, 1, 15, 10, 0, 0, DateTimeKind.Utc)
                }
            };

            var csv = Encoding.UTF8.GetString(PedidoCsvExporter.ToCsv(pedidos));
            var lines = csv.Replace("﻿", string.Empty)
                .Split('\n', StringSplitOptions.RemoveEmptyEntries);

            Assert.Equal(2, lines.Length);
            Assert.StartsWith("Id,Status,Contratacao,FormaPagamento,ValorTotal,EmpresaNome,EmpresaCNPJ,UsuarioNome,CriadoEm", lines[0]);
            Assert.Contains("João Silva", lines[1]);
            Assert.Contains("199.9", lines[1]);
        }

        [Fact]
        public void ToCsv_QuandoCampoTemVirgula_DeveEscaparComAspas()
        {
            var pedidos = new List<PedidoDto>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    EmpresaNome = "Empresa, Filial",
                    UsuarioNome = "Cliente \"VIP\"",
                    CriadoEm = DateTime.UtcNow
                }
            };

            var csv = Encoding.UTF8.GetString(PedidoCsvExporter.ToCsv(pedidos));

            Assert.Contains("\"Empresa, Filial\"", csv);
            Assert.Contains("\"Cliente \"\"VIP\"\"\"", csv);
        }

        [Fact]
        public void ToCsv_QuandoListaVazia_DeveRetornarApenasCabecalho()
        {
            var csv = Encoding.UTF8.GetString(PedidoCsvExporter.ToCsv([]));
            var lines = csv.Replace("﻿", string.Empty)
                .Split('\n', StringSplitOptions.RemoveEmptyEntries);

            Assert.Single(lines);
        }
    }
}
