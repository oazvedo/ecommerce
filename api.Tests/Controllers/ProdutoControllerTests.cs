using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using api.application.services.interfaces;
using api.Application.DTOs.Common;
using api.Application.DTOs.Produto;
using api.Application.DTOs.Usuario;
using api.Application.Services.Interfaces;
using api.Controllers;
using api.Domain;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace api.Tests.Controllers
{
    public class ProdutoControllerTests
    {
        private readonly Mock<IProdutoService> _serviceMock;
        private readonly Mock<IUsuarioService> _usuarioServiceMock;
        private readonly ProdutoController _controller;

        public ProdutoControllerTests()
        {
            _serviceMock = new Mock<IProdutoService>();
            _usuarioServiceMock = new Mock<IUsuarioService>();
            _controller = new ProdutoController(_serviceMock.Object, _usuarioServiceMock.Object);
        }

        private void AutenticarComo(Guid usuarioId)
        {
            var identity = new ClaimsIdentity(new[] { new Claim(JwtRegisteredClaimNames.Sub, usuarioId.ToString()) }, "TestAuth");
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(identity) }
            };
        }

        // GET /api/produto

        [Fact]
        public async Task GetAll_DeveRetornar200ComListaPaginada()
        {
            var paged = new PagedResult<ProdutoDto>
            {
                Page = 1,
                PageSize = 10,
                TotalCount = 1,
                Items = new List<ProdutoDto> { new() { Id = Guid.NewGuid() } }
            };
            _serviceMock
                .Setup(s => s.SearchPagedAsync(1, 10, null, null, null, null, null, null, null))
                .ReturnsAsync(paged);

            var result = await _controller.GetAll(1, 10);

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var value = Assert.IsType<PagedResult<ProdutoDto>>(ok.Value);
            Assert.Single(value.Items);
        }

        [Fact]
        public async Task GetAll_ComFiltros_DeveRepassarParaOServico()
        {
            var empresaId = Guid.NewGuid();
            var paged = new PagedResult<ProdutoDto> { Page = 1, PageSize = 10, TotalCount = 0, Items = new List<ProdutoDto>() };
            _serviceMock
                .Setup(s => s.SearchPagedAsync(1, 10, empresaId, "tenis", true, false, 50m, 200m, "preco_asc"))
                .ReturnsAsync(paged);

            var result = await _controller.GetAll(
                1, 10, empresaId, nome: "tenis", disponivel: true, freteGratis: false,
                precoMin: 50m, precoMax: 200m, orderBy: "preco_asc");

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Same(paged, ok.Value);
            _serviceMock.VerifyAll();
        }

        // GET /api/produto/{id}

        [Fact]
        public async Task GetById_QuandoExiste_DeveRetornar200()
        {
            var dto = new ProdutoDto { Id = Guid.NewGuid() };
            _serviceMock.Setup(s => s.GetByIdAsync(dto.Id)).ReturnsAsync(dto);

            var result = await _controller.GetProdutoById(dto.Id);

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Equal(dto, ok.Value);
        }

        [Fact]
        public async Task GetById_QuandoNaoExiste_DeveRetornar404()
        {
            _serviceMock.Setup(s => s.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((ProdutoDto?)null);

            var result = await _controller.GetProdutoById(Guid.NewGuid());

            Assert.IsType<NotFoundObjectResult>(result.Result);
        }

        // POST /api/produto

        [Fact]
        public async Task Create_DeveRetornar201ComProdutoCriado()
        {
            var usuarioId = Guid.NewGuid();
            var empresaId = Guid.NewGuid();
            AutenticarComo(usuarioId);
            _usuarioServiceMock.Setup(s => s.GetByIdAsync(usuarioId))
                .ReturnsAsync(new UsuarioDto { Id = usuarioId, EmpresaId = empresaId });

            var dto = new ProdutoDto { Id = Guid.NewGuid(), Nome = "Produto A", Descricao = "Desc", Codigo = "COD001", Preco = 10m };
            var request = new CreateProdutoRequest { Nome = "Produto A", Descricao = "Desc", Preco = 10m, Codigo = "COD001", Status = true };
            Produto? produtoCriado = null;
            _serviceMock.Setup(s => s.CreateAsync(It.IsAny<Produto>()))
                .Callback<Produto>(p => produtoCriado = p)
                .ReturnsAsync(dto);

            var result = await _controller.Create(request);

            var created = Assert.IsType<CreatedAtActionResult>(result.Result);
            Assert.Equal(dto, created.Value);
            Assert.NotNull(produtoCriado);
            Assert.Equal(empresaId, produtoCriado!.EmpresaId);
        }

        [Fact]
        public async Task Create_QuandoUsuarioNaoEncontrado_DeveRetornar404()
        {
            var usuarioId = Guid.NewGuid();
            AutenticarComo(usuarioId);
            _usuarioServiceMock.Setup(s => s.GetByIdAsync(usuarioId)).ReturnsAsync((UsuarioDto?)null);

            var request = new CreateProdutoRequest { Nome = "Produto A", Descricao = "Desc", Preco = 10m, Codigo = "COD001", Status = true };

            var result = await _controller.Create(request);

            Assert.IsType<NotFoundObjectResult>(result.Result);
        }

        // PUT /api/produto/{id}

        [Fact]
        public async Task Update_QuandoExiste_DeveRetornar200()
        {
            var dto = new ProdutoDto { Id = Guid.NewGuid() };
            var request = new UpdateProdutoRequest { Nome = "Produto A", Descricao = "Desc", Preco = 10m, Codigo = "COD001", Status = true };
            _serviceMock.Setup(s => s.UpdateAsync(dto.Id, request)).ReturnsAsync(dto);

            var result = await _controller.Update(dto.Id, request);

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Equal(dto, ok.Value);
        }

        [Fact]
        public async Task Update_QuandoNaoExiste_DeveRetornar404()
        {
            var request = new UpdateProdutoRequest { Nome = "Produto A", Descricao = "Desc", Preco = 10m, Codigo = "COD001", Status = true };
            _serviceMock.Setup(s => s.UpdateAsync(It.IsAny<Guid>(), It.IsAny<UpdateProdutoRequest>())).ReturnsAsync((ProdutoDto?)null);

            var result = await _controller.Update(Guid.NewGuid(), request);

            Assert.IsType<NotFoundObjectResult>(result.Result);
        }

        // DELETE /api/produto/{id}

        [Fact]
        public async Task Delete_QuandoExiste_DeveRetornar204()
        {
            var id = Guid.NewGuid();
            _serviceMock.Setup(s => s.DeleteAsync(id)).ReturnsAsync(true);

            var result = await _controller.Delete(id);

            Assert.IsType<NoContentResult>(result.Result);
        }

        [Fact]
        public async Task Delete_QuandoNaoExiste_DeveRetornar404()
        {
            _serviceMock.Setup(s => s.DeleteAsync(It.IsAny<Guid>())).ReturnsAsync(false);

            var result = await _controller.Delete(Guid.NewGuid());

            Assert.IsType<NotFoundObjectResult>(result.Result);
        }
    }
}
