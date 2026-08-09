using api.Application.DTOs.Avaliacao;
using api.Application.DTOs.Common;
using api.Application.Services.Interfaces;
using api.Domain;
using api.Domain.Interfaces;

namespace api.Application.Services
{
    public class AvaliacaoService(IAvaliacaoRepository repository) : IAvaliacaoService
    {
        private static AvaliacaoDto ToDto(Avaliacao entity) => new()
        {
            Id = entity.Id,
            ProdutoId = entity.ProdutoId,
            EmpresaId = entity.EmpresaId,
            UsuarioId = entity.UsuarioId,
            UsuarioNome = entity.Usuario?.Nome ?? string.Empty,
            Nota = entity.Nota,
            Comentario = entity.Comentario,
            CriadoEm = entity.CriadoEm,
            AtualizadoEm = entity.AtualizadoEm
        };

        public async Task<AvaliacaoDto> AvaliarAsync(Guid usuarioId, CreateAvaliacaoRequest request)
        {
            if (request.ProdutoId.HasValue == request.EmpresaId.HasValue)
                throw new InvalidOperationException("Informe produtoId OU empresaId, nunca os dois nem nenhum.");

            // Reavaliar (mesmo usuario + mesmo alvo) atualiza a avaliacao existente em vez de duplicar.
            // var existente = request.ProdutoId.HasValue
            //     ? await repository.GetByUsuarioEProdutoAsync(usuarioId, request.ProdutoId.Value)
            //     : await repository.GetByUsuarioEEmpresaAsync(usuarioId, request.EmpresaId!.Value);

            // if (existente != null)
            // {
            //     existente.AtualizarConteudo(request.Nota, request.Comentario);
            //     await repository.UpdateAsync(existente);
            //     return ToDto(existente);
            // }

            var nova = new Avaliacao(request.ProdutoId, request.EmpresaId, usuarioId, request.Nota, request.Comentario);
            await repository.AddAsync(nova);
            return ToDto(nova);
        }

        public async Task<PagedResult<AvaliacaoDto>> GetPagedByProdutoAsync(Guid produtoId, int page, int pageSize)
        {
            var (items, total) = await repository.GetPagedByProdutoAsync(produtoId, page, pageSize);
            return new PagedResult<AvaliacaoDto> { Page = page, PageSize = pageSize, TotalCount = total, Items = items.Select(ToDto) };
        }

        public async Task<PagedResult<AvaliacaoDto>> GetPagedByEmpresaAsync(Guid empresaId, int page, int pageSize)
        {
            var (items, total) = await repository.GetPagedByEmpresaAsync(empresaId, page, pageSize);
            return new PagedResult<AvaliacaoDto> { Page = page, PageSize = pageSize, TotalCount = total, Items = items.Select(ToDto) };
        }

        public async Task<AvaliacaoResumoDto> GetResumoByProdutoAsync(Guid produtoId)
        {
            var (media, total) = await repository.GetResumoByProdutoAsync(produtoId);
            return new AvaliacaoResumoDto { Media = media, Total = total };
        }

        public async Task<AvaliacaoResumoDto> GetResumoByEmpresaAsync(Guid empresaId)
        {
            var (media, total) = await repository.GetResumoByEmpresaAsync(empresaId);
            return new AvaliacaoResumoDto { Media = media, Total = total };
        }
    }
}
