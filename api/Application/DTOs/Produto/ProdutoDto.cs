namespace api.Application.DTOs.Produto
{
    public class ProdutoDto
    {
        public Guid Id { get; set; }
        public string Nome { get; set; } = null!;
        public string Descricao { get; set; } = null!;
        public string Codigo { get; set; } = null!;
        public bool Status { get; set; }
        public decimal Preco { get; set; }
        public DateTime CriadoEm { get; set; }
        public DateTime? AtualizadoEm { get; set; }
        public Guid EmpresaId { get; set; }
    }
}
