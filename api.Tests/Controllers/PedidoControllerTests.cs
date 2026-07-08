using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using api.Application.DTOs.Common;
using api.Application.DTOs.Pedido;
using api.Application.DTOs.Pedido.Relatorio;
using api.Application.Handlers.Relatorio;
using api.Application.Services.Interfaces;
using api.Controllers;
using api.Domain.Enums;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace api.Tests.Controllers
{
    public class PedidoControllerTests
    {
        private readonly Mock<IPedidoService> _serviceMock;
        private readonly PedidoController _controller;
        private readonly Guid _usuarioId = Guid.NewGuid();

        public PedidoControllerTests()
        {
            _serviceMock = new Mock<IPedidoService>();
            var handler = new RelatorioPedidosHandler(_serviceMock.Object);
            _controller = new PedidoController(_serviceMock.Object, handler);

            var claims = new List<Claim> { new(JwtRegisteredClaimNames.Sub, _usuarioId.ToString()) };
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(claims))
                }
            };
        }

        // GET /api/pedido

        [Fact]
        public async Task GetAll_DeveRetornar200ComListaPaginada()
        {
            var filtro = new PedidoFiltroRequest { Page = 1, PageSize = 10 };
            var paged = new PagedResult<PedidoDto>
            {
                Page = 1,
                PageSize = 10,
                TotalCount = 1,
                Items = new List<PedidoDto> { new() { Id = Guid.NewGuid() } }
            };
            _serviceMock.Setup(s => s.GetAllPedidos(filtro)).ReturnsAsync(paged);

            var result = await _controller.GetAll(filtro);

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var value = Assert.IsType<PagedResult<PedidoDto>>(ok.Value);
            Assert.Single(value.Items);
        }

        // GET /api/pedido/{id}

        [Fact]
        public async Task GetById_QuandoExiste_DeveRetornar200()
        {
            var dto = new PedidoDto { Id = Guid.NewGuid() };
            _serviceMock.Setup(s => s.GetPedidoById(dto.Id)).ReturnsAsync(dto);

            var result = await _controller.GetById(dto.Id);

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Equal(dto, ok.Value);
        }

        [Fact]
        public async Task GetById_QuandoNaoExiste_DeveRetornar404()
        {
            _serviceMock.Setup(s => s.GetPedidoById(It.IsAny<Guid>())).ReturnsAsync((PedidoDto?)null);

            var result = await _controller.GetById(Guid.NewGuid());

            Assert.IsType<NotFoundObjectResult>(result.Result);
        }

        // GET /api/pedido/usuario/{usuarioId}

        [Fact]
        public async Task GetByUsuario_DeveRetornar200ComPedidosDoUsuario()
        {
            var usuarioId = Guid.NewGuid();
            var paged = new PagedResult<PedidoDto>
            {
                Page = 1,
                PageSize = 10,
                TotalCount = 0,
                Items = new List<PedidoDto>()
            };
            _serviceMock.Setup(s => s.GetPedidosByUsuarioId(usuarioId, 1, 10)).ReturnsAsync(paged);

            var result = await _controller.GetByUsuario(usuarioId, 1, 10);

            Assert.IsType<OkObjectResult>(result.Result);
        }

        // GET /api/pedido/meus

        [Fact]
        public async Task GetMeus_DeveUsarUsuarioDoTokenERetornar200()
        {
            var paged = new PagedResult<PedidoDto>
            {
                Page = 1,
                PageSize = 10,
                TotalCount = 0,
                Items = new List<PedidoDto>()
            };
            _serviceMock.Setup(s => s.GetPedidosByUsuarioId(_usuarioId, 1, 10)).ReturnsAsync(paged);

            var result = await _controller.GetMeus(1, 10);

            Assert.IsType<OkObjectResult>(result.Result);
            _serviceMock.Verify(s => s.GetPedidosByUsuarioId(_usuarioId, 1, 10), Times.Once);
        }

        // POST /api/pedido

        [Fact]
        public async Task Create_DeveRetornar201ComPedidoCriado()
        {
            var dto = new PedidoDto { Id = Guid.NewGuid(), UsuarioId = _usuarioId };
            var request = new CreatePedidoRequest
            {
                EmpresaId = Guid.NewGuid(),
                contratacao = PedidoTipoContratacaoEnum.Mensal
            };
            _serviceMock.Setup(s => s.CreatePedido(_usuarioId, request)).ReturnsAsync(dto);

            var result = await _controller.Create(request);

            var created = Assert.IsType<CreatedAtActionResult>(result.Result);
            Assert.Equal(dto, created.Value);
        }

        [Fact]
        public async Task Create_QuandoSaldoInsuficiente_DeveRetornar404()
        {
            var request = new CreatePedidoRequest { EmpresaId = Guid.NewGuid(), contratacao = PedidoTipoContratacaoEnum.Mensal };
            _serviceMock.Setup(s => s.CreatePedido(_usuarioId, request))
                        .ThrowsAsync(new KeyNotFoundException("Saldo insuficiente"));

            var result = await _controller.Create(request);

            Assert.IsType<NotFoundObjectResult>(result.Result);
        }

        // PATCH /api/pedido/{id}/status

        [Fact]
        public async Task UpdateStatus_QuandoSucesso_DeveRetornar200()
        {
            var dto = new PedidoDto { Id = Guid.NewGuid() };
            var request = new UpdateStatusPedidoRequest { Status = PedidoStatus.EmProcessamento };
            _serviceMock.Setup(s => s.UpdatePedidoStatus(dto.Id, request.Status)).ReturnsAsync(dto);

            var result = await _controller.UpdateStatus(dto.Id, request);

            Assert.IsType<OkObjectResult>(result.Result);
        }

        [Fact]
        public async Task UpdateStatus_QuandoNaoExiste_DeveRetornar404()
        {
            var request = new UpdateStatusPedidoRequest { Status = PedidoStatus.EmProcessamento };
            _serviceMock.Setup(s => s.UpdatePedidoStatus(It.IsAny<Guid>(), It.IsAny<PedidoStatus>()))
                        .ReturnsAsync((PedidoDto?)null);

            var result = await _controller.UpdateStatus(Guid.NewGuid(), request);

            Assert.IsType<NotFoundObjectResult>(result.Result);
        }

        [Fact]
        public async Task UpdateStatus_QuandoCancelado_DeveRetornar400()
        {
            var request = new UpdateStatusPedidoRequest { Status = PedidoStatus.EmProcessamento };
            _serviceMock.Setup(s => s.UpdatePedidoStatus(It.IsAny<Guid>(), It.IsAny<PedidoStatus>()))
                        .ThrowsAsync(new InvalidOperationException("Pedidos cancelados não podem ter atualização de status"));

            var result = await _controller.UpdateStatus(Guid.NewGuid(), request);

            var bad = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.NotNull(bad.Value);
        }

        // PATCH /api/pedido/{id}/contratacao

        [Fact]
        public async Task Update_QuandoSucesso_DeveRetornar200()
        {
            var id = Guid.NewGuid();
            var dto = new PedidoDto { Id = id };
            var request = new PutPedidoRequest { Contratacao = PedidoTipoContratacaoEnum.Anual };
            _serviceMock.Setup(s => s.UpdatePedidoContratacao(id, request.Contratacao)).ReturnsAsync(dto);

            var result = await _controller.Update(id, request);

            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task Update_QuandoNaoExiste_DeveRetornar404()
        {
            var request = new PutPedidoRequest { Contratacao = PedidoTipoContratacaoEnum.Anual };
            _serviceMock.Setup(s => s.UpdatePedidoContratacao(It.IsAny<Guid>(), It.IsAny<PedidoTipoContratacaoEnum>()))
                        .ReturnsAsync((PedidoDto?)null);

            var result = await _controller.Update(Guid.NewGuid(), request);

            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task Update_QuandoCancelado_DeveRetornar400()
        {
            var request = new PutPedidoRequest { Contratacao = PedidoTipoContratacaoEnum.Anual };
            _serviceMock.Setup(s => s.UpdatePedidoContratacao(It.IsAny<Guid>(), It.IsAny<PedidoTipoContratacaoEnum>()))
                        .ThrowsAsync(new InvalidOperationException("Pedidos cancelados não podem ter atualização de status"));

            var result = await _controller.Update(Guid.NewGuid(), request);

            var bad = Assert.IsType<BadRequestObjectResult>(result);
            Assert.NotNull(bad.Value);
        }

        // PUT /api/pedido/{id}

        [Fact]
        public async Task UpdatePedido_QuandoSucesso_DeveRetornar204()
        {
            var id = Guid.NewGuid();
            var dto = new PedidoDto { Id = id };
            var request = new UpdatePedidoRequest
            {
                Contratacao = PedidoTipoContratacaoEnum.Anual,
                Status = PedidoStatus.EmProcessamento
            };
            _serviceMock.Setup(s => s.UpdatePedido(id, request)).ReturnsAsync(dto);

            var result = await _controller.UpdatePedido(id, request);

            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task UpdatePedido_QuandoNaoExiste_DeveRetornar404()
        {
            var request = new UpdatePedidoRequest
            {
                Contratacao = PedidoTipoContratacaoEnum.Anual,
                Status = PedidoStatus.EmProcessamento
            };
            _serviceMock.Setup(s => s.UpdatePedido(It.IsAny<Guid>(), It.IsAny<UpdatePedidoRequest>()))
                        .ReturnsAsync((PedidoDto?)null);

            var result = await _controller.UpdatePedido(Guid.NewGuid(), request);

            Assert.IsType<NotFoundObjectResult>(result);
        }

        // DELETE /api/pedido/{id}

        [Fact]
        public async Task Delete_QuandoExiste_DeveRetornar204()
        {
            var id = Guid.NewGuid();
            _serviceMock.Setup(s => s.DeleteAsync(id)).ReturnsAsync(true);

            var result = await _controller.Delete(id);

            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task Delete_QuandoNaoExiste_DeveRetornar404()
        {
            _serviceMock.Setup(s => s.DeleteAsync(It.IsAny<Guid>())).ReturnsAsync(false);

            var result = await _controller.Delete(Guid.NewGuid());

            Assert.IsType<NotFoundObjectResult>(result);
        }

        // POST /api/pedido/cancelar

        [Fact]
        public async Task Cancelar_QuandoSucesso_DeveRetornar200()
        {
            var id = Guid.NewGuid();
            var dto = new PedidoDto { Id = id };
            _serviceMock.Setup(s => s.CancelarPedido(id)).ReturnsAsync(dto);

            var result = await _controller.Cancelar(id);

            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task Cancelar_QuandoNaoExiste_DeveRetornar404()
        {
            _serviceMock.Setup(s => s.CancelarPedido(It.IsAny<Guid>()))
                        .ReturnsAsync((PedidoDto?)null);

            var result = await _controller.Cancelar(Guid.NewGuid());

            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task Cancelar_QuandoPedidoJaCancelado_DeveRetornar400()
        {
            _serviceMock.Setup(s => s.CancelarPedido(It.IsAny<Guid>()))
                        .ThrowsAsync(new InvalidOperationException("Pedido já está cancelado."));

            var result = await _controller.Cancelar(Guid.NewGuid());

            var bad = Assert.IsType<BadRequestObjectResult>(result);
            Assert.NotNull(bad.Value);
        }

        // GET /api/pedido/relatorio

        [Fact]
        public async Task GetRelatorio_DeveRetornar200ComRelatorio()
        {
            var request = new RelatorioPedidoRequest
            {
                DataInicio = DateTime.UtcNow.AddDays(-30),
                DataFim = DateTime.UtcNow
            };
            var pedidos = new List<PedidoDto>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    ValorTotal = 100m,
                    UsuarioNome = "João",
                    Itens = new List<PedidoItemDto>
                    {
                        new() { NomeProduto = "Produto A", Quantidade = 2 }
                    }
                }
            };
            _serviceMock.Setup(s => s.GetPedidosByPeriodo(request.DataInicio, request.DataFim))
                        .ReturnsAsync(pedidos);

            var result = await _controller.GetRelatorio(request);

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var value = Assert.IsType<RelatorioPedidoResponse>(ok.Value);
            Assert.Equal(1, value.TotalVendas);
            Assert.Equal(100m, value.TotalValorVendas);
        }

        [Fact]
        public async Task GetRelatorio_QuandoSemPedidos_DeveRetornarRelatorioVazio()
        {
            var request = new RelatorioPedidoRequest
            {
                DataInicio = DateTime.UtcNow.AddDays(-30),
                DataFim = DateTime.UtcNow
            };
            _serviceMock.Setup(s => s.GetPedidosByPeriodo(request.DataInicio, request.DataFim))
                        .ReturnsAsync(new List<PedidoDto>());

            var result = await _controller.GetRelatorio(request);

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var value = Assert.IsType<RelatorioPedidoResponse>(ok.Value);
            Assert.Equal(0, value.TotalVendas);
            Assert.Equal(0m, value.TotalValorVendas);
        }
    }
}
