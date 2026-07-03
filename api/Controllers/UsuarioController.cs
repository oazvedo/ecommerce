using api.application.dtos.usuario;
using api.Application.DTOs.Common;
using api.Application.DTOs.Usuario;
using api.application.services.interfaces;
using api.domain;
using api.domain.interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsuarioController : ControllerBase
    {
        private readonly IUsuarioService _service;

        public UsuarioController(IUsuarioService usuarioService)
        {
            _service = usuarioService;
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
        [Authorize(Policy = "Usuario.Read")]
        public async Task<ActionResult<UsuarioDto>> GetUsuario(Guid id)
        {
            try
            {
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
        public async Task<ActionResult<UsuarioDto>> CreateUsuario(CreateUsuarioRequest request)
        {
            try
            {
                var usuario = new Usuario(request.Nome, request.Email, request.Password);
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

        [HttpPut("{id}/password")]
        [Authorize(Policy = "Usuario.PasswordUpdate")]
        public async Task<IActionResult> UpdateUsuarioPassword(Guid id, UpdatePasswordRequest request)
        {
            try
            {
                var atualizado = await _service.UpdatePasswordAsync(id, request.Password);
                if (!atualizado)
                    return NotFound(new { mensagem = "Usuário não encontrado." });

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
