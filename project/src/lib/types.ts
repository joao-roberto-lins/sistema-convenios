export type Database = {
  public: {
    Tables: {
      prioridades: {
        Row: {
          id: string;
          protocolo: string;
          numero_prioridade: string;
          descricao: string;
          data_liberacao: string;
          prazo_maximo: string;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          protocolo: string;
          numero_prioridade: string;
          descricao: string;
          data_liberacao: string;
          prazo_maximo: string;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          protocolo?: string;
          numero_prioridade?: string;
          descricao?: string;
          data_liberacao?: string;
          prazo_maximo?: string;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      documentos: {
        Row: {
          id: string;
          prioridade_id: string;
          nome_documento: string;
          status: 'sem_documento' | 'em_elaboracao' | 'cadastrado';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          prioridade_id: string;
          nome_documento: string;
          status?: 'sem_documento' | 'em_elaboracao' | 'cadastrado';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          prioridade_id?: string;
          nome_documento?: string;
          status?: 'sem_documento' | 'em_elaboracao' | 'cadastrado';
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};

export type Prioridade = Database['public']['Tables']['prioridades']['Row'];
export type Documento = Database['public']['Tables']['documentos']['Row'];

export type PrioridadeWithDocumentos = Prioridade & {
  documentos: Documento[];
};
