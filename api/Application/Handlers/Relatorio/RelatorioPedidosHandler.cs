using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using api.Application.DTOs.Pedido.Relatorio;
using api.Application.Services.Interfaces;

namespace api.Application.Handlers.Relatorio
{
    public class RelatorioPedidosHandler
    {
        private readonly IPedidoService _service;

        public RelatorioPedidosHandler(IPedidoService service)
        {
            _service = service;
        }

        public async Task <RelatorioPedidoResponse> Handle(RelatorioPedidoRequest request)
        {
            var pedidos = (await _service.GetPedidosByPeriodo(request.DataInicio, request.DataFim)).ToList();

            var total_valor_vendas = pedidos.Sum(p => p.ValorTotal);
            var total_vendas = pedidos.Count;
            var maior_venda = pedidos.Count > 0 ? pedidos.Max(p => p.ValorTotal) : 0;
            var cliente_mais_frequente = pedidos
                .GroupBy(p => p.UsuarioNome)
                .OrderByDescending(g => g.Count())
                .Select(g => g.Key)
                .FirstOrDefault();
            var tipoContratacao = pedidos
                .GroupBy(p => p.Contracacao)
                .OrderByDescending(g => g.Count())
                .Select(g => g.Key)
                .FirstOrDefault();
            var produto_mais_vendido = pedidos
                .SelectMany(p => p.Itens)
                .GroupBy(i => i.NomeProduto)
                .OrderByDescending(g => g.Sum(i => i.Quantidade))
                .Select(g => g.Key)
                .FirstOrDefault();
    
            return new RelatorioPedidoResponse
            {
                ProdutoMaisVendido = produto_mais_vendido ?? string.Empty,
                TotalVendas = total_vendas,
                TotalValorVendas = total_valor_vendas,
                MaiorValorDeVenda = maior_venda,
                ClienteMaisFrequente = cliente_mais_frequente ?? string.Empty,
                TipoDeContratacaoMaisUtilizado = tipoContratacao.ToString() ?? string.Empty
            };
        }
    }
}