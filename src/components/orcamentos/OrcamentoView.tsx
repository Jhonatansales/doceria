import React from 'react';
import { Printer, MessageCircle, ShoppingCart, CreditCard as Edit2, CheckCircle, XCircle } from 'lucide-react';
import Button from '../common/Button';
import { Orcamento } from '../../types';
import { orcamentosService } from '../../services/orcamentosService';

interface OrcamentoViewProps {
  orcamento: Orcamento;
  onClose: () => void;
  onRefresh: () => void;
}

const OrcamentoView: React.FC<OrcamentoViewProps> = ({ orcamento, onClose, onRefresh }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handlePrint = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Orçamento ${orcamento.numero_orcamento}</title>
          <style>
            @media print {
              .no-print { display: none !important; }
            }
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
              color: #333;
            }
            .header { 
              text-align: center; 
              border-bottom: 3px solid #e91e63; 
              padding-bottom: 20px; 
              margin-bottom: 30px; 
            }
            .company-name { 
              font-size: 32px; 
              font-weight: bold; 
              color: #e91e63; 
              margin-bottom: 10px; 
            }
            .document-title { 
              font-size: 24px; 
              color: #666; 
              margin-bottom: 5px; 
            }
            .document-number { 
              font-size: 18px; 
              color: #999; 
            }
            .section { 
              margin-bottom: 25px; 
            }
            .section-title { 
              font-size: 18px; 
              font-weight: bold; 
              color: #e91e63; 
              border-bottom: 1px solid #eee; 
              padding-bottom: 5px; 
              margin-bottom: 15px; 
            }
            .client-info { 
              background: #f8f9fa; 
              padding: 15px; 
              border-radius: 8px; 
              margin-bottom: 20px; 
            }
            .items-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 20px; 
            }
            .items-table th, .items-table td { 
              border: 1px solid #ddd; 
              padding: 12px; 
              text-align: left; 
            }
            .items-table th { 
              background: #e91e63; 
              color: white; 
              font-weight: bold; 
            }
            .items-table tr:nth-child(even) { 
              background: #f8f9fa; 
            }
            .total-section { 
              background: #e91e63; 
              color: white; 
              padding: 20px; 
              border-radius: 8px; 
              text-align: center; 
              margin: 20px 0; 
            }
            .total-value { 
              font-size: 36px; 
              font-weight: bold; 
              margin: 10px 0; 
            }
            .footer { 
              text-align: center; 
              margin-top: 40px; 
              padding-top: 20px; 
              border-top: 1px solid #eee; 
              color: #666; 
            }
            .validity { 
              background: #fff3cd; 
              border: 1px solid #ffeaa7; 
              padding: 15px; 
              border-radius: 8px; 
              margin: 20px 0; 
              text-align: center; 
            }
            .observations { 
              background: #e3f2fd; 
              border-left: 4px solid #2196f3; 
              padding: 15px; 
              margin: 20px 0; 
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">Delícias da Dri</div>
            <div class="document-title">ORÇAMENTO</div>
            <div class="document-number">${orcamento.numero_orcamento}</div>
          </div>

          <div class="section">
            <div class="section-title">DADOS DO CLIENTE</div>
            <div class="client-info">
              <strong>Nome:</strong> ${orcamento.cliente_nome}<br>
              ${orcamento.cliente_whatsapp ? `<strong>WhatsApp:</strong> ${orcamento.cliente_whatsapp}<br>` : ''}
              ${orcamento.cliente_endereco ? `<strong>Endereço:</strong> ${orcamento.cliente_endereco}<br>` : ''}
              <strong>Data do Orçamento:</strong> ${formatDate(orcamento.data_criacao)}
            </div>
          </div>

          <div class="section">
            <div class="section-title">ITENS DO PEDIDO</div>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Quantidade</th>
                  <th>Valor Unitário</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${orcamento.itens.map(item => `
                  <tr>
                    <td>${item.produto?.nome || 'Produto'}</td>
                    <td>${item.quantidade}</td>
                    <td>${formatCurrency(item.preco_unitario)}</td>
                    <td>${formatCurrency(item.subtotal)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="total-section">
            <div>VALOR TOTAL</div>
            <div class="total-value">${formatCurrency(orcamento.total)}</div>
          </div>

          <div class="validity">
            <strong>⏰ VALIDADE:</strong> Este orçamento é válido até ${formatDate(orcamento.data_validade)}
          </div>

          ${orcamento.observacoes ? `
            <div class="observations">
              <strong>📝 OBSERVAÇÕES:</strong><br>
              ${orcamento.observacoes}
            </div>
          ` : ''}

          <div class="footer">
            <p><strong>Delícias da Dri</strong></p>
            <p>Obrigado pela preferência!</p>
            <p>Data de impressão: ${new Date().toLocaleString('pt-BR')}</p>
          </div>
        </body>
      </html>
    `;

    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    document.body.appendChild(printFrame);

    const frameDoc = printFrame.contentWindow?.document;
    if (frameDoc) {
      frameDoc.open();
      frameDoc.write(printContent);
      frameDoc.close();

      printFrame.contentWindow?.focus();
      printFrame.contentWindow?.print();

      setTimeout(() => {
        document.body.removeChild(printFrame);
      }, 1000);
    }
  };

  const handleWhatsApp = () => {
    const message = `Olá! Segue o seu orçamento da Delícias da Dri no valor de ${formatCurrency(orcamento.total)}. Válido até ${formatDate(orcamento.data_validade)}.`;
    const whatsappUrl = `https://wa.me/55${orcamento.cliente_whatsapp?.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleConvertToSale = () => {
    // Implementar conversão para venda
    alert('Funcionalidade de conversão para venda será implementada em breve!');
  };

  const handleUpdateStatus = async (newStatus: 'aprovado' | 'rejeitado') => {
    try {
      await orcamentosService.update(orcamento.id, { status: newStatus });
      onRefresh();
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status. Tente novamente.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com ações */}
      <div className="flex justify-between items-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-xl">
        <div>
          <h2 className="text-2xl font-bold">{orcamento.numero_orcamento}</h2>
          <p className="text-blue-100">{orcamento.cliente_nome}</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="secondary" onClick={handlePrint} size="sm">
            <Printer className="w-4 h-4" />
            <span>Imprimir</span>
          </Button>
          {orcamento.cliente_whatsapp && (
            <Button variant="secondary" onClick={handleWhatsApp} size="sm">
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </Button>
          )}
        </div>
      </div>

      {/* Visualização do orçamento */}
      <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-lg">
        <div className="text-center border-b-2 border-pink-500 pb-6 mb-8">
          <h1 className="text-4xl font-bold text-pink-600 mb-2">Delícias da Dri</h1>
          <h2 className="text-2xl text-gray-600 mb-2">ORÇAMENTO</h2>
          <p className="text-lg text-gray-500">{orcamento.numero_orcamento}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-bold text-pink-600 mb-4">DADOS DO CLIENTE</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><strong>Nome:</strong> {orcamento.cliente_nome}</p>
              {orcamento.cliente_whatsapp && (
                <p><strong>WhatsApp:</strong> {orcamento.cliente_whatsapp}</p>
              )}
              {orcamento.cliente_endereco && (
                <p><strong>Endereço:</strong> {orcamento.cliente_endereco}</p>
              )}
              <p><strong>Data:</strong> {formatDate(orcamento.data_criacao)}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-pink-600 mb-4">STATUS</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                orcamento.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                orcamento.status === 'aprovado' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {orcamento.status === 'pendente' && '⏳ Pendente'}
                {orcamento.status === 'aprovado' && '✅ Aprovado'}
                {orcamento.status === 'rejeitado' && '❌ Rejeitado'}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-bold text-pink-600 mb-4">ITENS DO PEDIDO</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-pink-500 text-white">
                  <th className="border border-gray-300 p-3 text-left">Produto</th>
                  <th className="border border-gray-300 p-3 text-center">Quantidade</th>
                  <th className="border border-gray-300 p-3 text-right">Valor Unitário</th>
                  <th className="border border-gray-300 p-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {orcamento.itens.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="border border-gray-300 p-3">{item.produto?.nome}</td>
                    <td className="border border-gray-300 p-3 text-center">{item.quantidade}</td>
                    <td className="border border-gray-300 p-3 text-right">{formatCurrency(item.preco_unitario)}</td>
                    <td className="border border-gray-300 p-3 text-right">{formatCurrency(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-pink-500 text-white p-6 rounded-lg text-center mb-8">
          <h3 className="text-lg mb-2">VALOR TOTAL</h3>
          <p className="text-4xl font-bold">{formatCurrency(orcamento.total)}</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-center mb-8">
          <p className="text-yellow-800">
            <strong>⏰ VALIDADE:</strong> Este orçamento é válido até {formatDate(orcamento.data_validade)}
          </p>
        </div>

        {orcamento.observacoes && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
            <h4 className="font-bold text-blue-800 mb-2">📝 OBSERVAÇÕES:</h4>
            <p className="text-blue-700">{orcamento.observacoes}</p>
          </div>
        )}

        <div className="text-center text-gray-600 border-t pt-6">
          <p><strong>Delícias da Dri</strong></p>
          <p>Obrigado pela preferência!</p>
        </div>
      </div>

      {/* Ações do orçamento */}
      <div className="flex justify-between items-center bg-gray-50 p-6 rounded-xl">
        <div className="flex space-x-3">
          {orcamento.status === 'pendente' && (
            <>
              <Button 
                variant="success" 
                onClick={() => handleUpdateStatus('aprovado')}
                size="sm"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Marcar como Aprovado</span>
              </Button>
              <Button 
                variant="danger" 
                onClick={() => handleUpdateStatus('rejeitado')}
                size="sm"
              >
                <XCircle className="w-4 h-4" />
                <span>Marcar como Rejeitado</span>
              </Button>
            </>
          )}
          {orcamento.status === 'pendente' && (
            <Button 
              variant="primary" 
              onClick={handleConvertToSale}
              size="sm"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Converter em Venda</span>
            </Button>
          )}
        </div>
        
        <Button variant="secondary" onClick={onClose}>
          Fechar
        </Button>
      </div>
    </div>
  );
};

export default OrcamentoView;