using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class AddEmpresaHierarquia : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "empresa_pai_id",
                table: "empresas",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_empresas_empresa_pai_id",
                table: "empresas",
                column: "empresa_pai_id");

            migrationBuilder.AddForeignKey(
                name: "FK_empresas_empresas_empresa_pai_id",
                table: "empresas",
                column: "empresa_pai_id",
                principalTable: "empresas",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_empresas_empresas_empresa_pai_id",
                table: "empresas");

            migrationBuilder.DropIndex(
                name: "IX_empresas_empresa_pai_id",
                table: "empresas");

            migrationBuilder.DropColumn(
                name: "empresa_pai_id",
                table: "empresas");
        }
    }
}
