using api.domain;

namespace api.Domain
{
    public class RefreshToken
    {
        public Guid Id { get; set; }
        public Guid UsuarioId { get; set; }
        public Usuario? Usuario { get; set; }
        public string Token { get; set; } = null!;
        public DateTime ExpiresAt { get; set; }
        public bool Revogado { get; set; }
        public DateTime CriadoEm { get; set; }

        public RefreshToken() { }

        public RefreshToken(Guid usuarioId, string token, int expiryDays)
        {
            Id = Guid.NewGuid();
            UsuarioId = usuarioId;
            Token = token;
            ExpiresAt = DateTime.UtcNow.AddDays(expiryDays);
            Revogado = false;
            CriadoEm = DateTime.UtcNow;
        }

        public bool EstaValido() => !Revogado && ExpiresAt > DateTime.UtcNow;
    }
}
