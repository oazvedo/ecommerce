using api.Domain.Enums.UsuarioEnums;

namespace api.application.dtos.usuario
{
    public class UpdateUsuarioRequest
    {
        public required string Nome { get; set; }
        public required string Email { get; set; }
        public UsuarioCargo? Cargo { get; set; }
    }
}
