namespace api.infra.auth
{
    public class JwtSettings
    {
        public string Issuer { get; set; } = null!;
        public string Audience { get; set; } = null!;
        public string Secret { get; set; } = null!;
        public int RefreshTokenExpiryDays { get; set; } = 7;
    }
}
