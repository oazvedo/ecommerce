using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class AddEmpresa : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "empresas",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    nome = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    cnpj = table.Column<string>(type: "character varying(18)", maxLength: 18, nullable: false),
                    criado_em = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    atualizado_em = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    status = table.Column<bool>(type: "boolean", nullable: false),
                    responsavel = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    responsavel_id = table.Column<Guid>(type: "uuid", nullable: false),
                    telefone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    tipo = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_empresas", x => x.id);
                });

            migrationBuilder.AddColumn<Guid>(
                name: "empresa_id",
                table: "pedidos",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_pedidos_empresa_id",
                table: "pedidos",
                column: "empresa_id");

            migrationBuilder.AddForeignKey(
                name: "FK_pedidos_empresas_empresa_id",
                table: "pedidos",
                column: "empresa_id",
                principalTable: "empresas",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_pedidos_empresas_empresa_id",
                table: "pedidos");

            migrationBuilder.DropIndex(
                name: "IX_pedidos_empresa_id",
                table: "pedidos");

            migrationBuilder.DropColumn(
                name: "empresa_id",
                table: "pedidos");

            migrationBuilder.DropTable(
                name: "empresas");
        }
    }
}
