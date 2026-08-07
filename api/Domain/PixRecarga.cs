using api.Domain.Enums.PixRecargaEnums;

namespace api.Domain
{
    public class PixRecarga
    {
        public Guid Id { get; set; }
        public Guid CarteiraId { get; set; }
        public string AbacatePayId { get; set; } = string.Empty;
        public double Valor { get; set; }
        public PixRecargaStatus Status { get; set; }
        public DateTime CriadoEm { get; set; }
        public DateTime? PagoEm { get; set; }

        public PixRecarga() { }

        public PixRecarga(Guid carteiraId, string abacatePayId, double valor)
        {
            Id = Guid.NewGuid();
            CarteiraId = carteiraId;
            AbacatePayId = abacatePayId;
            Valor = valor;
            Status = PixRecargaStatus.Pendente;
            CriadoEm = DateTime.UtcNow;
        }

        public void Confirmar()
        {
            Status = PixRecargaStatus.Concluido;
            PagoEm = DateTime.UtcNow;
        }
    }
}
