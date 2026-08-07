using api.application.dtos;
using api.infra.auth;
using api.domain.interfaces;
using api.Domain;
using api.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IUsuarioRepository _usuarioRepository;
        private readonly IRefreshTokenRepository _refreshTokenRepository;
        private readonly ICargoPermissaoRepository _cargoPermissaoRepository;
        private readonly JwtSettings _jwtSettings;

        public AuthController(
            IUsuarioRepository usuarioRepository,
            IRefreshTokenRepository refreshTokenRepository,
            ICargoPermissaoRepository cargoPermissaoRepository,
            JwtSettings jwtSettings)
        {
            _usuarioRepository = usuarioRepository;
            _refreshTokenRepository = refreshTokenRepository;
            _cargoPermissaoRepository = cargoPermissaoRepository;
            _jwtSettings = jwtSettings;
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] AuthRequest request)
        {
            try
            {
                var usuario = await _usuarioRepository.GetByEmailAsync(request.Email);
                if (usuario == null || !usuario.VerifyPassword(request.Password))
                    return Unauthorized();

                var cargoPerms = await _cargoPermissaoRepository.GetByCargoAsync(usuario.Cargo);
                var cargoPermNames = cargoPerms.Select(cp => cp.Permissao.Nome);
                var accessToken = TokenService.GenerateToken(usuario, _jwtSettings, cargoPermNames);
                var refreshTokenValue = TokenService.GenerateRefreshToken();

                var refreshToken = new RefreshToken(usuario.Id, refreshTokenValue, _jwtSettings.RefreshTokenExpiryDays);
                await _refreshTokenRepository.CreateAsync(refreshToken);

                return Ok(new
                {
                    access_token = accessToken,
                    refresh_token = refreshTokenValue,
                    token_type = "Bearer"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }

        [HttpPost("refresh")]
        [AllowAnonymous]
        public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequest request)
        {
            var refreshToken = await _refreshTokenRepository.GetByTokenAsync(request.RefreshToken);

            if (refreshToken is null || !refreshToken.EstaValido())
                return Unauthorized(new { mensagem = "Refresh token inválido ou expirado." });

            await _refreshTokenRepository.RevogarAsync(request.RefreshToken);

            var novoRefreshTokenValue = TokenService.GenerateRefreshToken();
            var novoRefreshToken = new RefreshToken(refreshToken.UsuarioId, novoRefreshTokenValue, _jwtSettings.RefreshTokenExpiryDays);
            await _refreshTokenRepository.CreateAsync(novoRefreshToken);

            var usuarioRefresh = await _usuarioRepository.GetByIdAsync(refreshToken.UsuarioId);
            if (usuarioRefresh == null) return Unauthorized(new { mensagem = "Usuário não encontrado." });
            var cargoPermsRefresh = await _cargoPermissaoRepository.GetByCargoAsync(usuarioRefresh.Cargo);
            var accessToken = TokenService.GenerateToken(usuarioRefresh, _jwtSettings, cargoPermsRefresh.Select(cp => cp.Permissao.Nome));

            return Ok(new
            {
                access_token = accessToken,
                refresh_token = novoRefreshTokenValue,
                token_type = "Bearer"
            });
        }

        [HttpPost("revoke")]
        [Authorize]
        public async Task<IActionResult> Revoke([FromBody] RefreshTokenRequest request)
        {
            await _refreshTokenRepository.RevogarAsync(request.RefreshToken);
            return NoContent();
        }
    }
}
