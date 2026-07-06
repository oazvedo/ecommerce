using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using api.Application.DTOs.Common;
using api.Application.DTOs.Empresa;
using api.Application.Services.Interfaces;
using api.Controllers;
using api.Domain;
using api.Domain.Enums;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace api.Tests.Controllers
{
    public class EmpresaControllerTests
    {
        private readonly Mock<IEmpresaService> _serviceMock;
        private readonly EmpresaController _controller;
        private readonly Guid _usuarioId = Guid.NewGuid();
        private const string _usuarioNome = "Admin Teste";

        public EmpresaControllerTests()
        {
            _serviceMock = new Mock<IEmpresaService>();
            _controller = new EmpresaController(_serviceMock.Object);

            var claims = new List<Claim>
            {
                new(JwtRegisteredClaimNames.Sub, _usuarioId.ToString()),
                new(JwtRegisteredClaimNames.UniqueName, _usuarioNome)
            };
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(claims))
                }
            };
        }

        // GET /api/empresa

        [Fact]
        public async Task GetAll_DeveRetornar200ComListaPaginada()
        {
            var paged = new PagedResult<EmpresaDto>
            {
                Page = 1,
                PageSize = 10,
                TotalCount = 1,
                Items = new List<EmpresaDto> { new() { Id = Guid.NewGuid() } }
            };
            _serviceMock.Setup(s => s.GetPagedAsync(1, 10)).ReturnsAsync(paged);

            var result = await _controller.GetAll(1, 10);

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            Assert.IsType<PagedResult<EmpresaDto>>(ok.Value);
        }

        // GET /api/empresa/{id}

        [Fact]
        public async Task GetById_QuandoExiste_DeveRetornar200()
        {
            var dto = new EmpresaDto { Id = Guid.NewGuid() };
            _serviceMock.Setup(s => s.GetByIdAsync(dto.Id)).ReturnsAsync(dto);

            var result = await _controller.GetById(dto.Id);

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Equal(dto, ok.Value);
        }

        [Fact]
        public async Task GetById_QuandoNaoExiste_DeveRetornar404()
        {
            _serviceMock.Setup(s => s.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((EmpresaDto?)null);

            var result = await _controller.GetById(Guid.NewGuid());

            Assert.IsType<NotFoundObjectResult>(result.Result);
        }

        // POST /api/empresa

        [Fact]
        public async Task Create_DeveUsarDadosDoTokenERetornar201()
        {
            var dto = new EmpresaDto { Id = Guid.NewGuid(), Nome = "Empresa Teste", ResponsavelId = _usuarioId };
            var request = new CreateEmpresaRequest
            {
                Nome = "Empresa Teste",
                Cnpj = "00.000.000/0001-00",
                Telefone = "(11) 0000-0000",
                Tipo = EmpresaTipo.Parceira,
                Status = true
            };
            _serviceMock.Setup(s => s.CreateAsync(It.IsAny<Empresa>())).ReturnsAsync(dto);

            var result = await _controller.Create(request);

            var created = Assert.IsType<CreatedAtActionResult>(result.Result);
            Assert.Equal(dto, created.Value);
            _serviceMock.Verify(s => s.CreateAsync(It.Is<Empresa>(e =>
                e.Nome == request.Nome &&
                e.ResponsavelId == _usuarioId &&
                e.Responsavel == _usuarioNome)), Times.Once);
        }

        // PUT /api/empresa/{id}

        [Fact]
        public async Task Update_QuandoExiste_DeveRetornar200()
        {
            var dto = new EmpresaDto { Id = Guid.NewGuid() };
            var request = new UpdateEmpresaRequest
            {
                Nome = "Empresa Atualizada",
                Cnpj = "00.000.000/0001-00",
                Responsavel = "Responsavel",
                ResponsavelId = Guid.NewGuid(),
                Telefone = "(11) 0000-0000",
                Tipo = EmpresaTipo.Filial,
                Status = true
            };
            _serviceMock.Setup(s => s.UpdateAsync(It.IsAny<Empresa>())).ReturnsAsync(dto);

            var result = await _controller.Update(dto.Id, request);

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Equal(dto, ok.Value);
        }

        [Fact]
        public async Task Update_QuandoNaoExiste_DeveRetornar404()
        {
            var request = new UpdateEmpresaRequest
            {
                Nome = "Empresa",
                Cnpj = "00.000.000/0001-00",
                Responsavel = "Responsavel",
                ResponsavelId = Guid.NewGuid(),
                Telefone = "(11) 0000-0000",
                Tipo = EmpresaTipo.Filial,
                Status = true
            };
            _serviceMock.Setup(s => s.UpdateAsync(It.IsAny<Empresa>())).ReturnsAsync((EmpresaDto?)null);

            var result = await _controller.Update(Guid.NewGuid(), request);

            Assert.IsType<NotFoundObjectResult>(result.Result);
        }

        // DELETE /api/empresa/{id}

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
