namespace api.Domain.Interfaces
{
    public interface IAvaliacaoRepository
    {
        Task<Avaliacao?> GetByUsuarioEProdutoAsync(Guid usuarioId, Guid produtoId);
        Task<Avaliacao?> GetByUsuarioEEmpresaAsync(Guid usuarioId, Guid empresaId);
        Task<Avaliacao> AddAsync(Avaliacao avaliacao);
        Task UpdateAsync(Avaliacao avaliacao);

        Task<(IEnumerable<Avaliacao> Items, int TotalCount)> GetPagedByProdutoAsync(Guid produtoId, int page, int pageSize);
        Task<(IEnumerable<Avaliacao> Items, int TotalCount)> GetPagedByEmpresaAsync(Guid empresaId, int page, int pageSize);

        Task<(double Media, int Total)> GetResumoByProdutoAsync(Guid produtoId);
        Task<(double Media, int Total)> GetResumoByEmpresaAsync(Guid empresaId);

        // Batch: evita N+1 ao calcular a media de varios produtos de uma vez (ex: grade do catalogo).
        Task<Dictionary<Guid, (double Media, int Total)>> GetResumoByProdutosAsync(IEnumerable<Guid> produtoIds);
    }
}
