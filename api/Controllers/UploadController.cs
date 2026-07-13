using api.infra;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace api.Controllers
{
    [ApiController]
    [Route("api/upload")]
    [Authorize]
    public class UploadController : ControllerBase
    {
        private readonly DatabaseContext _db;
        private readonly IWebHostEnvironment _env;

        private static readonly HashSet<string> _allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
        private const long MaxBytes = 5 * 1024 * 1024; // 5 MB

        public UploadController(DatabaseContext db, IWebHostEnvironment env)
        {
            _db = db;
            _env = env;
        }

        [HttpPost("usuario/{id:guid}")]
        public async Task<IActionResult> UploadUsuario(Guid id, IFormFile file)
        {
            var usuario = await _db.Usuarios.FindAsync(id);
            if (usuario is null) return NotFound();

            var url = await SaveFile("usuarios", id, file);
            if (url is null) return BadRequest(new { mensagem = "Arquivo inválido. Use JPG, PNG ou WebP até 5 MB." });

            if (usuario.FotoUrl is not null)
                DeleteOldFile(usuario.FotoUrl);

            usuario.FotoUrl = url;
            await _db.SaveChangesAsync();

            return Ok(new { url });
        }

        [HttpPost("produto/{id:guid}")]
        public async Task<IActionResult> UploadProduto(Guid id, IFormFile file)
        {
            var produto = await _db.Produtos.FindAsync(id);
            if (produto is null) return NotFound();

            var url = await SaveFile("produtos", id, file);
            if (url is null) return BadRequest(new { mensagem = "Arquivo inválido. Use JPG, PNG ou WebP até 5 MB." });

            if (produto.ImagemUrl is not null)
                DeleteOldFile(produto.ImagemUrl);

            produto.ImagemUrl = url;
            await _db.SaveChangesAsync();

            return Ok(new { url });
        }

        [HttpPost("empresa/{id:guid}")]
        public async Task<IActionResult> UploadEmpresa(Guid id, IFormFile file)
        {
            var empresa = await _db.Empresas.FindAsync(id);
            if (empresa is null) return NotFound();

            var url = await SaveFile("empresas", id, file);
            if (url is null) return BadRequest(new { mensagem = "Arquivo inválido. Use JPG, PNG ou WebP até 5 MB." });

            if (empresa.LogoUrl is not null)
                DeleteOldFile(empresa.LogoUrl);

            empresa.LogoUrl = url;
            await _db.SaveChangesAsync();

            return Ok(new { url });
        }

        private async Task<string?> SaveFile(string pasta, Guid id, IFormFile file)
        {
            if (file is null || file.Length == 0 || file.Length > MaxBytes)
                return null;

            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!_allowedExtensions.Contains(ext))
                return null;

            var uploadsRoot = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", pasta);
            Directory.CreateDirectory(uploadsRoot);

            var fileName = $"{id}{ext}";
            var filePath = Path.Combine(uploadsRoot, fileName);

            using var stream = System.IO.File.Create(filePath);
            await file.CopyToAsync(stream);

            return $"/uploads/{pasta}/{fileName}";
        }

        private void DeleteOldFile(string url)
        {
            try
            {
                var relativePath = url.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
                var wwwroot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                var fullPath = Path.Combine(wwwroot, relativePath);
                if (System.IO.File.Exists(fullPath))
                    System.IO.File.Delete(fullPath);
            }
            catch { /* não bloqueia o fluxo se falhar */ }
        }
    }
}
