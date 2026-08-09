using System.Globalization;
using System.Text;
using api.Application.DTOs.Pedido;

namespace api.Application.Utils
{
    public static class PedidoCsvExporter
    {
        private static readonly string[] Header =
        [
            "Id", "Status", "Contratacao", "FormaPagamento", "ValorTotal",
            "EmpresaNome", "EmpresaCNPJ", "UsuarioNome", "CriadoEm"
        ];

        public static byte[] ToCsv(IEnumerable<PedidoDto> pedidos)
        {
            var builder = new StringBuilder();
            builder.AppendLine(string.Join(',', Header));

            foreach (var pedido in pedidos)
            {
                var fields = new[]
                {
                    pedido.Id.ToString(),
                    pedido.Status.ToString(),
                    pedido.Contracacao.ToString(),
                    pedido.FormaPagamento.ToString(),
                    pedido.ValorTotal.ToString(CultureInfo.InvariantCulture),
                    pedido.EmpresaNome ?? string.Empty,
                    pedido.EmpresaCNPJ ?? string.Empty,
                    pedido.UsuarioNome ?? string.Empty,
                    pedido.CriadoEm.ToString("O", CultureInfo.InvariantCulture)
                };

                builder.AppendLine(string.Join(',', fields.Select(Escape)));
            }

            // BOM UTF-8 para o Excel abrir acentos corretamente.
            return [.. Encoding.UTF8.GetPreamble(), .. Encoding.UTF8.GetBytes(builder.ToString())];
        }

        private static string Escape(string field)
        {
            if (field.Contains(',') || field.Contains('"') || field.Contains('\n') || field.Contains('\r'))
            {
                return $"\"{field.Replace("\"", "\"\"")}\"";
            }

            return field;
        }
    }
}
