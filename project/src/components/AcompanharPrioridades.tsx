import { useEffect, useState } from 'react';
import { Search, Eye, Pencil, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { PrioridadeWithDocumentos } from '../lib/types';
import { DetalhesPrioridade } from './DetalhesPrioridade';
import { EditarDocumentos } from './EditarDocumentos';
import { calcularPercentualExecucao, getAlertaPrazo } from '../lib/utils';

export function AcompanharPrioridades() {
  const [prioridades, setPrioridades] = useState<PrioridadeWithDocumentos[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrioridade, setSelectedPrioridade] = useState<PrioridadeWithDocumentos | null>(
    null
  );
  const [editPrioridade, setEditPrioridade] = useState<PrioridadeWithDocumentos | null>(null);
  const { user } = useAuth();

  const loadPrioridades = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: prioridadesData, error: prioridadesError } = await supabase
        .from('prioridades')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (prioridadesError) throw prioridadesError;

      const prioridadesWithDocs = await Promise.all(
        (prioridadesData || []).map(async (prioridade) => {
          const { data: documentos } = await supabase
            .from('documentos')
            .select('*')
            .eq('prioridade_id', prioridade.id);

          return {
            ...prioridade,
            documentos: documentos || [],
          };
        })
      );

      setPrioridades(prioridadesWithDocs);
    } catch (error) {
      console.error('Erro ao carregar prioridades:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrioridades();
  }, [user]);

  const filteredPrioridades = prioridades.filter(
    (p) =>
      p.protocolo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.numero_prioridade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Carregando prioridades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Prioridades Cadastradas</h2>
        <button
          onClick={loadPrioridades}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por protocolo, número ou descrição..."
          className="w-full pl-11 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {filteredPrioridades.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {prioridades.length === 0
            ? 'Nenhuma prioridade cadastrada ainda'
            : 'Nenhuma prioridade encontrada'}
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Protocolo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Prioridade
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Descrição
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Prazo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Execução
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Alerta
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPrioridades.map((prioridade) => {
                const percentual = calcularPercentualExecucao(prioridade.documentos);
                const alerta = getAlertaPrazo(prioridade.prazo_maximo);

                return (
                  <tr key={prioridade.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {prioridade.protocolo}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {prioridade.numero_prioridade}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {prioridade.descricao}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(prioridade.prazo_maximo)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${percentual}%` }}
                          ></div>
                        </div>
                        <span className="text-gray-900 font-medium">{percentual}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          alerta.color === 'green'
                            ? 'bg-green-100 text-green-800'
                            : alerta.color === 'yellow'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {alerta.label}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedPrioridade(prioridade)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver detalhes"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setEditPrioridade(prioridade)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Editar documentos"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selectedPrioridade && (
        <DetalhesPrioridade
          prioridade={selectedPrioridade}
          onClose={() => setSelectedPrioridade(null)}
        />
      )}

      {editPrioridade && (
        <EditarDocumentos
          prioridade={editPrioridade}
          onClose={() => setEditPrioridade(null)}
          onSuccess={loadPrioridades}
        />
      )}
    </div>
  );
}
