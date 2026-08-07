using Xunit;
using YamlDotNet.Serialization;

namespace api.Tests.Configuration
{
    /// <summary>
    /// Testes de contrato para o arquivo de configuração do CodeRabbit (.coderabbit.yaml),
    /// garantindo que ele permaneça um YAML válido e que os campos usados pelo bot de
    /// code review (perfis, filtros de path e instruções por diretório) não sejam
    /// quebrados acidentalmente por alterações futuras.
    /// </summary>
    public class CodeRabbitConfigTests
    {
        private static string GetConfigFilePath()
        {
            var directory = new DirectoryInfo(AppContext.BaseDirectory);

            while (directory is not null && !File.Exists(Path.Combine(directory.FullName, ".coderabbit.yaml")))
            {
                directory = directory.Parent;
            }

            if (directory is null)
            {
                throw new FileNotFoundException("Não foi possível localizar o arquivo .coderabbit.yaml a partir do diretório de execução dos testes.");
            }

            return Path.Combine(directory.FullName, ".coderabbit.yaml");
        }

        private static Dictionary<object, object> LoadConfig()
        {
            var yaml = File.ReadAllText(GetConfigFilePath());
            var deserializer = new Deserializer();
            return deserializer.Deserialize<Dictionary<object, object>>(yaml);
        }

        private static Dictionary<object, object> AsMap(object value) => Assert.IsType<Dictionary<object, object>>(value);

        private static List<object> AsList(object value) => Assert.IsType<List<object>>(value);

        [Fact]
        public void Arquivo_DeveExistirNaRaizDoRepositorio()
        {
            var path = GetConfigFilePath();

            Assert.True(File.Exists(path));
            Assert.Equal(".coderabbit.yaml", Path.GetFileName(path));
        }

        [Fact]
        public void Arquivo_DeveSerYamlValidoComRaizComoMapa()
        {
            var config = LoadConfig();

            Assert.NotNull(config);
            Assert.NotEmpty(config);
        }

        [Fact]
        public void Arquivo_NaoDeveConterCaracteresDeTabulacaoParaIndentacao()
        {
            // YAML não permite tabs para indentação; um tab acidental quebraria o parser do CodeRabbit.
            var raw = File.ReadAllText(GetConfigFilePath());

            Assert.DoesNotContain("\t", raw);
        }

        [Theory]
        [InlineData("language")]
        [InlineData("tone_instructions")]
        [InlineData("early_access")]
        [InlineData("reviews")]
        [InlineData("chat")]
        public void Config_DeveConterCampoDeNivelSuperior(string chave)
        {
            var config = LoadConfig();

            Assert.True(config.ContainsKey(chave), $"Chave de nível superior '{chave}' não encontrada.");
        }

        [Fact]
        public void Config_LanguageDeveSerEnUS()
        {
            var config = LoadConfig();

            Assert.Equal("en-US", config["language"]);
        }

        [Fact]
        public void Config_EarlyAccessDeveSerFalse()
        {
            var config = LoadConfig();

            Assert.Equal(false, config["early_access"]);
        }

        [Fact]
        public void Reviews_DeveConterFlagsEsperadas()
        {
            var reviews = AsMap(LoadConfig()["reviews"]);

            Assert.Equal("chill", reviews["profile"]);
            Assert.Equal(false, reviews["request_changes_workflow"]);
            Assert.Equal(true, reviews["high_level_summary"]);
            Assert.Equal(true, reviews["review_status"]);
            Assert.Equal(false, reviews["poem"]);
            Assert.Equal(false, reviews["collapse_walkthrough"]);
            Assert.Equal(true, reviews["changed_files_summary"]);
            Assert.Equal(false, reviews["sequence_diagrams"]);
        }

        [Fact]
        public void AutoReview_DeveEstarHabilitadoParaBranchesPrincipais()
        {
            var reviews = AsMap(LoadConfig()["reviews"]);
            var autoReview = AsMap(reviews["auto_review"]);

            Assert.Equal(true, autoReview["enabled"]);
            Assert.Equal(false, autoReview["drafts"]);

            var baseBranches = AsList(autoReview["base_branches"]).Select(b => b.ToString()).ToList();
            Assert.Equal(new[] { "main", "dev" }, baseBranches);
        }

        [Fact]
        public void PathFilters_DeveIgnorarArtefatosGeradosEDeBuild()
        {
            var reviews = AsMap(LoadConfig()["reviews"]);
            var pathFilters = AsList(reviews["path_filters"]).Select(f => f.ToString()).ToList();

            var esperados = new[]
            {
                "!**/Migrations/**",
                "!**/*.Designer.cs",
                "!**/bin/**",
                "!**/obj/**",
                "!frontend/dist/**",
                "!**/node_modules/**",
                "!**/*.lock",
                "!**/package-lock.json",
            };

            Assert.Equal(esperados.Length, pathFilters.Count);
            foreach (var esperado in esperados)
            {
                Assert.Contains(esperado, pathFilters);
            }
        }

        [Fact]
        public void PathFilters_TodosDevemSerPadroesDeExclusao()
        {
            var reviews = AsMap(LoadConfig()["reviews"]);
            var pathFilters = AsList(reviews["path_filters"]).Select(f => f.ToString()).ToList();

            Assert.All(pathFilters, filtro => Assert.StartsWith("!", filtro));
        }

        [Fact]
        public void PathInstructions_DeveConterTresEntradas()
        {
            var reviews = AsMap(LoadConfig()["reviews"]);
            var pathInstructions = AsList(reviews["path_instructions"]);

            Assert.Equal(3, pathInstructions.Count);
        }

        [Fact]
        public void PathInstructions_DeveConterRegrasParaBackendDotNet()
        {
            var entrada = ObterInstrucaoPorPath("api/**/*.cs");

            var instrucoes = (string)entrada["instructions"];
            Assert.Contains("[Authorize]", instrucoes);
            Assert.Contains("DbContext", instrucoes);
            Assert.Contains("DTOs", instrucoes);
        }

        [Fact]
        public void PathInstructions_DeveConterRegrasParaFrontendSrc()
        {
            var entrada = ObterInstrucaoPorPath("frontend/src/**/*.{ts,tsx}");

            var instrucoes = (string)entrada["instructions"];
            Assert.Contains("apiFetch", instrucoes);
            Assert.Contains("pt-BR", instrucoes);
        }

        [Fact]
        public void PathInstructions_DeveConterRegrasParaClientesDeApiDoFrontend()
        {
            var entrada = ObterInstrucaoPorPath("frontend/src/api/**/*.ts");

            var instrucoes = (string)entrada["instructions"];
            Assert.Contains("skipAuth", instrucoes);
            Assert.Contains("apiFetch", instrucoes);
        }

        [Fact]
        public void PathInstructions_PathInexistenteNaoDeveSerEncontrado()
        {
            var reviews = AsMap(LoadConfig()["reviews"]);
            var pathInstructions = AsList(reviews["path_instructions"]);

            var encontrado = pathInstructions
                .Select(AsMap)
                .Any(entrada => (string)entrada["path"] == "api/**/*.ts");

            Assert.False(encontrado);
        }

        [Fact]
        public void Chat_AutoReplyDeveEstarHabilitado()
        {
            var chat = AsMap(LoadConfig()["chat"]);

            Assert.Equal(true, chat["auto_reply"]);
        }

        private static Dictionary<object, object> ObterInstrucaoPorPath(string path)
        {
            var reviews = AsMap(LoadConfig()["reviews"]);
            var pathInstructions = AsList(reviews["path_instructions"]).Select(AsMap);

            var entrada = pathInstructions.FirstOrDefault(e => (string)e["path"] == path);
            Assert.NotNull(entrada);
            return entrada!;
        }
    }
}