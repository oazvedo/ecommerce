using api.domain;
using api.domain.interfaces;

namespace api.Domain.Interfaces
{
    public interface IEmpresaRepository : IRepositoryBase<Empresa>
    {
        Task<(IEnumerable<Produto> Items, int TotalCount)> GetProdutosAsync(Guid empresaId, int page, int pageSize);
        Task<(IEnumerable<Usuario> Items, int TotalCount)> GetUsuariosAsync(Guid empresaId, int page, int pageSize);
        Task<bool> AdicionarUsuarioAsync(Guid empresaId, Guid usuarioId);
    }
}