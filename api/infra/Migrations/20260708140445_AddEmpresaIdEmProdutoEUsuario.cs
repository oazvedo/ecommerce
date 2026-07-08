using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class AddEmpresaIdEmProdutoEUsuario : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "empresa_id",
                table: "usuarios",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<Guid>(
                name: "empresa_id",
                table: "produtos",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.Sql(@"
                INSERT INTO empresas (id, nome, cnpj, responsavel, responsavel_id, telefone, tipo, status, criado_em)
                SELECT '00000000-0000-0000-0000-000000000001', 'Venturus', '123456789', 'Usuario Responsavel', '00000000-0000-0000-0000-000000000000', '', 1, true, now()
                WHERE NOT EXISTS (SELECT 1 FROM empresas WHERE id = '00000000-0000-0000-0<PASSWORD>-<PASSWORD>');
            ");

            migrationBuilder.CreateIndex(
                name: "IX_usuarios_empresa_id",
                table: "usuarios",
                column: "empresa_id");

            migrationBuilder.CreateIndex(
                name: "IX_produtos_empresa_id",
                table: "produtos",
                column: "empresa_id");

            migrationBuilder.AddForeignKey(
                name: "FK_produtos_empresas_empresa_id",
                table: "produtos",
                column: "empresa_id",
                principalTable: "empresas",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_usuarios_empresas_empresa_id",
                table: "usuarios",
                column: "empresa_id",
                principalTable: "empresas",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_produtos_empresas_empresa_id",
                table: "produtos");

            migrationBuilder.DropForeignKey(
                name: "FK_usuarios_empresas_empresa_id",
                table: "usuarios");

            migrationBuilder.DropIndex(
                name: "IX_usuarios_empresa_id",
                table: "usuarios");

            migrationBuilder.DropIndex(
                name: "IX_produtos_empresa_id",
                table: "produtos");

            migrationBuilder.DropColumn(
                name: "empresa_id",
                table: "usuarios");

            migrationBuilder.DropColumn(
                name: "empresa_id",
                table: "produtos");

            migrationBuilder.Sql(@"
                DELETE FROM empresas WHERE id = '00000000-0000-0000-0000-000000000001';
            ");
        }
    }
}
