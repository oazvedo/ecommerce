using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using api.Application.DTOs.Common;
using api.Application.DTOs.Pedido;
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
            _controller = new PedidoController(_serviceMock.Object);

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
            var paged = new PagedResult<PedidoDto>
            {
                Page = 1,
                PageSize = 10,
                TotalCount = 1,
                Items = new List<PedidoDto> { new() { Id = Guid.NewGuid() } }
            };
            _serviceMock.Setup(s => s.GetAllPedidos(1, 10)).ReturnsAsync(paged);

            var result = await _controller.GetAll(1, 10);

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
            _serviceMock.Setup(s => s.GetPedidosByUsuarioId(usuarioId)).ReturnsAsync(new List<PedidoDto>());

            var result = await _controller.GetByUsuario(usuarioId);

            Assert.IsType<OkObjectResult>(result.Result);
        }

        // GET /api/pedido/meus

        [Fact]
        public async Task GetMeus_DeveUsarUsuarioDoTokenERetornar200()
        {
            _serviceMock.Setup(s => s.GetPedidosByUsuarioId(_usuarioId)).ReturnsAsync(new List<PedidoDto>());

            var result = await _controller.GetMeus();

            Assert.IsType<OkObjectResult>(result.Result);
            _serviceMock.Verify(s => s.GetPedidosByUsuarioId(_usuarioId), Times.Once);
        }

        // POST /api/pedido

        [Fact]
        public async Task Create_DeveRetornar201ComPedidoCriado()
        {
            var dto = new PedidoDto { Id = Guid.NewGuid(), UsuarioId = _usuarioId };
            var request = new CreatePedidoRequest { contratacao = PedidoTipoContratacaoEnum.Mensal };
            _serviceMock.Setup(s => s.CreatePedido(_usuarioId, request)).ReturnsAsync(dto);

            var result = await _controller.Create(request);

            var created = Assert.IsType<CreatedAtActionResult>(result.Result);
            Assert.Equal(dto, created.Value);
        }

        // PATCH /api/pedido/{id}/status

        [Fact]
        public async Task UpdateStatus_QuandoSucesso_DeveRetornar200()
        {
            var dto = new PedidoDto { Id = Guid.NewGuid() };
            var request = new UpdatePedidoRequest { Status = PedidoStatus.EmProcessamento };
            _serviceMock.Setup(s => s.UpdatePedidoStatus(dto.Id, request.Status)).ReturnsAsync(dto);

            var result = await _controller.UpdateStatus(dto.Id, request);

            Assert.IsType<OkObjectResult>(result.Result);
        }

        [Fact]
        public async Task UpdateStatus_QuandoNaoExiste_DeveRetornar404()
        {
            var request = new UpdatePedidoRequest { Status = PedidoStatus.EmProcessamento };
            _serviceMock.Setup(s => s.UpdatePedidoStatus(It.IsAny<Guid>(), It.IsAny<PedidoStatus>()))
                        .ReturnsAsync((PedidoDto?)null);

            var result = await _controller.UpdateStatus(Guid.NewGuid(), request);

            Assert.IsType<NotFoundObjectResult>(result.Result);
        }

        [Fact]
        public async Task UpdateStatus_QuandoCancelado_DeveRetornar400ComMensagem()
        {
            var request = new UpdatePedidoRequest { Status = PedidoStatus.EmProcessamento };
            _serviceMock.Setup(s => s.UpdatePedidoStatus(It.IsAny<Guid>(), It.IsAny<PedidoStatus>()))
                        .ThrowsAsync(new InvalidOperationException("Pedidos cancelados não podem ter atualização de status"));

            var result = await _controller.UpdateStatus(Guid.NewGuid(), request);

            var bad = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.NotNull(bad.Value);
        }

        // PUT /api/pedido/{id}

        [Fact]
        public async Task Update_QuandoSucesso_DeveRetornar200()
        {
            var dto = new PedidoDto { Id = Guid.NewGuid() };
            var request = new PutPedidoRequest { Contratacao = PedidoTipoContratacaoEnum.Anual };
            _serviceMock.Setup(s => s.UpdatePedidoContratacao(dto.Id, request.Contratacao)).ReturnsAsync(dto);

            var result = await _controller.Update(dto.Id, request);

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Equal(dto, ok.Value);
        }

        [Fact]
        public async Task Update_QuandoNaoExiste_DeveRetornar404()
        {
            var request = new PutPedidoRequest { Contratacao = PedidoTipoContratacaoEnum.Anual };
            _serviceMock.Setup(s => s.UpdatePedidoContratacao(It.IsAny<Guid>(), It.IsAny<PedidoTipoContratacaoEnum>()))
                        .ReturnsAsync((PedidoDto?)null);

            var result = await _controller.Update(Guid.NewGuid(), request);

            Assert.IsType<NotFoundObjectResult>(result.Result);
        }

        [Fact]
        public async Task Update_QuandoCancelado_DeveRetornar400ComMensagem()
        {
            var request = new PutPedidoRequest { Contratacao = PedidoTipoContratacaoEnum.Anual };
            _serviceMock.Setup(s => s.UpdatePedidoContratacao(It.IsAny<Guid>(), It.IsAny<PedidoTipoContratacaoEnum>()))
                        .ThrowsAsync(new InvalidOperationException("Pedidos cancelados não podem ter atualização de status"));

            var result = await _controller.Update(Guid.NewGuid(), request);

            var bad = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.NotNull(bad.Value);
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
    }
}
