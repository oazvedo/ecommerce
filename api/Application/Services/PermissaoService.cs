using api.Application.DTOs.Common;
using api.Application.DTOs.Permissao;
using api.application.services.interfaces;
using api.domain.interfaces;
using api.domain;

namespace api.application.services
{
    public class PermissaoService : IPermissaoService
    {
        private readonly IPermissaoRepository _repository;

        public PermissaoService(IPermissaoRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<PermissaoDto>> GetAllAsync()
        {
            var permissoes = await _repository.GetAllAsync();
            return permissoes.Select(ToDto);
        }

        public async Task<PagedResult<PermissaoDto>> GetAllAsync(int page, int pageSize)
        {
            var permissoes = await _repository.GetAllAsync();
            var totalCount = permissoes.Count();
            var items = permissoes.Skip((page - 1) * pageSize).Take(pageSize);

            return new PagedResult<PermissaoDto>
            {
                Page = page,
                PageSize = pageSize,
                TotalCount = totalCount,
                Items = items.Select(ToDto)
            };
        }

        public async Task<IEnumerable<PermissaoDto>> GetByUsuarioIdAsync(Guid usuarioId)
        {
            var permissoes = await _repository.GetByUsuarioIdAsync(usuarioId);
            return permissoes.Select(ToDto);
        }

        public Task<bool> RemoverTodasPermissoesAsync(Guid usuarioId)
            => _repository.RemoverTodasAsync(usuarioId);

        private static PermissaoDto ToDto(Permissao permissao) => new()
        {
            Id = permissao.Id,
            Nome = permissao.Nome,
            Descricao = permissao.Descricao
        };

        public Task<bool> AdicionarAsync(Guid usuarioId, Guid permissaoId)
            => _repository.AdicionarAsync(usuarioId, permissaoId);

        public Task<bool> RemoverAsync(Guid usuarioId, Guid permissaoId)
            => _repository.RemoverAsync(usuarioId, permissaoId);
    }
}
