namespace api.Application.Services.Interfaces
{
    public interface IAbacatePayService
    {
        Task<(string Id, string BrCode, string BrCodeBase64)> CriarPixAsync(double valorEmReais, string descricao);
    }
}
