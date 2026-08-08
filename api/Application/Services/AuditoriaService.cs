using api.application.services;
using api.Application.DTOs.Auditoria;
using api.Application.Services.Interfaces;
using api.Domain;
using api.domain.interfaces;
using Microsoft.Extensions.Logging;

namespace api.Application.Services
{
    public class AuditoriaService : ServiceBase<AuditoriaLog, AuditoriaLogDto>, IAuditoriaService
    {
        private readonly ILogger<AuditoriaService> _logger;

        public AuditoriaService(IRepositoryBase<AuditoriaLog> repository, ILogger<AuditoriaService> logger) : base(repository)
        {
            _logger = logger;
        }

        protected override AuditoriaLogDto ToDto(AuditoriaLog entity) => new()
        {
            Id = entity.Id,
            AutorId = entity.AutorId,
            AutorNome = entity.AutorNome,
            Acao = entity.Acao,
            Entidade = entity.Entidade,
            EntidadeId = entity.EntidadeId,
            EmpresaId = entity.EmpresaId,
            Detalhes = entity.Detalhes,
            OcorridoEm = entity.OcorridoEm
        };

        public async Task RegistrarAsync(Guid autorId, string autorNome, string acao, string entidade, Guid? entidadeId = null, Guid? empresaId = null, string? detalhes = null)
        {
            try
            {
                await _repository.CreateAsync(new AuditoriaLog
                {
                    Id = Guid.NewGuid(),
                    AutorId = autorId,
                    AutorNome = autorNome,
                    Acao = acao,
                    Entidade = entidade,
                    EntidadeId = entidadeId,
                    EmpresaId = empresaId,
                    Detalhes = detalhes,
                    OcorridoEm = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                // Auditoria não pode derrubar a ação de negócio que a originou.
                _logger.LogError(ex, "Falha ao registrar log de auditoria: {Acao} em {Entidade} ({EntidadeId})", acao, entidade, entidadeId);
            }
        }
    }
}
