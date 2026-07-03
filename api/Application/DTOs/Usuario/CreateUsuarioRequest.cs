
using api.Domain.Enums.UsuarioEnums;

namespace api.application.dtos.usuario
{
    public class CreateUsuarioRequest
    {
        public required string Nome { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; }
    }
}