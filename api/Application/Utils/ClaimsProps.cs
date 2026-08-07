using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace api.Application.Utils
{
    public static class ClaimsProps
    {
        public static Guid GetId(this ClaimsPrincipal user)
        {
            var value = user.FindFirstValue(JwtRegisteredClaimNames.Sub)
                        ?? user.FindFirstValue(ClaimTypes.NameIdentifier);

            return Guid.TryParse(value, out var id) ? id : Guid.Empty;
        }

        public static string? GetEmail(this ClaimsPrincipal user)
            => user.FindFirstValue(JwtRegisteredClaimNames.Email)
               ?? user.FindFirstValue(ClaimTypes.Email);

        public static string? GetNome(this ClaimsPrincipal user)
            => user.FindFirstValue(JwtRegisteredClaimNames.UniqueName)
               ?? user.FindFirstValue(ClaimTypes.Name);

        public static string? GetCargo(this ClaimsPrincipal user)
            => user.FindFirstValue("Cargo");

        public static Guid GetEmpresaId(this ClaimsPrincipal user)
        {
            var value = user.FindFirstValue("EmpresaId");
            return Guid.TryParse(value, out var id) ? id : Guid.Empty;
        }

        public static IEnumerable<string> GetPermissoes(this ClaimsPrincipal user)
            => user.FindAll("Permission").Select(c => c.Value);

        public static bool HasPermissao(this ClaimsPrincipal user, string permissao)
            => user.HasClaim("Permission", permissao);
    }
}
