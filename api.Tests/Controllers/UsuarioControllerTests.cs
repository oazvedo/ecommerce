using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using api.application.dtos.usuario;
using api.Application.DTOs.Usuario;
using api.application.services.interfaces;
using api.Application.Services.Interfaces;
using api.controllers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace api.Tests.Controllers
{
    public class UsuarioControllerTests
    {
        private readonly Mock<IUsuarioService> _serviceMock;
        private readonly Mock<IAuditoriaService> _auditoriaServiceMock;
        private readonly UsuarioController _controller;
        private readonly Guid _usuarioId = Guid.NewGuid();

        public UsuarioControllerTests()
        {
            _serviceMock = new Mock<IUsuarioService>();
            _auditoriaServiceMock = new Mock<IAuditoriaService>();
            _controller = new UsuarioController(_serviceMock.Object, _auditoriaServiceMock.Object);
        }

        private void AutenticarComo(Guid usuarioId, params string[] permissoes)
        {
            var claims = new List<Claim> { new(JwtRegisteredClaimNames.Sub, usuarioId.ToString()) };
            claims.AddRange(permissoes.Select(p => new Claim("Permission", p)));
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(new ClaimsIdentity(claims)) }
            };
        }

        // PUT /api/usuario/{id}

        [Fact]
        public async Task UpdateUsuario_QuandoEditaProprioPerfil_DevePermitir()
        {
            AutenticarComo(_usuarioId);
            var request = new UpdateUsuarioRequest { Nome = "Novo Nome", Email = "eu@teste.com" };
            _serviceMock.Setup(s => s.GetByIdAsync(_usuarioId)).ReturnsAsync(new UsuarioDto { Id = _usuarioId });
            _serviceMock.Setup(s => s.UpdateAsync(_usuarioId, request)).ReturnsAsync(new UsuarioDto { Id = _usuarioId });

            var result = await _controller.UpdateUsuario(_usuarioId, request);

            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task UpdateUsuario_QuandoAutoedicaoTentaMudarCargo_DeveIgnorarCargo()
        {
            AutenticarComo(_usuarioId); // sem Usuario.Update
            var request = new UpdateUsuarioRequest { Nome = "Novo Nome", Email = "eu@teste.com", Cargo = api.Domain.Enums.UsuarioEnums.UsuarioCargo.Administrador };
            _serviceMock.Setup(s => s.GetByIdAsync(_usuarioId)).ReturnsAsync(new UsuarioDto { Id = _usuarioId });
            UpdateUsuarioRequest? capturado = null;
            _serviceMock.Setup(s => s.UpdateAsync(_usuarioId, It.IsAny<UpdateUsuarioRequest>()))
                .Callback<Guid, UpdateUsuarioRequest>((_, r) => capturado = r)
                .ReturnsAsync(new UsuarioDto { Id = _usuarioId });

            await _controller.UpdateUsuario(_usuarioId, request);

            Assert.NotNull(capturado);
            Assert.Null(capturado!.Cargo);
        }

        [Fact]
        public async Task UpdateUsuario_QuandoEditaOutroSemPermissao_DeveRetornarForbid()
        {
            AutenticarComo(_usuarioId);
            var outroId = Guid.NewGuid();
            var request = new UpdateUsuarioRequest { Nome = "X", Email = "x@teste.com" };

            var result = await _controller.UpdateUsuario(outroId, request);

            Assert.IsType<ForbidResult>(result);
            _serviceMock.Verify(s => s.UpdateAsync(It.IsAny<Guid>(), It.IsAny<UpdateUsuarioRequest>()), Times.Never);
        }

        [Fact]
        public async Task UpdateUsuario_QuandoEditaOutroComPermissao_DevePermitirMudarCargo()
        {
            AutenticarComo(_usuarioId, "Usuario.Update");
            var outroId = Guid.NewGuid();
            var request = new UpdateUsuarioRequest { Nome = "X", Email = "x@teste.com", Cargo = api.Domain.Enums.UsuarioEnums.UsuarioCargo.Gerente };
            _serviceMock.Setup(s => s.GetByIdAsync(outroId)).ReturnsAsync(new UsuarioDto { Id = outroId });
            UpdateUsuarioRequest? capturado = null;
            _serviceMock.Setup(s => s.UpdateAsync(outroId, It.IsAny<UpdateUsuarioRequest>()))
                .Callback<Guid, UpdateUsuarioRequest>((_, r) => capturado = r)
                .ReturnsAsync(new UsuarioDto { Id = outroId });

            var result = await _controller.UpdateUsuario(outroId, request);

            Assert.IsType<NoContentResult>(result);
            Assert.Equal(api.Domain.Enums.UsuarioEnums.UsuarioCargo.Gerente, capturado!.Cargo);
        }

        // PUT /api/usuario/{id}/password

        [Fact]
        public async Task UpdateUsuarioPassword_QuandoProprioUsuario_DevePermitir()
        {
            AutenticarComo(_usuarioId);
            var request = new UpdatePasswordRequest { Password = "NovaSenha123!" };
            _serviceMock.Setup(s => s.GetByIdAsync(_usuarioId)).ReturnsAsync(new UsuarioDto { Id = _usuarioId });
            _serviceMock.Setup(s => s.UpdatePasswordAsync(_usuarioId, request.Password)).ReturnsAsync(true);

            var result = await _controller.UpdateUsuarioPassword(_usuarioId, request);

            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task UpdateUsuarioPassword_QuandoOutroUsuarioSemPermissao_DeveRetornarForbid()
        {
            AutenticarComo(_usuarioId);
            var request = new UpdatePasswordRequest { Password = "NovaSenha123!" };

            var result = await _controller.UpdateUsuarioPassword(Guid.NewGuid(), request);

            Assert.IsType<ForbidResult>(result);
        }

        // PATCH /api/usuario/{id}/email

        [Fact]
        public async Task UpdateUsuarioEmail_QuandoProprioUsuario_DevePermitir()
        {
            AutenticarComo(_usuarioId);
            var request = new UpdateUsuarioEmailRequest { Email = "novo@teste.com" };
            _serviceMock.Setup(s => s.GetByIdAsync(_usuarioId)).ReturnsAsync(new UsuarioDto { Id = _usuarioId });
            _serviceMock.Setup(s => s.UpdateEmailAsync(_usuarioId, request.Email)).ReturnsAsync(new UsuarioDto { Id = _usuarioId, Email = request.Email });

            var result = await _controller.UpdateUsuarioEmail(_usuarioId, request);

            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task UpdateUsuarioEmail_QuandoOutroUsuarioSemPermissao_DeveRetornarForbid()
        {
            AutenticarComo(_usuarioId);
            var request = new UpdateUsuarioEmailRequest { Email = "novo@teste.com" };

            var result = await _controller.UpdateUsuarioEmail(Guid.NewGuid(), request);

            Assert.IsType<ForbidResult>(result);
        }
    }
}
