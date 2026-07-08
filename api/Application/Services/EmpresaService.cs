using api.application.services;
using api.Application.DTOs.Empresa;
using api.Application.Services.Interfaces;
using api.Domain;
using api.Domain.Interfaces;

namespace api.Application.Services
{
    public class EmpresaService : ServiceBase<Empresa, EmpresaDto>, IEmpresaService
    {
        public EmpresaService(IEmpresaRepository repository) : base(repository) { }

        protected override EmpresaDto ToDto(Empresa entity) => new()
        {
            Id = entity.Id,
            Nome = entity.Nome,
            Cnpj = entity.Cnpj,
            Responsavel = entity.Responsavel,
            ResponsavelId = entity.ResponsavelId,
            Telefone = entity.Telefone,
            Tipo = entity.Tipo,
            Status = entity.Status,
            CriadoEm = entity.CriadoEm,
            AtualizadoEm = entity.AtualizadoEm
        };
    }
}
