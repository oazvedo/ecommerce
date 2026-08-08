using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using api.Application.DTOs.Avaliacao;
using api.Application.DTOs.Common;
using api.Application.Services.Interfaces;
using api.Controllers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace api.Tests.Controllers
{
    public class AvaliacaoControllerTests
    {
        private readonly Mock<IAvaliacaoService> _serviceMock;
        private readonly AvaliacaoController _controller;
        private readonly Guid _usuarioId = Guid.NewGuid();

        public AvaliacaoControllerTests()
        {
            _serviceMock = new Mock<IAvaliacaoService>();
            _controller = new AvaliacaoController(_serviceMock.Object);

            var claims = new List<Claim> { new(JwtRegisteredClaimNames.Sub, _usuarioId.ToString()) };
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(new ClaimsIdentity(claims)) }
            };
        }

        [Fact]
        public async Task Avaliar_DeveUsarUsuarioDoTokenERetornar200()
        {
            var request = new CreateAvaliacaoRequest { ProdutoId = Guid.NewGuid(), Nota = 5 };
            var dto = new AvaliacaoDto { Id = Guid.NewGuid(), UsuarioId = _usuarioId, Nota = 5 };
            _serviceMock.Setup(s => s.AvaliarAsync(_usuarioId, request)).ReturnsAsync(dto);

            var result = await _controller.Avaliar(request);

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Equal(dto, ok.Value);
        }

        [Fact]
        public async Task Avaliar_QuandoServicoLancaInvalidOperationException_DeveRetornar400()
        {
            var request = new CreateAvaliacaoRequest { Nota = 5 };
            _serviceMock.Setup(s => s.AvaliarAsync(_usuarioId, request))
                .ThrowsAsync(new InvalidOperationException("Informe produtoId OU empresaId, nunca os dois nem nenhum."));

            var result = await _controller.Avaliar(request);

            Assert.IsType<BadRequestObjectResult>(result.Result);
        }

        [Fact]
        public async Task GetByProduto_DeveRetornar200ComListaPaginada()
        {
            var produtoId = Guid.NewGuid();
            var paged = new PagedResult<AvaliacaoDto> { Page = 1, PageSize = 10, TotalCount = 0, Items = new List<AvaliacaoDto>() };
            _serviceMock.Setup(s => s.GetPagedByProdutoAsync(produtoId, 1, 10)).ReturnsAsync(paged);

            var result = await _controller.GetByProduto(produtoId, 1, 10);

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Same(paged, ok.Value);
        }

        [Fact]
        public async Task GetResumoProduto_DeveRetornar200ComResumo()
        {
            var produtoId = Guid.NewGuid();
            var resumo = new AvaliacaoResumoDto { Media = 4.2, Total = 10 };
            _serviceMock.Setup(s => s.GetResumoByProdutoAsync(produtoId)).ReturnsAsync(resumo);

            var result = await _controller.GetResumoProduto(produtoId);

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Same(resumo, ok.Value);
        }
    }
}
