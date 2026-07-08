using api.application.services.interfaces;
using api.Application.DTOs.Empresa;
using api.Domain;

namespace api.Application.Services.Interfaces
{
    public interface IEmpresaService : IServiceBase<Empresa, EmpresaDto>
    {
        
    }
}