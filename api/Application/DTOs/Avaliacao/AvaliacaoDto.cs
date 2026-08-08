namespace api.Application.DTOs.Avaliacao
{
    public class AvaliacaoDto
    {
        public Guid Id { get; set; }
        public Guid? ProdutoId { get; set; }
        public Guid? EmpresaId { get; set; }
        public Guid UsuarioId { get; set; }
        public string UsuarioNome { get; set; } = null!;
        public int Nota { get; set; }
        public string? Comentario { get; set; }
        public DateTime CriadoEm { get; set; }
        public DateTime? AtualizadoEm { get; set; }
    }
}
