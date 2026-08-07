using api.application.services.interfaces;
using api.Application.DTOs.Common;
using api.Application.DTOs.Empresa;
using api.Application.DTOs.Produto;
using api.Application.DTOs.Usuario;
using api.Domain;

namespace api.Application.Services.Interfaces
{
    public interface IEmpresaService : IServiceBase<Empresa, EmpresaDto>
    {
        Task<PagedResult<ProdutoDto>> GetProdutosAsync(Guid empresaId, int page, int pageSize);
        Task<PagedResult<UsuarioDto>> GetUsuariosAsync(Guid empresaId, int page, int pageSize);
        Task<PagedResult<EmpresaDto>> GetFiliaisAsync(Guid empresaPaiId, int page, int pageSize);
        Task<bool> AdicionarUsuarioAsync(Guid empresaId, Guid usuarioId);
        Task<bool> DeleteComCascadeAsync(Guid empresaId);
        Task<EmpresaDto?> UpdateCamposAsync(Guid id, UpdateEmpresaRequest request);
        Task AtualizarLogoAsync(Guid id, string url);
        /// <summary>Escopo de gestão (1 nível): a empresa do usuário controla a si mesma e suas filiais diretas.</summary>
        Task<bool> PodeGerenciarAsync(Guid usuarioEmpresaId, Guid targetEmpresaId);
    }
}