namespace api.Domain.Interfaces
{
    public interface ICarteiraTransacaoRepository
    {
        Task AddAsync(CarteiraTransacao transacao);
        Task<IEnumerable<CarteiraTransacao>> GetByCarteiraIdAsync(Guid carteiraId);
    }
}
