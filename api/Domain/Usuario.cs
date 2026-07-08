using System.Text.Json.Serialization;
using api.infra.auth;
using api.domain.enums;
using api.Domain;
using api.Domain.Enums.UsuarioEnums;

namespace api.domain
{
    public class Usuario
    {
        [JsonPropertyName("id")]
        public Guid Id { get; set; }

        [JsonPropertyName("nome")]
        public string Nome { get; set; } = null!;

        [JsonPropertyName("email")]
        public string Email { get; set; } = null!;

        [JsonIgnore]
        public string PasswordHash { get; set; } = null!;

        [JsonPropertyName("criado_em")]
        public DateTime CriadoEm { get; set; }

        [JsonPropertyName("atualizado_em")]
        public DateTime? AtualizadoEm { get; set; }

        [JsonPropertyName("status")]
        public UsuarioStatus Status { get; set; }

        [JsonPropertyName("cargo")]
        public UsuarioCargo Cargo { get; set; }

        [JsonIgnore]
        public virtual Carteira? Carteira { get; set; }

        public ICollection<UsuarioPermissao> UsuarioPermissoes { get; set; } = new List<UsuarioPermissao>();

        [JsonPropertyName("empresa_id")]
        public Guid EmpresaId { get; set; }

        [JsonIgnore]
        public Empresa? Empresa { get; set; }

        public Usuario() { }

        public Usuario(string nome, string email, string password, UsuarioCargo cargo, Guid empresaId)
        {
            Id = Guid.NewGuid();
            Carteira = new Carteira(Id);
            Nome = nome;
            Email = email;
            PasswordHash = PasswordHasher.HashPassword(password);
            CriadoEm = DateTime.UtcNow;
            Status = UsuarioStatus.Ativo;
            Cargo = cargo;
            EmpresaId = empresaId;
        }

        public bool VerifyPassword(string password)
        {
            return PasswordHasher.VerifyPassword(password, PasswordHash);
        }

        public void UpdatePassword(string newPassword)
        {
            PasswordHash = PasswordHasher.HashPassword(newPassword);
            AtualizadoEm = DateTime.UtcNow;
        }

        public void UpdateStatus(UsuarioStatus newStatus)
        {
            Status = newStatus;
            AtualizadoEm = DateTime.UtcNow;
        }

        public void UpdateNome(string newNome)
        {
            Nome = newNome;
            AtualizadoEm = DateTime.UtcNow;
        }

        public void UpdateEmail(string newEmail)
        {
            Email = newEmail;
            AtualizadoEm = DateTime.UtcNow;
        }
    }
}