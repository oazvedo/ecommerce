using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using api.Application.DTOs.Carteira;
using api.Application.DTOs.Common;
using api.Application.Services.Interfaces;
using api.Controllers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace api.Tests.Controllers
{
    public class CarteiraControllerTests
    {
        private readonly Mock<ICarteiraService> _serviceMock;
        private readonly CarteiraController _controller;
        private readonly Guid _usuarioId = Guid.NewGuid();

        public CarteiraControllerTests()
        {
            _serviceMock = new Mock<ICarteiraService>();
            _controller = new CarteiraController(_serviceMock.Object);

            var claims = new List<Claim>
            {
                new(JwtRegisteredClaimNames.Sub, _usuarioId.ToString()),
                new(JwtRegisteredClaimNames.UniqueName, "Usuario Teste")
            };
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(claims))
                }
            };
        }

        // GET /api/carteira

        [Fact]
        public async Task GetAll_DeveRetornar200ComListaPaginada()
        {
            var paged = new PagedResult<CarteiraDto>
            {
                Page = 1,
                PageSize = 10,
                TotalCount = 1,
                Items = new List<CarteiraDto> { new() { Id = Guid.NewGuid() } }
            };
            _serviceMock.Setup(s => s.GetPagedAsync(1, 10)).ReturnsAsync(paged);

            var result = await _controller.GetAllCarteiras(1, 10);

            var ok = Assert.IsType<OkObjectResult>(result);
            Assert.IsType<PagedResult<CarteiraDto>>(ok.Value);
        }

        // GET /api/carteira/minha-carteira

        [Fact]
        public async Task GetMinhaCarteira_QuandoExiste_DeveRetornar200()
        {
            var dto = new CarteiraDto { Id = Guid.NewGuid(), UsuarioId = _usuarioId };
            _serviceMock.Setup(s => s.GetMyCarteiraAsync(_usuarioId)).ReturnsAsync(dto);

            var result = await _controller.GetMyCarteira();

            var ok = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(dto, ok.Value);
        }

        [Fact]
        public async Task GetMinhaCarteira_QuandoNaoExiste_DeveRetornar500()
        {
            _serviceMock.Setup(s => s.GetMyCarteiraAsync(_usuarioId))
                        .ThrowsAsync(new KeyNotFoundException("Carteira não encontrada"));

            var result = await _controller.GetMyCarteira();

            var status = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, status.StatusCode);
        }

        // GET /api/carteira/{id}

        [Fact]
        public async Task GetById_QuandoExiste_DeveRetornar200()
        {
            var dto = new CarteiraDto { Id = Guid.NewGuid() };
            _serviceMock.Setup(s => s.GetByIdAsync(dto.Id)).ReturnsAsync(dto);

            var result = await _controller.GetById(dto.Id);

            var ok = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(dto, ok.Value);
        }

        [Fact]
        public async Task GetById_QuandoNaoExiste_DeveRetornar404()
        {
            _serviceMock.Setup(s => s.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((CarteiraDto?)null);

            var result = await _controller.GetById(Guid.NewGuid());

            Assert.IsType<NotFoundResult>(result);
        }

        // PUT /api/carteira/{id}

        [Fact]
        public async Task Update_QuandoSucesso_DeveRetornar200()
        {
            var dto = new CarteiraDto { Id = Guid.NewGuid() };
            var request = new UpdateCarteiraRequest { Saldo = 100 };
            _serviceMock.Setup(s => s.UpdateCarteira(dto.Id, request)).ReturnsAsync(dto);

            var result = await _controller.Update(dto.Id, request);

            var ok = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(dto, ok.Value);
        }

        [Fact]
        public async Task Update_QuandoNaoExiste_DeveRetornar404()
        {
            var request = new UpdateCarteiraRequest { Saldo = 100 };
            _serviceMock.Setup(s => s.UpdateCarteira(It.IsAny<Guid>(), It.IsAny<UpdateCarteiraRequest>()))
                        .ThrowsAsync(new KeyNotFoundException("Carteira não encontrada"));

            var result = await _controller.Update(Guid.NewGuid(), request);

            Assert.IsType<NotFoundObjectResult>(result);
        }
    }
}
