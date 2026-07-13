using api.Domain.Enums.CarteiraEnums;

namespace api.Domain
{
    public class CarteiraTransacao
    {
        public Guid Id { get; set; }
        public Guid CarteiraId { get; set; }
        public CarteiraTransacaoTipo Tipo { get; set; }
        public double Valor { get; set; }
        public string? Descricao { get; set; }
        public Guid? ReferenciaId { get; set; }
        public DateTime OcorridoEm { get; set; }

        public CarteiraTransacao() { }

        public CarteiraTransacao(Guid carteiraId, CarteiraTransacaoTipo tipo, double valor, string? descricao = null, Guid? referenciaId = null)
        {
            Id = Guid.NewGuid();
            CarteiraId = carteiraId;
            Tipo = tipo;
            Valor = valor;
            Descricao = descricao;
            ReferenciaId = referenciaId;
            OcorridoEm = DateTime.UtcNow;
        }
    }
}
