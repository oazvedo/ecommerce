using api.Application.DTOs.Common;
using api.Application.DTOs.Empresa;
using api.Application.Services.Interfaces;
using api.Domain;
using api.Domain.Enums;
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
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 10;

            var empresas = await _service.GetPagedAsync(page, pageSize);
            return Ok(empresas);
        }

        [HttpGet("{id}")]
        [Authorize(Policy = "Empresa.Read")]
        public async Task<ActionResult<EmpresaDto?>> GetById(Guid id)
        {
            var empresa = await _service.GetByIdAsync(id);
            if (empresa == null)
                return NotFound(new { mensagem = "Empresa não encontrada." });

            return Ok(empresa);
        }

        [HttpPost]
        [Authorize(Policy = "Empresa.Create")]
        public async Task<ActionResult<EmpresaDto>> Create(CreateEmpresaRequest request)
        {
            var empresa = await _service.CreateAsync(new Empresa(
                request.Nome,
                request.Cnpj,
                request.Responsavel,
                request.ResponsavelId,
                request.Telefone,
                request.Tipo,
                request.Status));

            return CreatedAtAction(nameof(GetById), new { id = empresa.Id }, empresa);
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "Empresa.Update")]
        public async Task<ActionResult<EmpresaDto>> Update(Guid id, UpdateEmpresaRequest request)
        {
            var entity = new Empresa(
                request.Nome,
                request.Cnpj,
                request.Responsavel,
                request.ResponsavelId,
                request.Telefone,
                request.Tipo,
                request.Status)
            {
                Id = id
            };

            var empresa = await _service.UpdateAsync(entity);
            if (empresa == null)
                return NotFound(new { mensagem = "Empresa não encontrada." });

            return Ok(empresa);
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "Empresa.Delete")]
        public async Task<ActionResult> Delete(Guid id)
        {
            var removido = await _service.DeleteAsync(id);
            if (!removido)
                return NotFound(new { mensagem = "Empresa não encontrada." });

            return NoContent();
        }
    }
}
