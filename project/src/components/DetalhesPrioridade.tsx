import { X, FileDown, Calendar, Clock, FileText } from 'lucide-react';
import type { PrioridadeWithDocumentos } from '../lib/types';
import {
  calcularPercentualExecucao,
  getAlertaPrazo,
  formatDate,
  getStatusLabel,
  getStatusColor,
} from '../lib/utils';
import { jsPDF } from 'jspdf';

interface Props {
  prioridade: PrioridadeWithDocumentos;
  onClose: () => void;
}

export function DetalhesPrioridade({ prioridade, onClose }: Props) {
  const percentual = calcularPercentualExecucao(prioridade.documentos);
  const alerta = getAlertaPrazo(prioridade.prazo_maximo);

  const handleGerarPDF = () => {
    const doc = new jsPDF();
    
    // Configurações de Layout
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margins = { left: 30, right: 20, top: 20, bottom: 20 };
    const contentWidth = pageWidth - margins.left - margins.right;
    
    // Cores
    const colors = {
      primary: [0, 51, 102],
      secondary: [80, 80, 80],
      accent: [220, 220, 220],
    };

    let y = margins.top;

    // --- Funções Auxiliares ---

    const drawHeader = () => {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      
      doc.text('PREFEITURA MUNICIPAL DE CERRO AZUL - PR', pageWidth / 2, margins.top, { align: 'center' });
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
      doc.text('SECRETARIA DE PLANEJAMENTO INTEGRADO', pageWidth / 2, margins.top + 5, { align: 'center' });
      doc.text('CAPTAÇÃO DE RECURSOS E DESENVOLVIMENTO ECONÔMICO', pageWidth / 2, margins.top + 9, { align: 'center' });
      
      doc.setDrawColor(200, 200, 200);
      doc.line(margins.left, margins.top + 12, pageWidth - margins.right, margins.top + 12);
      
      return margins.top + 20;
    };

    const drawFooter = (pageNumber: number, totalPages: number) => {
      const footerY = pageHeight - 10;
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      
      const date = new Date().toLocaleDateString('pt-BR');
      const time = new Date().toLocaleTimeString('pt-BR');
      
      doc.text(`Gerado em: ${date} às ${time}`, margins.left, footerY);
      doc.text(`Página ${pageNumber} de ${totalPages}`, pageWidth - margins.right, footerY, { align: 'right' });
    };

    const drawSectionTitle = (title: string, posY: number) => {
      doc.setFillColor(240, 242, 245);
      doc.rect(margins.left, posY - 4, contentWidth, 7, 'F');
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(title.toUpperCase(), margins.left + 2, posY + 1);
      return posY + 8;
    };

    // --- Início do Documento ---

    y = drawHeader();

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('RELATÓRIO DE ACOMPANHAMENTO', pageWidth / 2, y, { align: 'center' });
    y += 10;

    // 1. DADOS GERAIS
    y = drawSectionTitle('Dados da Prioridade', y);
    
    doc.setFontSize(10);
    const col1 = margins.left;
    const col2 = margins.left + (contentWidth / 2);

    doc.setFont('helvetica', 'bold');
    doc.text('Protocolo:', col1, y);
    doc.setFont('helvetica', 'normal');
    doc.text(prioridade.protocolo, col1 + 25, y);

    doc.setFont('helvetica', 'bold');
    doc.text('Nº Prioridade:', col2, y);
    doc.setFont('helvetica', 'normal');
    doc.text(prioridade.numero_prioridade, col2 + 25, y);
    y += 6;

    doc.setFont('helvetica', 'bold');
    doc.text('Data Liberação:', col1, y);
    doc.setFont('helvetica', 'normal');
    doc.text(formatDate(prioridade.data_liberacao), col1 + 28, y);

    doc.setFont('helvetica', 'bold');
    doc.text('Prazo Máximo:', col2, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(180, 0, 0);
    doc.text(formatDate(prioridade.prazo_maximo), col2 + 28, y);
    doc.setTextColor(0,0,0);
    y += 8;

    doc.setFont('helvetica', 'bold');
    doc.text('Descrição:', col1, y);
    y += 5;
    
    doc.setFont('helvetica', 'normal');
    const splitDesc = doc.splitTextToSize(prioridade.descricao, contentWidth);
    doc.text(splitDesc, col1, y);
    y += (splitDesc.length * 4) + 6;

    // 2. STATUS E EXECUÇÃO
    y = drawSectionTitle('Status e Execução', y);

    const statusText = alerta.dias < 0 ? 'Vencido' : alerta.color === 'red' ? 'Urgente' : alerta.color === 'yellow' ? 'Atenção' : 'No Prazo';
    
    doc.text(`Situação Atual: ${statusText}`, col1, y);
    doc.text(`Dias Restantes: ${alerta.dias >= 0 ? alerta.dias : 'Vencido'} dias`, col2, y);
    y += 6;

    doc.text(`Progresso (${percentual}%):`, col1, y);
    y += 2;
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(240, 240, 240);
    doc.rect(col1, y, contentWidth, 5, 'FD');
    doc.setFillColor(percentual === 100 ? 34 : 0, percentual === 100 ? 139 : 51, percentual === 100 ? 34 : 102);
    doc.rect(col1, y, (contentWidth * percentual) / 100, 5, 'F');
    y += 12;

    // 3. DOCUMENTOS COM CORREÇÃO DE QUEBRA DE LINHA
    if (y > pageHeight - 40) {
      doc.addPage();
      y = drawHeader();
    }

    y = drawSectionTitle('Documentos Cadastrados', y);

    if (prioridade.documentos.length === 0) {
      doc.setFont('helvetica', 'italic');
      doc.text('Nenhum documento vinculado a esta prioridade.', margins.left, y);
    } else {
      // Configurações da Tabela
      const statusColWidth = 35;
      const docColWidth = contentWidth - statusColWidth - 5; // Espaço para o nome do documento
      
      // Cabeçalho da Tabela
      doc.setFillColor(230, 230, 230);
      doc.rect(margins.left, y - 4, contentWidth, 6, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('DOCUMENTO', margins.left + 2, y);
      doc.text('STATUS', pageWidth - margins.right - 2, y, { align: 'right' }); // Alinhado à direita
      y += 4;

      doc.setFont('helvetica', 'normal');
      
      // Loop dos Documentos
      prioridade.documentos.forEach((docItem, index) => {
        // CORREÇÃO: Quebrar texto longo
        const nomeDoc = `${index + 1}. ${docItem.nome_documento}`;
        // Calcula quantas linhas o texto vai ocupar nessa largura (docColWidth)
        const splitNome = doc.splitTextToSize(nomeDoc, docColWidth);
        const linhas = splitNome.length;
        
        // Altura dinâmica da linha (cada linha de texto = 4 unidades + 4 de respiro)
        const rowHeight = (linhas * 4) + 4; 

        // Nova página se não couber essa linha inteira
        if (y + rowHeight > pageHeight - 20) {
          doc.addPage();
          y = drawHeader();
          y += 5;
        }

        // Zebra striping
        if (index % 2 === 0) {
          doc.setFillColor(250, 250, 250);
          doc.rect(margins.left, y, contentWidth, rowHeight, 'F'); // Retângulo com altura dinâmica
        }

        doc.setTextColor(0, 0, 0);
        // Desenha o texto do nome (pode ter várias linhas)
        doc.text(splitNome, margins.left + 2, y + 4);

        // Status (desenha sempre na primeira linha do bloco)
        const statusLabel = getStatusLabel(docItem.status);
        if (docItem.status === 'cadastrado') doc.setTextColor(0, 100, 0);
        else if (docItem.status === 'em_elaboracao') doc.setTextColor(180, 140, 0);
        else doc.setTextColor(180, 0, 0);

        doc.text(statusLabel, pageWidth - margins.right - 2, y + 4, { align: 'right' });
        
        y += rowHeight; // Avança Y baseado na altura calculada
      });
    }

    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      drawFooter(i, totalPages);
    }

    doc.save(`Prioridade_${prioridade.numero_prioridade}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-semibold text-gray-900">Detalhes da Prioridade</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Seção Dados Principais */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 space-y-4 border border-blue-100">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-700" />
              Dados da Prioridade
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Protocolo</label>
                <p className="text-gray-900 font-bold text-lg">{prioridade.protocolo}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Número</label>
                <p className="text-gray-900 font-bold text-lg">{prioridade.numero_prioridade}</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Descrição</label>
              <p className="text-gray-800 mt-1 leading-relaxed">{prioridade.descricao}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-blue-200/50">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <div>
                  <label className="text-xs text-gray-600 block">Data de Liberação</label>
                  <span className="font-medium">{formatDate(prioridade.data_liberacao)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-600" />
                <div>
                  <label className="text-xs text-gray-600 block">Prazo Máximo</label>
                  <span className="font-medium">{formatDate(prioridade.prazo_maximo)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Seção Gráfica de Progresso */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Andamento do Processo</h3>
                <span className={`px-3 py-1 text-sm font-bold rounded-full ${alerta.color === 'green' ? 'bg-green-100 text-green-800' : alerta.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                  {alerta.dias < 0 ? 'Vencido' : `${alerta.label} restantes`}
                </span>
             </div>

             <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div><span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">Execução</span></div>
                  <div className="text-right"><span className="text-xs font-semibold inline-block text-blue-600">{percentual}%</span></div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-100">
                  <div style={{ width: `${percentual}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-500"></div>
                </div>
             </div>
          </div>

          {/* Lista de Documentos */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pl-1 border-l-4 border-blue-600">Documentos Vinculados</h3>
            
            {prioridade.documentos.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500">Nenhum documento cadastrado.</div>
            ) : (
              <div className="overflow-hidden border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {prioridade.documentos.map((doc, index) => (
                      <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-900">{index + 1}. {doc.nome_documento}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>{getStatusLabel(doc.status)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-8">
            <button onClick={onClose} className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all">Fechar</button>
            <button onClick={handleGerarPDF} className="flex items-center gap-2 px-6 py-2.5 bg-blue-900 text-white font-medium rounded-lg hover:bg-blue-800 transition-all shadow-md">
              <FileDown className="w-5 h-5" />
              Baixar PDF Oficial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}