using api.domain;
using api.Domain.Enums.UsuarioEnums;

namespace api.Domain
{
    public class CargoPermissao
    {
        public UsuarioCargo Cargo { get; set; }
        public Guid PermissaoId { get; set; }
        public Permissao Permissao { get; set; } = null!;
    }
}
