import type { Documento } from './types';

export function calcularPercentualExecucao(documentos: Documento[]): number {
  if (documentos.length === 0) return 0;

  const cadastrados = documentos.filter((doc) => doc.status === 'cadastrado').length;
  return Math.round((cadastrados / documentos.length) * 100);
}

export function getAlertaPrazo(prazoMaximo: string): {
  color: 'green' | 'yellow' | 'red';
  label: string;
  dias: number;
} {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const prazo = new Date(prazoMaximo);
  prazo.setHours(0, 0, 0, 0);

  const diffTime = prazo.getTime() - hoje.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      color: 'red',
      label: 'Vencido',
      dias: diffDays,
    };
  } else if (diffDays < 5) {
    return {
      color: 'red',
      label: `${diffDays} dias`,
      dias: diffDays,
    };
  } else if (diffDays <= 15) {
    return {
      color: 'yellow',
      label: `${diffDays} dias`,
      dias: diffDays,
    };
  } else {
    return {
      color: 'green',
      label: `${diffDays} dias`,
      dias: diffDays,
    };
  }
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR');
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    sem_documento: 'Sem Documento',
    em_elaboracao: 'Em Elaboração',
    cadastrado: 'Cadastrado',
  };
  return labels[status] || status;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    sem_documento: 'bg-red-100 text-red-800',
    em_elaboracao: 'bg-yellow-100 text-yellow-800',
    cadastrado: 'bg-green-100 text-green-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}
