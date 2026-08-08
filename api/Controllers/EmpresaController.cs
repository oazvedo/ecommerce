using api.Application.DTOs.Common;
using api.Application.DTOs.Empresa;
using api.Application.DTOs.Produto;
using api.application.dtos.usuario;
using api.application.services.interfaces;
using api.Application.DTOs.Usuario;
using api.Application.Services.Interfaces;
using api.Application.Utils;
using api.domain;
using api.Domain;
using api.Domain.Enums;
using api.Domain.Enums.UsuarioEnums;
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
        private readonly IUsuarioService _usuarioService;
        private readonly IProdutoService _produtoService;
        private readonly IAuditoriaService _auditoriaService;

        public EmpresaController(IEmpresaService service, IUsuarioService usuarioService, IProdutoService produtoService, IAuditoriaService auditoriaService)
        {
            _service = service;
            _usuarioService = usuarioService;
            _produtoService = produtoService;
            _auditoriaService = auditoriaService;
        }

        // Admin da plataforma acessa qualquer empresa; demais só a própria e as filiais diretas.
        private bool IsPlataformaAdmin() => User.GetCargo() == UsuarioCargo.Administrador.ToString();

        private async Task<bool> PodeAcessarAsync(Guid empresaId)
            => IsPlataformaAdmin() || await _service.PodeGerenciarAsync(User.GetEmpresaId(), empresaId);

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
                if (!await PodeAcessarAsync(id))
                    return Forbid();

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
                    request.Status,
                    request.EmpresaPaiId));

                await _auditoriaService.RegistrarAsync(usuarioId, usuarioNome ?? "", "Criar", "Empresa", empresa.Id);
                return CreatedAtAction(nameof(GetById), new { id = empresa.Id }, empresa);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }

        // Cria uma filial vinculada a uma central. A central (via Empresa.Update) cria
        // filiais dentro do seu escopo; o admin da plataforma cria em qualquer central.
        [HttpPost("{paiId}/filial")]
        [Authorize(Policy = "Empresa.Update")]
        public async Task<ActionResult<EmpresaDto>> CreateFilial(Guid paiId, CreateEmpresaRequest request)
        {
            try
            {
                if (!await PodeAcessarAsync(paiId))
                    return Forbid();

                var usuarioId = User.GetId();
                var usuarioNome = User.GetNome();

                var filial = await _service.CreateAsync(new Empresa(
                    request.Nome,
                    request.Cnpj,
                    usuarioNome!,
                    usuarioId,
                    request.Telefone,
                    EmpresaTipo.Filial,
                    request.Status,
                    paiId));

                await _auditoriaService.RegistrarAsync(usuarioId, usuarioNome ?? "", "Criar", "Empresa", filial.Id, paiId, "Filial");
                return CreatedAtAction(nameof(GetById), new { id = filial.Id }, filial);
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
                if (!await PodeAcessarAsync(id))
                    return Forbid();

                var empresa = await _service.UpdateCamposAsync(id, request);
                if (empresa == null)
                    return NotFound(new { mensagem = "Empresa não encontrada." });

                await _auditoriaService.RegistrarAsync(User.GetId(), User.GetNome() ?? "", "Atualizar", "Empresa", id, id);
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
                if (!await PodeAcessarAsync(id))
                    return Forbid();

                var removido = await _service.DeleteComCascadeAsync(id);
                if (!removido)
                    return NotFound(new { mensagem = "Empresa não encontrada." });

                await _auditoriaService.RegistrarAsync(User.GetId(), User.GetNome() ?? "", "Excluir", "Empresa", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }

        // Vitrine pública da loja — acessível a qualquer autenticado (inclusive Cliente,
        // que não tem Empresa.Read). Expõe só os dados públicos da loja.
        [HttpGet("{id}/vitrine")]
        [Authorize]
        public async Task<ActionResult<LojaPublicaDto>> GetVitrine(Guid id)
        {
            try
            {
                var empresa = await _service.GetByIdAsync(id);
                if (empresa == null)
                    return NotFound(new { mensagem = "Loja não encontrada." });

                return Ok(new LojaPublicaDto
                {
                    Id = empresa.Id,
                    Nome = empresa.Nome,
                    Tipo = empresa.Tipo,
                    LogoUrl = empresa.LogoUrl
                });
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

                if (!await PodeAcessarAsync(id))
                    return Forbid();

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

                if (!await PodeAcessarAsync(id))
                    return Forbid();

                var usuarios = await _service.GetUsuariosAsync(id, page, pageSize);
                return Ok(usuarios);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }

        // Filiais diretas de uma central (hierarquia de 1 nível).
        [HttpGet("{id}/filiais")]
        [Authorize(Policy = "Empresa.Read")]
        public async Task<ActionResult<PagedResult<EmpresaDto>>> GetFiliais(Guid id, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            try
            {
                if (page < 1) page = 1;
                if (pageSize < 1) pageSize = 20;

                if (!await PodeAcessarAsync(id))
                    return Forbid();

                var filiais = await _service.GetFiliaisAsync(id, page, pageSize);
                return Ok(filiais);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }

        // Cria um usuário diretamente na empresa {id} (própria ou filial no escopo).
        // Usa Empresa.Update (gestão da empresa); só o admin da plataforma pode criar Administrador.
        [HttpPost("{id}/usuario")]
        [Authorize(Policy = "Empresa.Update")]
        public async Task<ActionResult<UsuarioDto>> CriarUsuario(Guid id, [FromBody] CriarUsuarioEmpresaRequest request)
        {
            try
            {
                if (!await PodeAcessarAsync(id))
                    return Forbid();

                if (!Enum.TryParse<UsuarioCargo>(request.Cargo, out var cargo))
                    return BadRequest(new { mensagem = "Cargo inválido." });

                // Um não-admin da plataforma não pode criar um Administrador.
                if (cargo == UsuarioCargo.Administrador && !IsPlataformaAdmin())
                    return Forbid();

                var usuario = new Usuario(request.Nome, request.Email, request.Password, cargo, id);
                var dto = await _usuarioService.CreateAsync(usuario);
                return CreatedAtAction(nameof(GetUsuarios), new { id }, dto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }

        // Cria um produto diretamente na empresa {id} (própria ou filial no escopo).
        // A loja vendedora é a empresa da rota — não a do usuário logado.
        [HttpPost("{id}/produto")]
        [Authorize(Policy = "Produto.Create")]
        public async Task<ActionResult<ProdutoDto>> CriarProduto(Guid id, CreateProdutoRequest request)
        {
            try
            {
                if (!await PodeAcessarAsync(id))
                    return Forbid();

                var entity = new Produto(request.Nome, request.Descricao, request.Preco, request.Codigo, id, request.Status)
                {
                    Estoque = request.Estoque,
                    FreteGratis = request.FreteGratis,
                    Variantes = request.Variantes
                };
                var produto = await _produtoService.CreateAsync(entity);
                await _auditoriaService.RegistrarAsync(User.GetId(), User.GetNome() ?? "", "Criar", "Produto", produto.Id, id);
                return CreatedAtAction(nameof(GetProdutos), new { id }, produto);
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
                if (!await PodeAcessarAsync(id))
                    return Forbid();

                var ok = await _service.AdicionarUsuarioAsync(id, usuarioId);
                if (!ok)
                    return NotFound(new { mensagem = "Empresa ou usuário não encontrado." });

                await _auditoriaService.RegistrarAsync(User.GetId(), User.GetNome() ?? "", "AdicionarUsuario", "Usuario", usuarioId, id);
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
                if (!await PodeAcessarAsync(id))
                    return Forbid();

                var ok = await _service.AdicionarUsuarioAsync(infra.EmpresaSeed.DefaultEmpresaId, usuarioId);
                if (!ok)
                    return NotFound(new { mensagem = "Usuário não encontrado." });

                await _auditoriaService.RegistrarAsync(User.GetId(), User.GetNome() ?? "", "DesalocarUsuario", "Usuario", usuarioId, id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }
    }
}
