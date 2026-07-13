using api.Application.DTOs.Common;
using api.Application.DTOs.Empresa;
using api.Application.Services.Interfaces;
using api.Application.Utils;
using api.Domain;
using api.infra;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmpresaController : ControllerBase
    {
        private readonly IEmpresaService _service;

        public EmpresaController(IEmpresaService service)
        {
            _service = service;
        }

        [HttpGet]
        [Authorize(Policy = "Empresa.Read")]
        public async Task<ActionResult<PagedResult<EmpresaDto>>> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                if (page < 1) page = 1;
                if (pageSize < 1) pageSize = 10;

                var empresas = await _service.GetPagedAsync(page, pageSize);
                return Ok(empresas);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }

        [HttpGet("{id}")]
        [Authorize(Policy = "Empresa.Read")]
        public async Task<ActionResult<EmpresaDto?>> GetById(Guid id)
        {
            try
            {
                var empresa = await _service.GetByIdAsync(id);
                if (empresa == null)
                    return NotFound(new { mensagem = "Empresa não encontrada." });

                return Ok(empresa);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }

        [HttpPost]
        [Authorize(Policy = "Empresa.Create")]
        public async Task<ActionResult<EmpresaDto>> Create(CreateEmpresaRequest request)
        {
            try
            {
                var usuarioId = User.GetId();
                var usuarioNome = User.GetNome();

                var empresa = await _service.CreateAsync(new Empresa(
                    request.Nome,
                    request.Cnpj,
                    usuarioNome!,
                    usuarioId,
                    request.Telefone,
                    request.Tipo,
                    request.Status));

                return CreatedAtAction(nameof(GetById), new { id = empresa.Id }, empresa);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "Empresa.Update")]
        public async Task<ActionResult<EmpresaDto>> Update(Guid id, UpdateEmpresaRequest request)
        {
            try
            {
                var empresa = await _service.UpdateCamposAsync(id, request);
                if (empresa == null)
                    return NotFound(new { mensagem = "Empresa não encontrada." });

                return Ok(empresa);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "Empresa.Delete")]
        public async Task<ActionResult> Delete(Guid id)
        {
            try
            {
                var removido = await _service.DeleteComCascadeAsync(id);
                if (!removido)
                    return NotFound(new { mensagem = "Empresa não encontrada." });

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }

        [HttpGet("{id}/produtos")]
        [Authorize(Policy = "Empresa.Read")]
        public async Task<ActionResult> GetProdutos(Guid id, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            try
            {
                if (page < 1) page = 1;
                if (pageSize < 1) pageSize = 20;

                var produtos = await _service.GetProdutosAsync(id, page, pageSize);
                return Ok(produtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }

        [HttpGet("{id}/usuarios")]
        [Authorize(Policy = "Empresa.Read")]
        public async Task<ActionResult> GetUsuarios(Guid id, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            try
            {
                if (page < 1) page = 1;
                if (pageSize < 1) pageSize = 50;

                var usuarios = await _service.GetUsuariosAsync(id, page, pageSize);
                return Ok(usuarios);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }

        [HttpPatch("{id}/usuario/{usuarioId}")]
        [Authorize(Policy = "Empresa.Update")]
        public async Task<ActionResult> AdicionarUsuario(Guid id, Guid usuarioId)
        {
            try
            {
                var ok = await _service.AdicionarUsuarioAsync(id, usuarioId);
                if (!ok)
                    return NotFound(new { mensagem = "Empresa ou usuário não encontrado." });

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }

        [HttpDelete("{id}/usuario/{usuarioId}")]
        [Authorize(Policy = "Usuario.Update")]
        public async Task<ActionResult> DesalocarUsuario(Guid id, Guid usuarioId)
        {
            try
            {
                var ok = await _service.AdicionarUsuarioAsync(infra.EmpresaSeed.DefaultEmpresaId, usuarioId);
                if (!ok)
                    return NotFound(new { mensagem = "Usuário não encontrado." });

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }
    }
}
