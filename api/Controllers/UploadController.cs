using api.application.services.interfaces;
using api.Application.Services.Interfaces;
using api.Application.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers
{
    [ApiController]
    [Route("api/upload")]
    [Authorize]
    public class UploadController : ControllerBase
    {
        private readonly IUsuarioService _usuarioService;
        private readonly IProdutoService _produtoService;
        private readonly IEmpresaService _empresaService;
        private readonly IWebHostEnvironment _env;

        private static readonly HashSet<string> _allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
        private const long MaxBytes = 5 * 1024 * 1024; // 5 MB

        public UploadController(IUsuarioService usuarioService, IProdutoService produtoService, IEmpresaService empresaService, IWebHostEnvironment env)
        {
            _usuarioService = usuarioService;
            _produtoService = produtoService;
            _empresaService = empresaService;
            _env = env;
        }

        [HttpPost("usuario/{id:guid}")]
        public async Task<IActionResult> UploadUsuario(Guid id, IFormFile file)
        {
            // Qualquer autenticado troca a própria foto; trocar a de outro exige Usuario.Update.
            if (id != User.GetId() && !User.HasPermissao("Usuario.Update"))
                return Forbid();

            var usuario = await _usuarioService.GetByIdAsync(id);
            if (usuario is null) return NotFound();

            var url = await SaveFile("usuarios", id, file);
            if (url is null) return BadRequest(new { mensagem = "Arquivo inválido. Use JPG, PNG ou WebP até 5 MB." });

            if (usuario.FotoUrl is not null)
                DeleteOldFile(usuario.FotoUrl);

            await _usuarioService.AtualizarFotoAsync(id, url);

            return Ok(new { url });
        }

        [HttpPost("produto/{id:guid}")]
        public async Task<IActionResult> UploadProduto(Guid id, IFormFile file)
        {
            var produto = await _produtoService.GetByIdAsync(id);
            if (produto is null) return NotFound();

            var url = await SaveFile("produtos", id, file);
            if (url is null) return BadRequest(new { mensagem = "Arquivo inválido. Use JPG, PNG ou WebP até 5 MB." });

            if (produto.ImagemUrl is not null)
                DeleteOldFile(produto.ImagemUrl);

            await _produtoService.AtualizarImagemAsync(id, url);

            return Ok(new { url });
        }

        [HttpPost("empresa/{id:guid}")]
        public async Task<IActionResult> UploadEmpresa(Guid id, IFormFile file)
        {
            var empresa = await _empresaService.GetByIdAsync(id);
            if (empresa is null) return NotFound();

            var url = await SaveFile("empresas", id, file);
            if (url is null) return BadRequest(new { mensagem = "Arquivo inválido. Use JPG, PNG ou WebP até 5 MB." });

            if (empresa.LogoUrl is not null)
                DeleteOldFile(empresa.LogoUrl);

            await _empresaService.AtualizarLogoAsync(id, url);

            return Ok(new { url });
        }

        private async Task<string?> SaveFile(string pasta, Guid id, IFormFile file)
        {
            if (file is null || file.Length == 0 || file.Length > MaxBytes)
                return null;

            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!_allowedExtensions.Contains(ext))
                return null;

            var uploadsRoot = Path.Combine(_env.ContentRootPath, "wwwroot", "uploads", pasta);
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
                var wwwroot = Path.Combine(_env.ContentRootPath, "wwwroot");
                var fullPath = Path.Combine(wwwroot, relativePath);
                if (System.IO.File.Exists(fullPath))
                    System.IO.File.Delete(fullPath);
            }
            catch { /* não bloqueia o fluxo se falhar */ }
        }
    }
}
