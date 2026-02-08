import { useState } from 'react';
import { LogOut, FileText, ClipboardList } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { CadastrarPrioridade } from './CadastrarPrioridade';
import { AcompanharPrioridades } from './AcompanharPrioridades';

type Tab = 'cadastrar' | 'acompanhar';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('cadastrar');
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">Controle de Convênios e Prioridades</h1>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('cadastrar')}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'cadastrar'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileText className="w-5 h-5" />
                Cadastrar Prioridade
              </button>
              <button
                onClick={() => setActiveTab('acompanhar')}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'acompanhar'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <ClipboardList className="w-5 h-5" />
                Acompanhar Prioridades
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'cadastrar' ? (
              <CadastrarPrioridade onSuccess={() => setActiveTab('acompanhar')} />
            ) : (
              <AcompanharPrioridades />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
