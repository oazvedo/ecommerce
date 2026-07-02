using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Threading.Tasks;
using api.application.services.interfaces;
using api.Application.DTOs.Usuario;
using ModelContextProtocol.Server;

namespace api.Mcp
{
     [McpServerToolType]
    public class UsuarioMcpTools(IUsuarioService usuarioService)
    {
        [McpServerTool, Description("Retorna todos os usuários cadastrados no sistema")]
        public async Task<IEnumerable<UsuarioDto>> ListUsersAsync()
        {
            return await usuarioService.GetAllAsync();
        }
    }
}