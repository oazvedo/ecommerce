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

        public PedidoServiceTests()
        {
            _repoMock = new Mock<IPedidoRepository>();
            _produtoRepoMock = new Mock<IRepositoryBase<Produto>>();
            _carteiraRepoMock = new Mock<ICarteiraRepository>();
            _service = new PedidoService(_repoMock.Object, _produtoRepoMock.Object, _carteiraRepoMock.Object);
        }

        [Fact]
        public async Task GetAllPedidos_DeveRetornarTodosComoDto()
        {
            var pedidos = new List<Pedido>
            {
                new(Guid.NewGuid(), PedidoTipoContratacaoEnum.Mensal),
                new(Guid.NewGuid(), PedidoTipoContratacaoEnum.Anual)
            };
            _repoMock.Setup(r => r.GetPedidosAsync()).ReturnsAsync(pedidos);

            var result = await _service.GetAllPedidos();

            Assert.Equal(2, result.Count());
        }

        [Fact]
        public async Task GetAllPedidos_ComPaginacao_DeveRetornarResultadoPaginado()
        {
            var pedidos = new List<Pedido>
            {
                new(Guid.NewGuid(), PedidoTipoContratacaoEnum.Mensal),
                new(Guid.NewGuid(), PedidoTipoContratacaoEnum.Anual),
                new(Guid.NewGuid(), PedidoTipoContratacaoEnum.Mensal)
            };
            _repoMock.Setup(r => r.GetPedidosPagedAsync(2, 2)).ReturnsAsync((pedidos.Skip(2).Take(2), 3));

            var result = await _service.GetAllPedidos(2, 2);

            Assert.Equal(2, result.Page);
            Assert.Equal(2, result.PageSize);
            Assert.Equal(3, result.TotalCount);
            Assert.Single(result.Items);
        }

        [Fact]
        public async Task GetPedidosByUsuarioId_DeveRetornarApenasDoUsuario()
        {
            var usuarioId = Guid.NewGuid();
            var pedidos = new List<Pedido> { new(usuarioId, PedidoTipoContratacaoEnum.Anual) };
            _repoMock.Setup(r => r.GetPedidosByUsuarioIdAsync(usuarioId)).ReturnsAsync(pedidos);

            var result = await _service.GetPedidosByUsuarioId(usuarioId);

            Assert.Single(result);
        }

        [Fact]
        public async Task GetPedidoById_QuandoExiste_DeveRetornarDto()
        {
            var pedido = new Pedido(Guid.NewGuid(), PedidoTipoContratacaoEnum.Mensal);
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
        public async Task CreatePedido_DeveCriarPedidoComDadosCorretos()
        {
            var usuarioId = Guid.NewGuid();
            var request = new CreatePedidoRequest { contratacao = PedidoTipoContratacaoEnum.Anual };
            _repoMock.Setup(r => r.AdicionarPedido(It.IsAny<Pedido>()))
                     .ReturnsAsync((Pedido p) => p);

            var result = await _service.CreatePedido(usuarioId, request);

            Assert.Equal(usuarioId, result.UsuarioId);
            Assert.Equal(PedidoStatus.Criado, result.Status);
            Assert.Equal(PedidoTipoContratacaoEnum.Anual, result.Contracacao);
        }

        [Fact]
        public async Task UpdatePedidoStatus_QuandoPedidoNaoExiste_DeveRetornarNull()
        {
            _repoMock.Setup(r => r.GetPedidoById(It.IsAny<Guid>())).ReturnsAsync((Pedido?)null);

            var result = await _service.UpdatePedidoStatus(Guid.NewGuid(), PedidoStatus.Finalizado);

            Assert.Null(result);
            _repoMock.Verify(r => r.AtualizarPedido(It.IsAny<Guid>(), It.IsAny<Pedido>()), Times.Never);
        }

        [Fact]
        public async Task UpdatePedidoStatus_QuandoPedidoExiste_DeveAtualizarERetornarDto()
        {
            var pedido = new Pedido(Guid.NewGuid(), PedidoTipoContratacaoEnum.Mensal);
            _repoMock.Setup(r => r.GetPedidoById(pedido.Id)).ReturnsAsync(pedido);
            _repoMock.Setup(r => r.AtualizarPedido(pedido.Id, It.IsAny<Pedido>())).ReturnsAsync(pedido);

            var result = await _service.UpdatePedidoStatus(pedido.Id, PedidoStatus.EmProcessamento);

            Assert.NotNull(result);
            _repoMock.Verify(r => r.AtualizarPedido(pedido.Id, It.IsAny<Pedido>()), Times.Once);
        }

        [Fact]
        public async Task UpdatePedidoStatus_QuandoCancelado_DevePropagrarInvalidOperationException()
        {
            var pedido = new Pedido(Guid.NewGuid(), PedidoTipoContratacaoEnum.Mensal);
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
            _repoMock.Verify(r => r.AtualizarPedido(It.IsAny<Guid>(), It.IsAny<Pedido>()), Times.Never);
        }

        [Fact]
        public async Task UpdatePedidoContratacao_QuandoPedidoExiste_DeveAtualizarERetornarDto()
        {
            var pedido = new Pedido(Guid.NewGuid(), PedidoTipoContratacaoEnum.Mensal);
            _repoMock.Setup(r => r.GetPedidoById(pedido.Id)).ReturnsAsync(pedido);
            _repoMock.Setup(r => r.AtualizarPedido(pedido.Id, It.IsAny<Pedido>())).ReturnsAsync(pedido);

            var result = await _service.UpdatePedidoContratacao(pedido.Id, PedidoTipoContratacaoEnum.Anual);

            Assert.NotNull(result);
            _repoMock.Verify(r => r.AtualizarPedido(pedido.Id, It.IsAny<Pedido>()), Times.Once);
        }

        [Fact]
        public async Task UpdatePedidoContratacao_QuandoCancelado_DevePropagrarInvalidOperationException()
        {
            var pedido = new Pedido(Guid.NewGuid(), PedidoTipoContratacaoEnum.Mensal);
            pedido.UpdateStatus(PedidoStatus.Cancelado);
            _repoMock.Setup(r => r.GetPedidoById(pedido.Id)).ReturnsAsync(pedido);

            await Assert.ThrowsAsync<InvalidOperationException>(
                () => _service.UpdatePedidoContratacao(pedido.Id, PedidoTipoContratacaoEnum.Anual));
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
    }
}
