using api.application.services.interfaces;
using api.Application.DTOs.Auditoria;
using api.Domain;

namespace api.Application.Services.Interfaces
{
    public interface IAuditoriaService : IServiceBase<AuditoriaLog, AuditoriaLogDto>
    {
        /// <summary>Registra uma ação sensível de admin/empresa. Falhas de escrita são logadas e engolidas — nunca derrubam a ação de negócio.</summary>
        Task RegistrarAsync(Guid autorId, string autorNome, string acao, string entidade, Guid? entidadeId = null, Guid? empresaId = null, string? detalhes = null);
    }
}
