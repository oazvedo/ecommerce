using api.Domain;
using api.Domain.Enums;
using Xunit;

namespace api.Tests.Domain
{
    public class PedidoTests
    {
        private static Pedido CriarPedido(Guid? usuarioId = null) =>
            new(Guid.NewGuid(), usuarioId ?? Guid.NewGuid(), new List<PedidoItem>(), PedidoTipoContratacaoEnum.Mensal);

        [Fact]
        public void Constructor_DeveInicializarCorretamente()
        {
            var empresaId = Guid.NewGuid();
            var usuarioId = Guid.NewGuid();

            var pedido = new Pedido(empresaId, usuarioId, new List<PedidoItem>(), PedidoTipoContratacaoEnum.Mensal);

            Assert.NotEqual(Guid.Empty, pedido.Id);
            Assert.Equal(empresaId, pedido.EmpresaId);
            Assert.Equal(usuarioId, pedido.UsuarioId);
            Assert.Equal(PedidoStatus.Criado, pedido.Status);
            Assert.Equal(PedidoTipoContratacaoEnum.Mensal, pedido.Contracacao);
            Assert.Empty(pedido.Itens);
            Assert.Null(pedido.AtualizadoEm);
        }

        [Fact]
        public void UpdateStatus_DeveAlterarStatusESetarAtualizadoEm()
        {
            var pedido = CriarPedido();

            pedido.UpdateStatus(PedidoStatus.EmProcessamento);

            Assert.Equal(PedidoStatus.EmProcessamento, pedido.Status);
            Assert.NotNull(pedido.AtualizadoEm);
        }

        [Theory]
        [InlineData(PedidoStatus.EmProcessamento)]
        [InlineData(PedidoStatus.Suporte)]
        [InlineData(PedidoStatus.Finalizado)]
        public void UpdateStatus_QuandoCancelado_DeveLancarInvalidOperationException(PedidoStatus novoStatus)
        {
            var pedido = CriarPedido();
            pedido.UpdateStatus(PedidoStatus.Cancelado);

            Assert.Throws<InvalidOperationException>(() => pedido.UpdateStatus(novoStatus));
        }

        [Fact]
        public void UpdateContratacao_DeveAlterarContratacaoESetarAtualizadoEm()
        {
            var pedido = CriarPedido();

            pedido.UpdateContratacao(PedidoTipoContratacaoEnum.Anual);

            Assert.Equal(PedidoTipoContratacaoEnum.Anual, pedido.Contracacao);
            Assert.NotNull(pedido.AtualizadoEm);
        }

        [Fact]
        public void UpdateContratacao_QuandoCancelado_DeveLancarInvalidOperationException()
        {
            var pedido = CriarPedido();
            pedido.UpdateStatus(PedidoStatus.Cancelado);

            Assert.Throws<InvalidOperationException>(() => pedido.UpdateContratacao(PedidoTipoContratacaoEnum.Anual));
        }

        [Fact]
        public void CancelarPedido_DeveDefinirStatusCanceladoESetarAtualizadoEm()
        {
            var pedido = CriarPedido();

            pedido.CancelarPedido();

            Assert.Equal(PedidoStatus.Cancelado, pedido.Status);
            Assert.NotNull(pedido.AtualizadoEm);
        }

        [Fact]
        public void CancelarPedido_QuandoJaCancelado_DeveLancarInvalidOperationException()
        {
            var pedido = CriarPedido();
            pedido.CancelarPedido();

            Assert.Throws<InvalidOperationException>(() => pedido.CancelarPedido());
        }

        [Fact]
        public void CancelarPedido_QuandoFinalizado_DeveLancarInvalidOperationException()
        {
            var pedido = CriarPedido();
            pedido.UpdateStatus(PedidoStatus.Finalizado);

            Assert.Throws<InvalidOperationException>(() => pedido.CancelarPedido());
        }

        [Fact]
        public void AdicionarItem_DeveAdicionarItemAosPedidos()
        {
            var pedido = CriarPedido();
            var produto = new Produto("Prod A", "Desc A", 100m, "COD001");

            pedido.AdicionarItem(produto, 2);

            Assert.Single(pedido.Itens);
            Assert.Equal(2, pedido.Itens[0].Quantidade);
            Assert.Equal(200m, pedido.ValorTotal);
        }

        [Fact]
        public void AdicionarItem_MesmoProduto_DeveAcumularQuantidade()
        {
            var pedido = CriarPedido();
            var produto = new Produto("Prod A", "Desc A", 50m, "COD001");

            pedido.AdicionarItem(produto, 1);
            pedido.AdicionarItem(produto, 3);

            Assert.Single(pedido.Itens);
            Assert.Equal(4, pedido.Itens[0].Quantidade);
        }

        [Fact]
        public void RemoverItem_DeveRemoverItemDosPedidos()
        {
            var pedido = CriarPedido();
            var produto = new Produto("Prod A", "Desc A", 100m, "COD001");
            pedido.AdicionarItem(produto, 1);

            pedido.RemoverItem(produto.Id);

            Assert.Empty(pedido.Itens);
        }

        [Fact]
        public void RemoverItem_ProdutoInexistente_DeveLancarInvalidOperationException()
        {
            var pedido = CriarPedido();

            Assert.Throws<InvalidOperationException>(() => pedido.RemoverItem(Guid.NewGuid()));
        }
    }
}
