import { useState } from 'react';
import { ArrowRight, ArrowLeft, Plus, X, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  onSuccess: () => void;
}

interface PrioridadeData {
  protocolo: string;
  numero_prioridade: string;
  descricao: string;
  data_liberacao: string;
  prazo_maximo: string;
}

export function CadastrarPrioridade({ onSuccess }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();

  const [prioridadeData, setPrioridadeData] = useState<PrioridadeData>({
    protocolo: '',
    numero_prioridade: '',
    descricao: '',
    data_liberacao: '',
    prazo_maximo: '',
  });

  const [documentos, setDocumentos] = useState<string[]>([]);
  const [novoDocumento, setNovoDocumento] = useState('');

  const handleAddDocumento = () => {
    if (novoDocumento.trim()) {
      setDocumentos([...documentos, novoDocumento.trim()]);
      setNovoDocumento('');
    }
  };

  const handleRemoveDocumento = (index: number) => {
    setDocumentos(documentos.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleFinish = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: prioridade, error: prioridadeError } = await supabase
        .from('prioridades')
        .insert({
          ...prioridadeData,
          user_id: user.id,
        })
        .select()
        .single();

      if (prioridadeError) throw prioridadeError;

      if (documentos.length > 0) {
        const documentosData = documentos.map((nome) => ({
          prioridade_id: prioridade.id,
          nome_documento: nome,
          status: 'sem_documento' as const,
        }));

        const { error: documentosError } = await supabase
          .from('documentos')
          .insert(documentosData);

        if (documentosError) throw documentosError;
      }

      setSuccess(true);
      setTimeout(() => {
        setPrioridadeData({
          protocolo: '',
          numero_prioridade: '',
          descricao: '',
          data_liberacao: '',
          prazo_maximo: '',
        });
        setDocumentos([]);
        setStep(1);
        setSuccess(false);
        onSuccess();
      }, 1500);
    } catch (error) {
      console.error('Erro ao cadastrar prioridade:', error);
      alert('Erro ao cadastrar prioridade. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <CheckCircle className="w-16 h-16 text-green-500" />
        <h3 className="text-xl font-semibold text-gray-900">Prioridade cadastrada com sucesso!</h3>
        <p className="text-gray-600">Redirecionando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step === 1 ? 'bg-blue-600 text-white' : 'bg-green-500 text-white'}`}>
            1
          </div>
          <div className={`h-1 w-16 ${step === 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step === 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
            2
          </div>
        </div>
      </div>

      {step === 1 ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Dados da Prioridade</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número do Protocolo *
              </label>
              <input
                type="text"
                required
                value={prioridadeData.protocolo}
                onChange={(e) =>
                  setPrioridadeData({ ...prioridadeData, protocolo: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: 2024/001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número da Prioridade *
              </label>
              <input
                type="text"
                required
                value={prioridadeData.numero_prioridade}
                onChange={(e) =>
                  setPrioridadeData({ ...prioridadeData, numero_prioridade: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: PR-001"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição da Prioridade *
            </label>
            <textarea
              required
              value={prioridadeData.descricao}
              onChange={(e) =>
                setPrioridadeData({ ...prioridadeData, descricao: e.target.value })
              }
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Descreva a prioridade..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Liberação *
              </label>
              <input
                type="date"
                required
                value={prioridadeData.data_liberacao}
                onChange={(e) =>
                  setPrioridadeData({ ...prioridadeData, data_liberacao: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prazo Máximo para Execução *
              </label>
              <input
                type="date"
                required
                value={prioridadeData.prazo_maximo}
                onChange={(e) =>
                  setPrioridadeData({ ...prioridadeData, prazo_maximo: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleNext}
              disabled={
                !prioridadeData.protocolo ||
                !prioridadeData.numero_prioridade ||
                !prioridadeData.descricao ||
                !prioridadeData.data_liberacao ||
                !prioridadeData.prazo_maximo
              }
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Avançar para Documentos
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Cadastro de Documentos</h2>

          <div className="flex gap-2">
            <input
              type="text"
              value={novoDocumento}
              onChange={(e) => setNovoDocumento(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddDocumento()}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nome do documento..."
            />
            <button
              onClick={handleAddDocumento}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Adicionar
            </button>
          </div>

          {documentos.length > 0 && (
            <div className="border border-gray-200 rounded-lg divide-y">
              {documentos.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50">
                  <span className="text-gray-900">{doc}</span>
                  <button
                    onClick={() => handleRemoveDocumento(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {documentos.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhum documento adicionado ainda
            </div>
          )}

          <div className="flex justify-between pt-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </button>
            <button
              onClick={handleFinish}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Salvando...' : 'Finalizar Cadastro'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
