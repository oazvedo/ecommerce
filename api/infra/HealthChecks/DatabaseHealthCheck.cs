using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace api.infra.HealthChecks
{
    public class DatabaseHealthCheck : IHealthCheck
    {
        private readonly DatabaseContext _context;

        public DatabaseHealthCheck(DatabaseContext context)
        {
            _context = context;
        }

        public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
        {
            try
            {
                var canConnect = await _context.Database.CanConnectAsync(cancellationToken);
                return canConnect
                    ? HealthCheckResult.Healthy("Conexão com o banco de dados OK.")
                    : HealthCheckResult.Unhealthy("Não foi possível conectar ao banco de dados.");
            }
            catch (Exception ex)
            {
                return HealthCheckResult.Unhealthy("Falha ao verificar conexão com o banco de dados.", ex);
            }
        }
    }
}
