using api.application.services;
using api.Application.DTOs.Common;
using api.Application.DTOs.Produto;
using api.Application.Services.Interfaces;
using api.Domain;
using api.Domain.Interfaces;

namespace api.Application.Services
{
    public class ProdutoService : ServiceBase<Produto, ProdutoDto>, IProdutoService
    {
        private readonly IProdutoRepository _produtoRepository;

        public ProdutoService(IProdutoRepository repository) : base(repository)
        {
            _produtoRepository = repository;
        }

        protected override ProdutoDto ToDto(Produto entity) => new()
        {
            Id = entity.Id,
            Nome = entity.Nome,
            Descricao = entity.Descricao,
            Codigo = entity.Codigo,
            Status = entity.Status,
            Preco = entity.Preco,
            CriadoEm = entity.CriadoEm,
            AtualizadoEm = entity.AtualizadoEm,
            EmpresaId = entity.EmpresaId,
            ImagemUrl = entity.ImagemUrl,
            Estoque = entity.Estoque,
            FreteGratis = entity.FreteGratis,
            Variantes = entity.Variantes
        };

        public async Task<ProdutoDto?> UpdateAsync(Guid id, UpdateProdutoRequest request)
        {
            var produto = await _repository.GetByIdAsync(id);
            if (produto == null) return null;

            produto.AtualizarProduto(request.Nome, request.Descricao, request.Status, request.Codigo, request.Preco, request.Estoque, request.FreteGratis, request.Variantes);
            await _repository.UpdateAsync(produto);
            return ToDto(produto);
        }

        public async Task AtualizarImagemAsync(Guid id, string url)
        {
            var produto = await _repository.GetByIdAsync(id);
            if (produto == null) return;
            produto.ImagemUrl = url;
            produto.AtualizadoEm = DateTime.UtcNow;
            await _repository.UpdateAsync(produto);
        }

        public async Task<PagedResult<ProdutoDto>> GetPagedByEmpresaAsync(Guid empresaId, int page, int pageSize)
        {
            var (produtos, totalCount) = await _produtoRepository.GetPagedByEmpresaAsync(empresaId, page, pageSize);
            return new PagedResult<ProdutoDto>
            {
                Page = page,
                PageSize = pageSize,
                TotalCount = totalCount,
                Items = produtos.Select(ToDto)
            };
        }
    }
}
