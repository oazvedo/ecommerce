using System.ComponentModel;
using api.Application.DTOs.Pedido;
using api.Application.Services.Interfaces;
using api.Domain.Enums;
using ModelContextProtocol.Server;

namespace api.Mcp
{
    [McpServerToolType]
    public class PedidoMcpTools(IPedidoService pedidoService)
    {
        [McpServerTool, Description("Retorna o pedido mais recente criado no sistema")]
        public async Task<PedidoDto?> BuscarPedidoMaisRecente()
        {
            var filtro = new PedidoFiltroRequest { Page = 1, PageSize = 1 };
            var result = await pedidoService.GetAllPedidos(filtro);
            return result.Items.FirstOrDefault();
        }

        [McpServerTool, Description("Lista pedidos com filtros opcionais. Status possíveis: Cancelado, Criado, EmProcessamento, Suporte, Finalizado")]
        public async Task<object> BuscarPedidos(
            [Description("Página atual")] int page = 1,
            [Description("Quantidade de itens por página")] int pageSize = 10,
            [Description("Filtrar por status (Cancelado, Criado, EmProcessamento, Suporte, Finalizado)")] string? status = null,
            [Description("Filtrar por ID do usuário")] Guid? usuarioId = null)
        {
            var filtro = new PedidoFiltroRequest
            {
                Page = page,
                PageSize = pageSize,
                UsuarioId = usuarioId,
                Status = status != null && Enum.TryParse<PedidoStatus>(status, ignoreCase: true, out var s) ? s : null
            };
            return await pedidoService.GetAllPedidos(filtro);
        }

        [McpServerTool, Description("Busca um pedido específico pelo seu ID")]
        public async Task<PedidoDto?> BuscarPedidoPorId(
            [Description("ID (GUID) do pedido")] Guid id)
        {
            return await pedidoService.GetPedidoById(id);
        }

        [McpServerTool, Description("Busca pedidos criados em um intervalo de datas")]
        public async Task<IEnumerable<PedidoDto>> BuscarPedidosPorPeriodo(
            [Description("Data de início (formato: yyyy-MM-dd)")] DateTime dataInicio,
            [Description("Data de fim (formato: yyyy-MM-dd)")] DateTime dataFim)
        {
            return await pedidoService.GetPedidosByPeriodo(dataInicio, dataFim);
        }
    }
}
