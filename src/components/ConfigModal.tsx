import React from "react";
import { Key, X, ExternalLink, AlertTriangle } from "lucide-react";
import Button from "../components/ui/Button";
import { useAppStore } from "../stores/useAppStore";
import { isTeamsConfigured, isOpenAIConfigured } from "../config";

const ConfigModal: React.FC = () => {
  const showConfig = useAppStore((state) => state.showConfig);
  const setShowConfig = useAppStore((state) => state.setShowConfig);

  if (!showConfig) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setShowConfig(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-up"
      onClick={handleOverlayClick}
    >
      <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-100">
              Configuração de APIs
            </h2>
          </div>
          <Button
            onClick={() => setShowConfig(false)}
            variant="ghost"
            size="sm"
            icon={<X className="w-4 h-4" />}
          />
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className={`p-4 rounded-lg border ${
                isTeamsConfigured()
                  ? "bg-emerald-500/10 border-emerald-500/30"
                  : "bg-orange-500/10 border-orange-500/30"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isTeamsConfigured() ? "bg-emerald-400" : "bg-orange-400"
                  }`}
                />
                <span
                  className={`font-medium ${
                    isTeamsConfigured() ? "text-emerald-300" : "text-orange-300"
                  }`}
                >
                  Microsoft Teams
                </span>
              </div>
              <p
                className={`text-sm ${
                  isTeamsConfigured() ? "text-emerald-400" : "text-orange-400"
                }`}
              >
                {isTeamsConfigured() ? "Configurado ✓" : "Não configurado"}
              </p>
            </div>

            <div
              className={`p-4 rounded-lg border ${
                isOpenAIConfigured()
                  ? "bg-emerald-500/10 border-emerald-500/30"
                  : "bg-orange-500/10 border-orange-500/30"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isOpenAIConfigured() ? "bg-emerald-400" : "bg-orange-400"
                  }`}
                />
                <span
                  className={`font-medium ${
                    isOpenAIConfigured()
                      ? "text-emerald-300"
                      : "text-orange-300"
                  }`}
                >
                  OpenAI API
                </span>
              </div>
              <p
                className={`text-sm ${
                  isOpenAIConfigured() ? "text-emerald-400" : "text-orange-400"
                }`}
              >
                {isOpenAIConfigured() ? "Configurado ✓" : "Não configurado"}
              </p>
            </div>
          </div>

          {/* Teams Configuration */}
          <div>
            <h3 className="font-medium text-blue-400 mb-3 flex items-center gap-2">
              🔧 Microsoft Teams (Azure App Registration)
            </h3>
            <div className="space-y-3 text-sm text-gray-300 bg-gray-700/30 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="font-medium text-blue-300 min-w-[2rem]">
                  1.
                </span>
                <div>
                  Acesse{" "}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      window.open("https://portal.azure.com/", "_blank")
                    }
                    icon={<ExternalLink className="w-3 h-3" />}
                    className="inline-flex items-center gap-1 px-1 py-0 h-auto text-blue-400 hover:text-blue-300"
                  >
                    portal.azure.com
                  </Button>
                  {" → App registrations → New registration"}
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="font-medium text-blue-300 min-w-[2rem]">
                  2.
                </span>
                <span>
                  Nome: "Productivity Hub" | Redirect URI: SPA →{" "}
                  {window.location.origin}
                </span>
              </div>

              <div className="flex items-start gap-2">
                <span className="font-medium text-blue-300 min-w-[2rem]">
                  3.
                </span>
                <span>
                  Copie o <strong>Application (client) ID</strong> e{" "}
                  <strong>Directory (tenant) ID</strong>
                </span>
              </div>

              <div className="flex items-start gap-2">
                <span className="font-medium text-blue-300 min-w-[2rem]">
                  4.
                </span>
                <div>
                  Crie um arquivo{" "}
                  <code className="bg-gray-600 px-1 rounded">.env</code> na raiz
                  do projeto:
                  <div className="mt-2 p-3 bg-gray-800 rounded font-mono text-xs">
                    VITE_TEAMS_CLIENT_ID=seu_client_id_aqui
                    <br />
                    VITE_TEAMS_TENANT_ID=seu_tenant_id_aqui
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* OpenAI Configuration */}
          <div>
            <h3 className="font-medium text-purple-400 mb-3">🤖 OpenAI API</h3>
            <div className="space-y-3 text-sm text-gray-300 bg-gray-700/30 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="font-medium text-purple-300 min-w-[2rem]">
                  1.
                </span>
                <div>
                  Acesse{" "}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      window.open(
                        "https://platform.openai.com/api-keys",
                        "_blank"
                      )
                    }
                    icon={<ExternalLink className="w-3 h-3" />}
                    className="inline-flex items-center gap-1 px-1 py-0 h-auto text-purple-400 hover:text-purple-300"
                  >
                    platform.openai.com/api-keys
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="font-medium text-purple-300 min-w-[2rem]">
                  2.
                </span>
                <span>Clique em "Create new secret key"</span>
              </div>

              <div className="flex items-start gap-2">
                <span className="font-medium text-purple-300 min-w-[2rem]">
                  3.
                </span>
                <div>
                  Adicione ao arquivo{" "}
                  <code className="bg-gray-600 px-1 rounded">.env</code>:
                  <div className="mt-2 p-3 bg-gray-800 rounded font-mono text-xs">
                    VITE_OPENAI_API_KEY=sk-seu_api_key_aqui
                    <br />
                    VITE_OPENAI_MODEL=gpt-3.5-turbo
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Environment File Example */}
          <div>
            <h3 className="font-medium text-gray-300 mb-3">
              📄 Exemplo completo do arquivo .env
            </h3>
            <div className="bg-gray-800 p-4 rounded-lg font-mono text-sm">
              <div className="text-gray-400 mb-2"># Microsoft Teams</div>
              <div className="text-green-400">VITE_TEAMS_CLIENT_ID</div>
              <span className="text-gray-300">
                =12345678-1234-1234-1234-123456789012
              </span>
              <br />
              <div className="text-green-400">VITE_TEAMS_TENANT_ID</div>
              <span className="text-gray-300">=common</span>

              <div className="text-gray-400 mb-2 mt-4"># OpenAI</div>
              <div className="text-green-400">VITE_OPENAI_API_KEY</div>
              <span className="text-gray-300">=sk-...</span>
              <br />
              <div className="text-green-400">VITE_OPENAI_MODEL</div>
              <span className="text-gray-300">=gpt-3.5-turbo</span>
            </div>
          </div>

          {/* Important Warning */}
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-300 font-medium mb-1">
                  ⚠️ Importante para Produção
                </p>
                <ul className="text-yellow-400/90 text-sm space-y-1">
                  <li>• Nunca commite o arquivo .env para o repositório</li>
                  <li>• Use variáveis de ambiente do servidor em produção</li>
                  <li>• Considere usar um backend para proteger as API keys</li>
                  <li>• Configure CORS adequadamente no Azure</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Quick Start */}
          <div>
            <h3 className="font-medium text-gray-300 mb-3">
              🚀 Para testar rapidamente
            </h3>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <p className="text-blue-300 text-sm mb-2">
                Você pode usar apenas a OpenAI inicialmente para testar o chat
                da IA:
              </p>
              <ol className="text-blue-400/80 text-sm space-y-1 list-decimal list-inside">
                <li>Configure apenas VITE_OPENAI_API_KEY</li>
                <li>Reinicie o servidor de desenvolvimento</li>
                <li>Teste o chat da IA</li>
                <li>Configure o Teams quando estiver pronto</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex justify-end">
          <Button onClick={() => setShowConfig(false)}>Entendi</Button>
        </div>
      </div>
    </div>
  );
};

export default ConfigModal;
