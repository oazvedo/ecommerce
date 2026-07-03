using api.Domain;
using api.Domain.Interfaces;

namespace api.infra.repository
{
    public class EmpresaRepository : RepositoryBase<Empresa>, IEmpresaRepository
    {
        public EmpresaRepository(DatabaseContext context) : base(context) {}
    }
}