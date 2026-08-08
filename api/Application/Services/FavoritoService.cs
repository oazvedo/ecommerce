using api.Application.DTOs.Common;
using api.Application.DTOs.Produto;
using api.Application.Services.Interfaces;
using api.Domain;
using api.Domain.Interfaces;

namespace api.Application.Services
{
    public class FavoritoService(IFavoritoRepository repository, IAvaliacaoRepository avaliacaoRepository) : IFavoritoService
    {
        private static ProdutoDto ToDto(Produto entity) => new()
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

        public async Task AdicionarAsync(Guid usuarioId, Guid produtoId)
        {
            // Idempotente: favoritar de novo nao duplica nem lanca erro.
            var existente = await repository.GetByUsuarioEProdutoAsync(usuarioId, produtoId);
            if (existente != null) return;

            await repository.AddAsync(new Favorito(usuarioId, produtoId));
        }

        public async Task RemoverAsync(Guid usuarioId, Guid produtoId)
        {
            var existente = await repository.GetByUsuarioEProdutoAsync(usuarioId, produtoId);
            if (existente == null) return;

            await repository.RemoveAsync(existente);
        }

        public async Task<bool> EstaFavoritadoAsync(Guid usuarioId, Guid produtoId) =>
            await repository.GetByUsuarioEProdutoAsync(usuarioId, produtoId) != null;

        public Task<HashSet<Guid>> GetProdutoIdsFavoritadosAsync(Guid usuarioId) =>
            repository.GetProdutoIdsByUsuarioAsync(usuarioId);

        public async Task<PagedResult<ProdutoDto>> GetPagedAsync(Guid usuarioId, int page, int pageSize)
        {
            var (produtos, totalCount) = await repository.GetPagedProdutosByUsuarioAsync(usuarioId, page, pageSize);
            var itens = produtos.ToList();

            var resumos = await avaliacaoRepository.GetResumoByProdutosAsync(itens.Select(p => p.Id));
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

            return new PagedResult<ProdutoDto> { Page = page, PageSize = pageSize, TotalCount = totalCount, Items = dtos };
        }
    }
}
