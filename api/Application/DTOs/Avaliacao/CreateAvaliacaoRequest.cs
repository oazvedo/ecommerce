namespace api.Application.DTOs.Avaliacao
{
    public class CreateAvaliacaoRequest
    {
        // Informe produtoId OU empresaId — nunca os dois.
        public Guid? ProdutoId { get; set; }
        public Guid? EmpresaId { get; set; }
        public int Nota { get; set; }
        public string? Comentario { get; set; }
    }
}
