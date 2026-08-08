using api.application.dtos.usuario;
using api.Application.DTOs.Common;
using api.Application.DTOs.Usuario;
using api.application.services.interfaces;
using api.Application.Services.Interfaces;
using api.domain;
using api.domain.enums;
using api.domain.interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using api.Domain.Enums.UsuarioEnums;
using api.Application.Utils;
using api.infra;

namespace api.controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsuarioController : ControllerBase
    {
        private readonly IUsuarioService _service;
        private readonly IAuditoriaService _auditoriaService;

        public UsuarioController(IUsuarioService usuarioService, IAuditoriaService auditoriaService)
        {
            _service = usuarioService;
            _auditoriaService = auditoriaService;
        }

        [HttpGet]
        [Authorize(Policy = "Usuario.Read")]
        public async Task<ActionResult<PagedResult<UsuarioDto>>> GetUsuarios([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                if (page < 1) page = 1;
                if (pageSize < 1) pageSize = 10;

                var usuarios = await _service.GetAllAsync(page, pageSize);
                return Ok(usuarios);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<UsuarioDto>> GetUsuario(Guid id)
        {
            try
            {
                // Qualquer autenticado lê o próprio perfil; ler outros exige Usuario.Read.
                if (id != User.GetId() && !User.HasPermissao("Usuario.Read"))
                    return Forbid();

                var usuario = await _service.GetByIdAsync(id);
                if (usuario == null)
                    return NotFound();
                return Ok(usuario);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }

        [HttpPost]
        [Authorize(Policy = "Usuario.Create")]
        public async Task<ActionResult<UsuarioDto>> CreateUsuario(UsuarioCargo cargo, CreateUsuarioRequest request)
        {
            try
            {
                var usuario = new Usuario(request.Nome, request.Email, request.Password, cargo, request.EmpresaId);
                var usuarioDto = await _service.CreateAsync(usuario);
                return CreatedAtAction(nameof(GetUsuario), new { id = usuarioDto.Id }, usuarioDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }

        // Auto-cadastro público de cliente. Cargo e empresa são forçados pelo
        // servidor — o cliente não pode escolher virar admin/lojista.
        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<ActionResult<UsuarioDto>> Register(RegisterUsuarioRequest request)
        {
            try
            {
                var usuario = new Usuario(
                    request.Nome,
                    request.Email,
                    request.Password,
                    UsuarioCargo.Cliente,
                    EmpresaSeed.DefaultEmpresaId);
                var usuarioDto = await _service.CreateAsync(usuario);
                return CreatedAtAction(nameof(GetUsuario), new { id = usuarioDto.Id }, usuarioDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "Usuario.Update")]
        public async Task<IActionResult> UpdateUsuario(Guid id, UpdateUsuarioRequest request)
        {
            try
            {
                var existingUsuario = await _service.GetByIdAsync(id);
                if (existingUsuario == null)
                    return NotFound();

                var updatedUsuario = await _service.UpdateAsync(id, request);
                if (updatedUsuario == null)
                    return NotFound();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }

        [HttpPatch("{id}/status")]
        [Authorize(Policy = "Usuario.Update")]
        public async Task<IActionResult> UpdateUsuarioStatus(Guid id, [FromBody] UpdateUsuarioStatusRequest request)
        {
            try
            {
                var usuario = await _service.GetByIdAsync(id);
                if (usuario == null) return NotFound();

                var atualizado = await _service.UpdateStatusAsync(id, request.Status);
                if (!atualizado)
                    return NotFound(new { mensagem = "Usuário não encontrado." });

                await _auditoriaService.RegistrarAsync(User.GetId(), User.GetNome() ?? "", "AtualizarStatus", "Usuario", id, User.GetEmpresaId(), request.Status.ToString());
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }

        [HttpPut("{id}/password")]
        [Authorize(Policy = "Usuario.PasswordUpdate")]
        public async Task<IActionResult> UpdateUsuarioPassword(Guid id, UpdatePasswordRequest request)
        {
            try
            {
                var atualizado = await _service.UpdatePasswordAsync(id, request.Password);
                if (!atualizado)
                    return NotFound(new { mensagem = "Usuário não encontrado." });

                await _auditoriaService.RegistrarAsync(User.GetId(), User.GetNome() ?? "", "RedefinirSenha", "Usuario", id, User.GetEmpresaId());
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "Usuario.Delete")]
        public async Task<IActionResult> DeleteUsuario(Guid id)
        {
            try
            {
                var existingUsuario = await _service.GetByIdAsync(id);
                if (existingUsuario == null)
                    return NotFound();

                await _service.DeleteAsync(id);
                await _auditoriaService.RegistrarAsync(User.GetId(), User.GetNome() ?? "", "Excluir", "Usuario", id, existingUsuario.EmpresaId);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }

        [HttpPatch("{id}/email")]
        [Authorize(Policy = "Usuario.EmailUpdate")]
        public async Task<IActionResult> UpdateUsuarioEmail(Guid id, UpdateUsuarioEmailRequest request)
        {
            try
            {
                var existingUsuario = await _service.GetByIdAsync(id);
                if (existingUsuario == null)
                    return NotFound();

                var updatedUsuario = await _service.UpdateEmailAsync(id, request.Email);
                if (updatedUsuario == null)
                    return NotFound();

                return Ok(updatedUsuario);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }
    }
}
