using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using api.Application.DTOs.Common;
using api.Application.DTOs.Favorito;
using api.Application.DTOs.Produto;
using api.Application.Services.Interfaces;
using api.Controllers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace api.Tests.Controllers
{
    public class FavoritoControllerTests
    {
        private readonly Mock<IFavoritoService> _serviceMock;
        private readonly FavoritoController _controller;
        private readonly Guid _usuarioId = Guid.NewGuid();

        public FavoritoControllerTests()
        {
            _serviceMock = new Mock<IFavoritoService>();
            _controller = new FavoritoController(_serviceMock.Object);

            var claims = new List<Claim> { new(JwtRegisteredClaimNames.Sub, _usuarioId.ToString()) };
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(new ClaimsIdentity(claims)) }
            };
        }

        [Fact]
        public async Task Adicionar_DeveChamarServicoComUsuarioDoTokenERetornar204()
        {
            var produtoId = Guid.NewGuid();

            var result = await _controller.Adicionar(produtoId);

            Assert.IsType<NoContentResult>(result);
            _serviceMock.Verify(s => s.AdicionarAsync(_usuarioId, produtoId), Times.Once);
        }

        [Fact]
        public async Task Remover_DeveChamarServicoComUsuarioDoTokenERetornar204()
        {
            var produtoId = Guid.NewGuid();

            var result = await _controller.Remover(produtoId);

            Assert.IsType<NoContentResult>(result);
            _serviceMock.Verify(s => s.RemoverAsync(_usuarioId, produtoId), Times.Once);
        }

        [Fact]
        public async Task GetStatus_DeveRetornar200ComStatus()
        {
            var produtoId = Guid.NewGuid();
            _serviceMock.Setup(s => s.EstaFavoritadoAsync(_usuarioId, produtoId)).ReturnsAsync(true);

            var result = await _controller.GetStatus(produtoId);

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var dto = Assert.IsType<FavoritoStatusDto>(ok.Value);
            Assert.True(dto.Favoritado);
        }

        [Fact]
        public async Task GetIds_DeveRetornar200ComConjuntoDeIds()
        {
            var ids = new HashSet<Guid> { Guid.NewGuid(), Guid.NewGuid() };
            _serviceMock.Setup(s => s.GetProdutoIdsFavoritadosAsync(_usuarioId)).ReturnsAsync(ids);

            var result = await _controller.GetIds();

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Same(ids, ok.Value);
        }

        [Fact]
        public async Task GetAll_DeveRetornar200ComListaPaginada()
        {
            var paged = new PagedResult<ProdutoDto> { Page = 1, PageSize = 20, TotalCount = 0, Items = new List<ProdutoDto>() };
            _serviceMock.Setup(s => s.GetPagedAsync(_usuarioId, 1, 20)).ReturnsAsync(paged);

            var result = await _controller.GetAll(1, 20);

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Same(paged, ok.Value);
        }
    }
}
