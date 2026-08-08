namespace api.Domain.Interfaces
{
    public interface IFavoritoRepository
    {
        Task<Favorito?> GetByUsuarioEProdutoAsync(Guid usuarioId, Guid produtoId);
        Task AddAsync(Favorito favorito);
        Task RemoveAsync(Favorito favorito);
        Task<HashSet<Guid>> GetProdutoIdsByUsuarioAsync(Guid usuarioId);
        Task<(IEnumerable<Produto> Items, int TotalCount)> GetPagedProdutosByUsuarioAsync(Guid usuarioId, int page, int pageSize);
    }
}
