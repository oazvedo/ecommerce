using api.Application.DTOs.Common;
using api.Application.DTOs.Pedido;
using api.Application.Services;
using api.domain.interfaces;
using api.Domain;
using api.Domain.Enums;
using api.Domain.Interfaces;
using Moq;
using Xunit;

namespace api.Tests.Services
{
    public class PedidoServiceTests
    {
        private readonly Mock<IPedidoRepository> _repoMock;
        private readonly Mock<IRepositoryBase<Produto>> _produtoRepoMock;
        private readonly Mock<ICarteiraRepository> _carteiraRepoMock;
        private readonly PedidoService _service;

        private static Pedido CriarPedido(Guid? usuarioId = null) =>
            new(Guid.NewGuid(), usuarioId ?? Guid.NewGuid(), new List<PedidoItem>(), PedidoTipoContratacaoEnum.Mensal);

        public PedidoServiceTests()
        {
            _repoMock = new Mock<IPedidoRepository>();
            _produtoRepoMock = new Mock<IRepositoryBase<Produto>>();
            _carteiraRepoMock = new Mock<ICarteiraRepository>();
            _service = new PedidoService(_repoMock.Object, _produtoRepoMock.Object, _carteiraRepoMock.Object);
        }

        [Fact]
        public async Task GetAllPedidos_DeveRetornarResultadoPaginado()
        {
            var filtro = new PedidoFiltroRequest { Page = 1, PageSize = 10 };
            var pedidos = new List<Pedido> { CriarPedido(), CriarPedido() };
            _repoMock.Setup(r => r.GetPedidosPagedAsync(filtro)).ReturnsAsync((pedidos.AsEnumerable(), 2));

            var result = await _service.GetAllPedidos(filtro);

            Assert.Equal(1, result.Page);
            Assert.Equal(10, result.PageSize);
            Assert.Equal(2, result.TotalCount);
            Assert.Equal(2, result.Items.Count());
        }

        [Fact]
        public async Task GetPedidosByUsuarioId_DeveRetornarApenasDoUsuario()
        {
            var usuarioId = Guid.NewGuid();
            var pedidos = new List<Pedido> { CriarPedido(usuarioId) };
            _repoMock.Setup(r => r.GetPedidosByUsuarioIdAsync(usuarioId)).ReturnsAsync(pedidos);

            var result = await _service.GetPedidosByUsuarioId(usuarioId);

            Assert.Single(result);
        }

        [Fact]
        public async Task GetPedidosByUsuarioId_Paginado_DeveRetornarPaginado()
        {
            var usuarioId = Guid.NewGuid();
            var pedidos = new List<Pedido>
            {
                CriarPedido(usuarioId),
                CriarPedido(usuarioId),
                CriarPedido(usuarioId)
            };
            _repoMock.Setup(r => r.GetPedidosByUsuarioIdAsync(usuarioId)).ReturnsAsync(pedidos);

            var result = await _service.GetPedidosByUsuarioId(usuarioId, 1, 2);

            Assert.Equal(3, result.TotalCount);
            Assert.Equal(2, result.Items.Count());
        }

        [Fact]
        public async Task GetPedidoById_QuandoExiste_DeveRetornarDto()
        {
            var pedido = CriarPedido();
            _repoMock.Setup(r => r.GetPedidoById(pedido.Id)).ReturnsAsync(pedido);

            var result = await _service.GetPedidoById(pedido.Id);

            Assert.NotNull(result);
            Assert.Equal(pedido.Id, result.Id);
        }

        [Fact]
        public async Task GetPedidoById_QuandoNaoExiste_DeveRetornarNull()
        {
            _repoMock.Setup(r => r.GetPedidoById(It.IsAny<Guid>())).ReturnsAsync((Pedido?)null);

            var result = await _service.GetPedidoById(Guid.NewGuid());

            Assert.Null(result);
        }

        [Fact]
        public async Task CreatePedido_ComSaldoSuficiente_DeveCriarERetornarDto()
        {
            var usuarioId = Guid.NewGuid();
            var produto = new Produto("Produto A", "Desc A", 50m, "COD001");
            var carteira = new Carteira(usuarioId);
            carteira.UpdateBalance(200);

            var request = new CreatePedidoRequest
            {
                EmpresaId = Guid.NewGuid(),
                contratacao = PedidoTipoContratacaoEnum.Anual,
                itens = new List<CreatePedidoItemRequest>
                {
                    new() { produtoId = produto.Id, quantidade = 2 }
                }
            };

            _produtoRepoMock.Setup(r => r.GetByIdAsync(produto.Id)).ReturnsAsync(produto);
            _carteiraRepoMock.Setup(r => r.GetCarteiraByUsuarioId(usuarioId)).ReturnsAsync(carteira);

            var result = await _service.CreatePedido(usuarioId, request);

            Assert.Equal(usuarioId, result.UsuarioId);
            Assert.Equal(PedidoStatus.Criado, result.Status);
            Assert.Equal(PedidoTipoContratacaoEnum.Anual, result.Contracacao);
            Assert.Single(result.Itens);
        }

        [Fact]
        public async Task CreatePedido_ComSaldoInsuficiente_DeveLancarKeyNotFoundException()
        {
            var usuarioId = Guid.NewGuid();
            var produto = new Produto("Produto A", "Desc A", 50m, "COD001");
            var carteira = new Carteira(usuarioId); // saldo = 0

            var request = new CreatePedidoRequest
            {
                EmpresaId = Guid.NewGuid(),
                contratacao = PedidoTipoContratacaoEnum.Mensal,
                itens = new List<CreatePedidoItemRequest>
                {
                    new() { produtoId = produto.Id, quantidade = 1 }
                }
            };

            _produtoRepoMock.Setup(r => r.GetByIdAsync(produto.Id)).ReturnsAsync(produto);
            _carteiraRepoMock.Setup(r => r.GetCarteiraByUsuarioId(usuarioId)).ReturnsAsync(carteira);

            await Assert.ThrowsAsync<KeyNotFoundException>(
                () => _service.CreatePedido(usuarioId, request));
        }

        [Fact]
        public async Task CreatePedido_ProdutoNaoEncontrado_DeveLancarKeyNotFoundException()
        {
            var usuarioId = Guid.NewGuid();
            var produtoId = Guid.NewGuid();

            var request = new CreatePedidoRequest
            {
                EmpresaId = Guid.NewGuid(),
                contratacao = PedidoTipoContratacaoEnum.Mensal,
                itens = new List<CreatePedidoItemRequest>
                {
                    new() { produtoId = produtoId, quantidade = 1 }
                }
            };

            _produtoRepoMock.Setup(r => r.GetByIdAsync(produtoId)).ReturnsAsync((Produto?)null);

            await Assert.ThrowsAsync<KeyNotFoundException>(
                () => _service.CreatePedido(usuarioId, request));
        }

        [Fact]
        public async Task UpdatePedidoStatus_QuandoPedidoNaoExiste_DeveRetornarNull()
        {
            _repoMock.Setup(r => r.GetPedidoById(It.IsAny<Guid>())).ReturnsAsync((Pedido?)null);

            var result = await _service.UpdatePedidoStatus(Guid.NewGuid(), PedidoStatus.Finalizado);

            Assert.Null(result);
            _repoMock.Verify(r => r.AtualizarPedido(It.IsAny<Guid>(), It.IsAny<Pedido>(), null), Times.Never);
        }

        [Fact]
        public async Task UpdatePedidoStatus_QuandoPedidoExiste_DeveAtualizarERetornarDto()
        {
            var pedido = CriarPedido();
            _repoMock.Setup(r => r.GetPedidoById(pedido.Id)).ReturnsAsync(pedido);
            _repoMock.Setup(r => r.AtualizarPedido(pedido.Id, It.IsAny<Pedido>(), null)).ReturnsAsync(pedido);

            var result = await _service.UpdatePedidoStatus(pedido.Id, PedidoStatus.EmProcessamento);

            Assert.NotNull(result);
            _repoMock.Verify(r => r.AtualizarPedido(pedido.Id, It.IsAny<Pedido>(), null), Times.Once);
        }

        [Fact]
        public async Task UpdatePedidoStatus_QuandoCancelado_DevePropagrarInvalidOperationException()
        {
            var pedido = CriarPedido();
            pedido.UpdateStatus(PedidoStatus.Cancelado);
            _repoMock.Setup(r => r.GetPedidoById(pedido.Id)).ReturnsAsync(pedido);

            await Assert.ThrowsAsync<InvalidOperationException>(
                () => _service.UpdatePedidoStatus(pedido.Id, PedidoStatus.EmProcessamento));
        }

        [Fact]
        public async Task UpdatePedidoContratacao_QuandoPedidoNaoExiste_DeveRetornarNull()
        {
            _repoMock.Setup(r => r.GetPedidoById(It.IsAny<Guid>())).ReturnsAsync((Pedido?)null);

            var result = await _service.UpdatePedidoContratacao(Guid.NewGuid(), PedidoTipoContratacaoEnum.Anual);

            Assert.Null(result);
        }

        [Fact]
        public async Task UpdatePedidoContratacao_QuandoPedidoExiste_DeveAtualizarERetornarDto()
        {
            var pedido = CriarPedido();
            _repoMock.Setup(r => r.GetPedidoById(pedido.Id)).ReturnsAsync(pedido);
            _repoMock.Setup(r => r.AtualizarPedido(pedido.Id, It.IsAny<Pedido>(), null)).ReturnsAsync(pedido);

            var result = await _service.UpdatePedidoContratacao(pedido.Id, PedidoTipoContratacaoEnum.Anual);

            Assert.NotNull(result);
            _repoMock.Verify(r => r.AtualizarPedido(pedido.Id, It.IsAny<Pedido>(), null), Times.Once);
        }

        [Fact]
        public async Task CancelarPedido_QuandoExiste_DeveCancelarERetornarDto()
        {
            var pedido = CriarPedido();
            _repoMock.Setup(r => r.GetPedidoById(pedido.Id)).ReturnsAsync(pedido);
            _repoMock.Setup(r => r.AtualizarPedido(pedido.Id, It.IsAny<Pedido>(), null)).ReturnsAsync(pedido);

            var result = await _service.CancelarPedido(pedido.Id);

            Assert.NotNull(result);
            Assert.Equal(PedidoStatus.Cancelado, result!.Status);
        }

        [Fact]
        public async Task CancelarPedido_QuandoNaoExiste_DeveLancarKeyNotFoundException()
        {
            _repoMock.Setup(r => r.GetPedidoById(It.IsAny<Guid>())).ReturnsAsync((Pedido?)null);

            await Assert.ThrowsAsync<KeyNotFoundException>(
                () => _service.CancelarPedido(Guid.NewGuid()));
        }

        [Fact]
        public async Task DeleteAsync_QuandoExiste_DeveRetornarTrue()
        {
            var id = Guid.NewGuid();
            _repoMock.Setup(r => r.RemoverPedido(id)).ReturnsAsync(true);

            var result = await _service.DeleteAsync(id);

            Assert.True(result);
            _repoMock.Verify(r => r.RemoverPedido(id), Times.Once);
        }

        [Fact]
        public async Task DeleteAsync_QuandoNaoExiste_DeveRetornarFalse()
        {
            _repoMock.Setup(r => r.RemoverPedido(It.IsAny<Guid>())).ReturnsAsync(false);

            var result = await _service.DeleteAsync(Guid.NewGuid());

            Assert.False(result);
        }

        [Fact]
        public async Task GetPedidosByPeriodo_DeveRetornarPedidosNoPeriodo()
        {
            var ontem = DateTime.UtcNow.AddDays(-1);
            var amanha = DateTime.UtcNow.AddDays(1);
            var pedidos = new List<Pedido>
            {
                CriarPedido(),
                CriarPedido()
            };
            _repoMock.Setup(r => r.GetPedidosAsync()).ReturnsAsync(pedidos);

            var result = await _service.GetPedidosByPeriodo(ontem, amanha);

            Assert.Equal(2, result.Count());
        }
    }
}
