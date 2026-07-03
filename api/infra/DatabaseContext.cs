using api.domain;
using api.Domain;
using Microsoft.EntityFrameworkCore;

namespace api.infra
{
    public class DatabaseContext : DbContext
    {
        public DatabaseContext(DbContextOptions<DatabaseContext> options) : base(options)
        {
        }

        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Carteira> Carteiras { get; set; }
        public DbSet<Permissao> Permissoes { get; set; }
        public DbSet<UsuarioPermissao> UsuarioPermissoes { get; set; }
        public DbSet<Pedido> Pedidos {get; set;}
        public DbSet<PedidoItem> PedidoItens { get; set; }
        public DbSet<Produto> Produtos { get; set; }
        public DbSet<Empresa> Empresas { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Usuario>(entity =>
            {
                entity.ToTable("usuarios");

                entity.HasKey(u => u.Id);

                entity.Property(u => u.Id)
                    .HasColumnName("id")
                    .IsRequired();

                entity.Property(u => u.Nome)
                    .HasColumnName("nome")
                    .IsRequired()
                    .HasMaxLength(150);

                entity.Property(u => u.Email)
                    .HasColumnName("email")
                    .IsRequired()
                    .HasMaxLength(200);

                entity.Property(u => u.Status)
                    .HasColumnName("status")
                    .IsRequired();

                entity.Property(u => u.Cargo)
                    .HasColumnName("cargo")
                    .IsRequired();

                entity.Property(u => u.PasswordHash)
                    .HasColumnName("password_hash")
                    .IsRequired();

                entity.Property(u => u.CriadoEm)
                    .HasColumnName("criado_em")
                    .IsRequired();

                entity.Property(u => u.AtualizadoEm)
                    .HasColumnName("atualizado_em")
                    .IsRequired(false);

                entity.HasOne(u => u.Carteira)
                    .WithOne(c => c.Usuario)
                    .HasForeignKey<Carteira>(c => c.UsuarioId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Carteira>(entity =>
            {
                entity.ToTable("carteiras");

                entity.HasKey(c => c.Id);

                entity.Property(c => c.Id)
                    .HasColumnName("id")
                    .IsRequired();

                entity.Property(c => c.UsuarioId)
                    .HasColumnName("usuario_id")
                    .IsRequired();

                entity.Property(c => c.Saldo)
                    .HasColumnName
                    ("saldo")
                    .IsRequired();

                entity.Property(c => c.CriadoEm)
                    .HasColumnName("criado_em")
                    .IsRequired();
                
                entity.Property(c => c.AtualizadoEm)
                    .HasColumnName("atualizado_em")
                    .IsRequired(false);
            });

            modelBuilder.Entity<Permissao>(entity =>
            {
                entity.ToTable("permissoes");

                entity.HasKey(p => p.Id);

                entity.Property(p => p.Id)
                    .HasColumnName("id")
                    .IsRequired();

                entity.Property(p => p.Nome)
                    .HasColumnName("nome")
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(p => p.Descricao)
                    .HasColumnName("descricao")
                    .IsRequired()
                    .HasMaxLength(250);
            });

            modelBuilder.Entity<UsuarioPermissao>(entity =>
            {
                entity.ToTable("usuario_permissoes");

                entity.HasKey(up => new { up.UsuarioId, up.PermissaoId });

                entity.HasOne(up => up.Usuario)
                    .WithMany(u => u.UsuarioPermissoes)
                    .HasForeignKey(up => up.UsuarioId);

                entity.HasOne(up => up.Permissao)
                    .WithMany(p => p.UsuarioPermissoes)
                    .HasForeignKey(up => up.PermissaoId);
            });
        
            modelBuilder.Entity<Pedido>(entity =>
            {
                entity.ToTable("pedidos");

                entity.HasKey(u => u.Id);

                entity.Property(u => u.Id)
                    .HasColumnName("id")
                    .IsRequired();

                entity.Property(u => u.Status)
                    .HasColumnName("status");

                entity.Property(u => u.Contracacao)
                    .HasColumnName("contratacao");

                entity.Property(u => u.UsuarioId)
                    .HasColumnName("usuario_id");

                entity.HasOne(u => u.Usuario)
                    .WithMany()
                    .HasForeignKey(u => u.UsuarioId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasMany(u => u.Itens)
                    .WithOne()
                    .HasForeignKey(i => i.PedidoId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.Property(u => u.CriadoEm)
                    .HasColumnName("criado_em")
                    .IsRequired();

                entity.Property(u => u.AtualizadoEm)
                    .HasColumnName("atualizado_em")
                    .IsRequired(false);
            });


            modelBuilder.Entity<PedidoItem>(entity =>
            {
                entity.ToTable("pedido_itens");

                entity.HasKey(i => i.Id);

                entity.Property(i => i.Id)
                    .HasColumnName("id")
                    .IsRequired();

                entity.Property(i => i.PedidoId)
                    .HasColumnName("pedido_id")
                    .IsRequired();

                entity.Property(i => i.ProdutoId)
                    .HasColumnName("produto_id")
                    .IsRequired();

                entity.Property(i => i.Quantidade)
                    .HasColumnName("quantidade")
                    .IsRequired();

                entity.Property(i => i.PrecoUnitario)
                    .HasColumnName("preco_unitario")
                    .HasColumnType("decimal(18,2)")
                    .IsRequired();

                entity.Ignore(i => i.Subtotal);

                entity.HasOne(i => i.Produto)
                    .WithMany()
                    .HasForeignKey(i => i.ProdutoId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Empresa>(entity =>
            {
                entity.ToTable("empresas");

                entity.HasKey(e => e.Id);

                entity.Property(e => e.Id)
                    .HasColumnName("id")
                    .IsRequired();

                entity.Property(e => e.Nome)
                    .HasColumnName("nome")
                    .IsRequired()
                    .HasMaxLength(200);

                entity.Property(e => e.Cnpj)
                    .HasColumnName("cnpj")
                    .IsRequired()
                    .HasMaxLength(18);

                entity.Property(e => e.Responsavel)
                    .HasColumnName("responsavel")
                    .IsRequired()
                    .HasMaxLength(150);

                entity.Property(e => e.ResponsavelId)
                    .HasColumnName("responsavel_id")
                    .IsRequired();

                entity.Property(e => e.Telefone)
                    .HasColumnName("telefone")
                    .IsRequired()
                    .HasMaxLength(20);

                entity.Property(e => e.Tipo)
                    .HasColumnName("tipo")
                    .IsRequired();

                entity.Property(e => e.Status)
                    .HasColumnName("status")
                    .IsRequired();

                entity.Property(e => e.CriadoEm)
                    .HasColumnName("criado_em")
                    .IsRequired();

                entity.Property(e => e.AtualizadoEm)
                    .HasColumnName("atualizado_em")
                    .IsRequired(false);
            });

            modelBuilder.Entity<Produto>(entity =>
            {
                entity.ToTable("produtos");

                entity.HasKey(u => u.Id);

                entity.Property(u => u.Id)
                    .HasColumnName("id")
                    .IsRequired();

                entity.Property(u => u.Nome)
                    .HasColumnName("nome")
                    .IsRequired();

                entity.Property(u => u.Descricao)
                    .HasColumnName("descricao")
                    .IsRequired();

                entity.Property(u => u.Codigo)
                    .HasColumnName("codigo_interno")
                    .IsRequired();
                
                entity.Property(u => u.Status)
                    .HasColumnName("status")
                    .IsRequired();
                
                entity.Property(u => u.CriadoEm)
                    .HasColumnName("criado_em")
                    .IsRequired();

                entity.Property(u => u.AtualizadoEm)
                    .HasColumnName("atualizado_em")
                    .IsRequired(false);
            });
        }
    }
}
