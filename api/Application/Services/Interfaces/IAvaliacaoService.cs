using api.Application.DTOs.Avaliacao;
using api.Application.DTOs.Common;

namespace api.Application.Services.Interfaces
{
    public interface IAvaliacaoService
    {
        Task<AvaliacaoDto> AvaliarAsync(Guid usuarioId, CreateAvaliacaoRequest request);
        Task<PagedResult<AvaliacaoDto>> GetPagedByProdutoAsync(Guid produtoId, int page, int pageSize);
        Task<PagedResult<AvaliacaoDto>> GetPagedByEmpresaAsync(Guid empresaId, int page, int pageSize);
        Task<AvaliacaoResumoDto> GetResumoByProdutoAsync(Guid produtoId);
        Task<AvaliacaoResumoDto> GetResumoByEmpresaAsync(Guid empresaId);
    }
}
