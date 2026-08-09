using api.infra;
using api.infra.HealthChecks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Xunit;

namespace api.Tests.Infra
{
    public class DatabaseHealthCheckTests
    {
        private static DatabaseContext CreateContext()
        {
            var options = new DbContextOptionsBuilder<DatabaseContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;
            return new DatabaseContext(options);
        }

        [Fact]
        public async Task CheckHealthAsync_QuandoConsegueConectar_DeveRetornarHealthy()
        {
            using var context = CreateContext();
            var healthCheck = new DatabaseHealthCheck(context);

            var result = await healthCheck.CheckHealthAsync(new HealthCheckContext());

            Assert.Equal(HealthStatus.Healthy, result.Status);
        }

        [Fact]
        public async Task CheckHealthAsync_QuandoContextoFoiDescartado_DeveRetornarUnhealthy()
        {
            var context = CreateContext();
            context.Dispose();
            var healthCheck = new DatabaseHealthCheck(context);

            var result = await healthCheck.CheckHealthAsync(new HealthCheckContext());

            Assert.Equal(HealthStatus.Unhealthy, result.Status);
            Assert.NotNull(result.Exception);
        }
    }
}
