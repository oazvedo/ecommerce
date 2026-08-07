using api.Domain.Enums.UsuarioEnums;

namespace api.Domain.Interfaces
{
    public interface ICargoPermissaoRepository
    {
        Task<IEnumerable<CargoPermissao>> GetAllAsync();
        Task<IEnumerable<CargoPermissao>> GetByCargoAsync(UsuarioCargo cargo);
        Task SetCargoPermissoesAsync(UsuarioCargo cargo, IEnumerable<Guid> permissaoIds);
    }
}
