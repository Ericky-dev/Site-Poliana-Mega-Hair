import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { FaCopy, FaCheck, FaQrcode } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './PixPayment.css';

function PixPayment({ pixCode, amount }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      toast.success('Código PIX copiado!');
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      toast.error('Erro ao copiar código');
    }
  };

  return (
    <div className="pix-payment">
      <div className="pix-header">
        <FaQrcode className="pix-icon" />
        <h3>Pagamento via PIX</h3>
      </div>

      <div className="pix-amount">
        <span className="pix-amount-label">Valor do sinal (30%)</span>
        <span className="pix-amount-value">R$ {amount.toFixed(2)}</span>
      </div>

      <div className="pix-qrcode">
        <QRCodeSVG
          value={pixCode}
          size={200}
          level="M"
          includeMargin={true}
        />
      </div>

      <div className="pix-copy">
        <p className="pix-copy-label">Ou copie o código PIX:</p>
        <div className="pix-code-container">
          <code className="pix-code">{pixCode}</code>
        </div>
        <button
          className={`btn ${copied ? 'btn-success' : 'btn-primary'} pix-copy-btn`}
          onClick={handleCopy}
        >
          {copied ? <><FaCheck /> Copiado!</> : <><FaCopy /> Copiar Código</>}
        </button>
      </div>

      <div className="pix-instructions">
        <h4>Como pagar:</h4>
        <ol>
          <li>Abra o app do seu banco</li>
          <li>Escolha pagar com PIX</li>
          <li>Escaneie o QR Code ou cole o código</li>
          <li>Confirme o pagamento</li>
        </ol>
      </div>
    </div>
  );
}

export default PixPayment;
