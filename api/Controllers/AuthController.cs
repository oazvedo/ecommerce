using api.application.dtos;
using api.infra.auth;
using api.domain.interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IUsuarioRepository _repository;
        private readonly JwtSettings _jwtSettings;

        public AuthController(IUsuarioRepository repository, JwtSettings jwtSettings)
        {
            _repository = repository;
            _jwtSettings = jwtSettings;
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] AuthRequest request)
        {
            try
            {
                var usuario = await _repository.GetByEmailAsync(request.Email);
                if (usuario == null || !usuario.VerifyPassword(request.Password))
                    return Unauthorized();

                var token = TokenService.GenerateToken(usuario, _jwtSettings);
                return Ok(new { access_token = token, token_type = "Bearer" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }
    }
}
