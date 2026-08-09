using api.application.services;
using api.Application.DTOs.Categoria;
using api.Application.DTOs.Common;
using api.Application.Services.Interfaces;
using api.Domain;
using api.Domain.Interfaces;

namespace api.Application.Services
{
    public class CategoriaProdutoService : ServiceBase<CategoriaProduto, CategoriaProdutoDto>, ICategoriaProdutoService
    {
        private readonly ICategoriaProdutoRepository _categoriaProdutoRepository;

        public CategoriaProdutoService(ICategoriaProdutoRepository repository) : base(repository)
        {
            _categoriaProdutoRepository = repository;
        }

        protected override CategoriaProdutoDto ToDto(CategoriaProduto entity) => new()
        {
            Id = entity.Id,
            Nome = entity.Nome,
            Ativo = entity.Ativo,
            CriadoEm = entity.CriadoEm
        };

        public async Task<PagedResult<CategoriaProdutoDto>> SearchPagedAsync(int page, int pageSize, bool? ativo)
        {
            var (categorias, totalCount) = await _categoriaProdutoRepository.SearchPagedAsync(page, pageSize, ativo);

            return new PagedResult<CategoriaProdutoDto>
            {
                Page = page,
                PageSize = pageSize,
                TotalCount = totalCount,
                Items = categorias.Select(ToDto)
            };
        }

        public async Task<CategoriaProdutoDto> CriarAsync(string nome)
        {
            if (await _categoriaProdutoRepository.ExisteNomeAsync(nome))
                throw new InvalidOperationException("Já existe uma categoria com esse nome.");

            var categoria = new CategoriaProduto(nome);
            var criada = await _categoriaProdutoRepository.CreateAsync(categoria);
            return ToDto(criada);
        }

        public async Task<CategoriaProdutoDto?> AtualizarAsync(Guid id, string nome, bool ativo)
        {
            var categoria = await _categoriaProdutoRepository.GetByIdAsync(id);
            if (categoria == null) return null;

            if (await _categoriaProdutoRepository.ExisteNomeAsync(nome, id))
                throw new InvalidOperationException("Já existe uma categoria com esse nome.");

            categoria.Atualizar(nome, ativo);
            await _categoriaProdutoRepository.UpdateAsync(categoria);
            return ToDto(categoria);
        }
    }
}
