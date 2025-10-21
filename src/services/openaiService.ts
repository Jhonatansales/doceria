interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatResponse {
  message: string;
  error?: string;
}

const OPENAI_API_KEY = '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';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export const sendMessageToOpenAI = async (
  messages: ChatMessage[]
): Promise<ChatResponse> => {
  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `Você é um assistente inteligente para um sistema de gestão de confeitaria.
            Você pode ajudar o usuário com:
            - Gerenciamento de clientes, produtos e receitas
            - Cálculo de custos e precificação
            - Organização de vendas e orçamentos
            - Controle de estoque de insumos
            - Análise de gastos e receitas
            - Cronograma de produção

            Seja prestativo, profissional e forneça respostas claras e objetivas.
            Quando o usuário pedir para fazer mudanças no sistema, explique claramente o que seria necessário.`
          },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Erro ao comunicar com OpenAI');
    }

    const data = await response.json();
    return {
      message: data.choices[0]?.message?.content || 'Sem resposta',
    };
  } catch (error) {
    console.error('Erro ao chamar OpenAI:', error);
    return {
      message: '',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
};

export const getChatHistory = (): ChatMessage[] => {
  const stored = localStorage.getItem('chat_history');
  return stored ? JSON.parse(stored) : [];
};

export const saveChatHistory = (messages: ChatMessage[]): void => {
  localStorage.setItem('chat_history', JSON.stringify(messages));
};

export const clearChatHistory = (): void => {
  localStorage.removeItem('chat_history');
};
