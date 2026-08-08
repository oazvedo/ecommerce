namespace api.Domain
{
    public class Favorito
    {
        public Guid Id { get; set; }
        public Guid UsuarioId { get; set; }
        public Guid ProdutoId { get; set; }
        public DateTime CriadoEm { get; set; }

        public Favorito() { }

        public Favorito(Guid usuarioId, Guid produtoId)
        {
            Id = Guid.NewGuid();
            UsuarioId = usuarioId;
            ProdutoId = produtoId;
            CriadoEm = DateTime.UtcNow;
        }
    }
}
