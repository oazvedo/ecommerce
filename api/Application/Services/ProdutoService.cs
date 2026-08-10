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
        private readonly IAvaliacaoRepository _avaliacaoRepository;

        public ProdutoService(IProdutoRepository repository, IAvaliacaoRepository avaliacaoRepository) : base(repository)
        {
            _produtoRepository = repository;
            _avaliacaoRepository = avaliacaoRepository;
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
            Variantes = entity.Variantes,
            CategoriaId = entity.CategoriaId,
            CategoriaNome = entity.CategoriaProduto?.Nome,
            Tipo = entity.Tipo,
            ContratacaoPermitida = entity.ContratacaoPermitida,
            MaxParcelas = entity.MaxParcelas
        };

        public async Task<ProdutoDto?> UpdateAsync(Guid id, UpdateProdutoRequest request)
        {
            var produto = await _repository.GetByIdAsync(id);
            if (produto == null) return null;

            produto.AtualizarProduto(request.Nome, request.Descricao, request.Status, request.Codigo, request.Preco, request.Estoque, request.FreteGratis, request.Variantes, request.CategoriaId, request.Tipo, request.ContratacaoPermitida, request.MaxParcelas);
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

        public async Task<PagedResult<ProdutoDto>> SearchPagedAsync(
            int page, int pageSize, Guid? empresaId, string? nome, bool? disponivel, bool? freteGratis,
            decimal? precoMin, decimal? precoMax, string? orderBy, Guid? categoriaId)
        {
            var (produtos, totalCount) = await _produtoRepository.SearchPagedAsync(
                page, pageSize, empresaId, nome, disponivel, freteGratis, precoMin, precoMax, orderBy, categoriaId);
            var itens = produtos.ToList();

            // Uma unica query agregada pra pagina inteira, evitando N+1 (ver GetResumoByProdutosAsync).
            var resumos = await _avaliacaoRepository.GetResumoByProdutosAsync(itens.Select(p => p.Id));
            var dtos = itens.Select(p =>
            {
                var dto = ToDto(p);
                if (resumos.TryGetValue(p.Id, out var resumo))
                {
                    dto.NotaMedia = resumo.Media;
                    dto.TotalAvaliacoes = resumo.Total;
                }
                return dto;
            });

            return new PagedResult<ProdutoDto>
            {
                Page = page,
                PageSize = pageSize,
                TotalCount = totalCount,
                Items = dtos
            };
        }

        public override async Task<ProdutoDto?> GetByIdAsync(Guid id)
        {
            var dto = await base.GetByIdAsync(id);
            if (dto == null) return null;

            var (media, total) = await _avaliacaoRepository.GetResumoByProdutoAsync(id);
            dto.NotaMedia = media;
            dto.TotalAvaliacoes = total;
            return dto;
        }
    }
}
