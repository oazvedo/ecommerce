namespace api.Application.DTOs.Categoria
{
    public class CategoriaProdutoDto
    {
        public Guid Id { get; set; }
        public string Nome { get; set; } = null!;
        public bool Ativo { get; set; }
        public DateTime CriadoEm { get; set; }
    }
}
