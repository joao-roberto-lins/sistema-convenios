import { useState } from 'react';
import { X, Save } from 'lucide-react';
import type { PrioridadeWithDocumentos, Documento } from '../lib/types';
import { supabase } from '../lib/supabase';
import { getStatusLabel } from '../lib/utils';

interface Props {
  prioridade: PrioridadeWithDocumentos;
  onClose: () => void;
  onSuccess: () => void;
}

type DocumentoStatus = 'sem_documento' | 'em_elaboracao' | 'cadastrado';

export function EditarDocumentos({ prioridade, onClose, onSuccess }: Props) {
  const [documentosStatus, setDocumentosStatus] = useState<Record<string, DocumentoStatus>>(
    prioridade.documentos.reduce((acc, doc) => {
      acc[doc.id] = doc.status as DocumentoStatus;
      return acc;
    }, {} as Record<string, DocumentoStatus>)
  );
  const [loading, setLoading] = useState(false);

  const handleStatusChange = (docId: string, status: DocumentoStatus) => {
    setDocumentosStatus({
      ...documentosStatus,
      [docId]: status,
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updates = prioridade.documentos.map((doc) => ({
        id: doc.id,
        status: documentosStatus[doc.id],
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('documentos')
          .update({ status: update.status })
          .eq('id', update.id);

        if (error) throw error;
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar documentos:', error);
      alert('Erro ao atualizar documentos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: DocumentoStatus) => {
    switch (status) {
      case 'cadastrado':
        return '🟢';
      case 'em_elaboracao':
        return '🟡';
      case 'sem_documento':
        return '🔴';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Editar Status dos Documentos</h2>
            <p className="text-sm text-gray-600 mt-1">
              Prioridade: {prioridade.numero_prioridade}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {prioridade.documentos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Nenhum documento cadastrado</div>
          ) : (
            <div className="space-y-4">
              {prioridade.documentos.map((doc) => (
                <div
                  key={doc.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="mb-3">
                    <label className="font-medium text-gray-900">{doc.nome_documento}</label>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <div className="grid grid-cols-1 gap-2">
                      <button
                        onClick={() => handleStatusChange(doc.id, 'cadastrado')}
                        className={`flex items-center gap-3 p-3 border-2 rounded-lg transition-all ${
                          documentosStatus[doc.id] === 'cadastrado'
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-green-300'
                        }`}
                      >
                        <span className="text-xl">🟢</span>
                        <span className="font-medium text-gray-900">Cadastrado</span>
                      </button>

                      <button
                        onClick={() => handleStatusChange(doc.id, 'em_elaboracao')}
                        className={`flex items-center gap-3 p-3 border-2 rounded-lg transition-all ${
                          documentosStatus[doc.id] === 'em_elaboracao'
                            ? 'border-yellow-500 bg-yellow-50'
                            : 'border-gray-200 hover:border-yellow-300'
                        }`}
                      >
                        <span className="text-xl">🟡</span>
                        <span className="font-medium text-gray-900">Em Elaboração</span>
                      </button>

                      <button
                        onClick={() => handleStatusChange(doc.id, 'sem_documento')}
                        className={`flex items-center gap-3 p-3 border-2 rounded-lg transition-all ${
                          documentosStatus[doc.id] === 'sem_documento'
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 hover:border-red-300'
                        }`}
                      >
                        <span className="text-xl">🔴</span>
                        <span className="font-medium text-gray-900">Sem Documento</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
