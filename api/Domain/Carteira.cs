
using System.Text.Json.Serialization;
using api.domain;
using Newtonsoft.Json;

namespace api.Domain
{
    public class Carteira
    {
        [JsonPropertyName("id")]
        public Guid Id { get; set; }
        [JsonPropertyName("usuario_id")]
        public Guid UsuarioId { get; set; }

        public virtual Usuario Usuario { get; set; } = null!;

        [JsonPropertyName("saldo")]
        public double Saldo { get; set; } = 0;

        [JsonPropertyName("criado_em")]
        public DateTime CriadoEm {get; set;}

        [JsonPropertyName("atualizado_em")]
        public DateTime? AtualizadoEm {get; set;}

        public Carteira()
        {
        }

        public Carteira(Guid usuarioId)
        {
            Id = Guid.NewGuid();
            UsuarioId = usuarioId;
            CriadoEm = DateTime.UtcNow;
        }

        public void UpdateBalance(double input)
        {
            Saldo += input;
            AtualizadoEm = DateTime.UtcNow;
        }

        public void ApplyBonus(double input, string cupom)
        {
            if (cupom == "BONUS10")
            {
                var bonus = input * 0.10;
                Saldo += input + bonus;
                AtualizadoEm = DateTime.UtcNow;
            }

            if (cupom == "BONUS20")
            {
                var bonus = input * 0.20;
                Saldo += input + bonus;
                AtualizadoEm = DateTime.UtcNow;
            }

            if (cupom == "BONUS35")
            {
                var bonus = input * 0.35;
                Saldo += input + bonus;
                AtualizadoEm = DateTime.UtcNow;
            }
        }


    }
}