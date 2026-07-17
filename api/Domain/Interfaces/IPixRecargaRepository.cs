namespace api.Domain.Interfaces
{
    public interface IPixRecargaRepository
    {
        Task<PixRecarga> AddAsync(PixRecarga pixRecarga);
        Task<PixRecarga?> GetByAbacatePayIdAsync(string abacatePayId);
        Task<PixRecarga?> GetByIdAsync(Guid id);
        Task UpdateAsync(PixRecarga pixRecarga);
    }
}
