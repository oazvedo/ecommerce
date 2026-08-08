namespace api.Domain
{
    public class AuditoriaLog
    {
        public Guid Id { get; set; }
        public Guid AutorId { get; set; }
        public string AutorNome { get; set; } = string.Empty;
        public string Acao { get; set; } = string.Empty;
        public string Entidade { get; set; } = string.Empty;
        public Guid? EntidadeId { get; set; }
        public Guid? EmpresaId { get; set; }
        public string? Detalhes { get; set; }
        public DateTime OcorridoEm { get; set; }
    }
}
