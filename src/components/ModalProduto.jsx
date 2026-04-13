// ModalProduto.jsx
import { useState, useEffect } from "react";

export default function ModalProduto({ produto, fechar, aoAdicionar }) {
  if (!produto) return null;

  // Estado para gerenciar a imagem principal exibida (Ponto 4)
  const [imagemAtiva, setImagemAtiva] = useState(produto.imagem);

  // Cria a lista completa de imagens: principal + adicionais
  const todasAsImagens = [produto.imagem, ...(produto.imagens_adicionais || [])];

  // Reseta a imagem ativa se o produto mudar (caso o modal reabra com outro produto)
  useEffect(() => {
    setImagemAtiva(produto.imagem);
  }, [produto]);

  return (
    <div className="modal-overlay" onClick={fechar}>
      <div className="product-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal" onClick={fechar}>✕</button>
        
        {/* LADO ESQUERDO: GALERIA DE IMAGENS (Ponto 4) */}
        <div className="product-gallery-container">
          {/* Exibição da Imagem Principal Padronizada (Ponto 5) */}
          <div className="main-image-wrapper">
            <img src={imagemAtiva} alt={produto.titulo} />
          </div>

          {/* Miniaturas Clicáveis (Ponto 4) */}
          {todasAsImagens.length > 1 && (
            <div className="thumbnails-container">
              {todasAsImagens.map((img, index) => (
                <div 
                  key={index} 
                  className={`thumbnail-item ${imagemAtiva === img ? 'active' : ''}`}
                  onClick={() => setImagemAtiva(img)} // Muda a imagem principal ao clicar
                >
                  <img src={img} alt={`${produto.titulo} - vista ${index + 1}`} />
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* LADO DIREITO: INFORMAÇÕES DO PRODUTO */}
        <div className="product-info-wrapper">
          <span style={{color: 'var(--primary)', fontWeight: 'bold', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px'}}>Orgânico</span>
          <h2>{produto.titulo}</h2>
          <div className="price">R$ {produto.preco.toFixed(2)}</div>
          
          <p className="description">
            {produto.descricao || "Este produto orgânico premium é cuidadosamente selecionado para garantir a melhor qualidade e frescor direto para sua mesa. Cultivado sem pesticidas artificiais."}
          </p>
          
          <div style={{display: 'flex', gap: '20px', alignItems: 'center'}}>
            <button className="btn-pill" onClick={() => { aoAdicionar(produto); fechar(); }}>
              ADICIONAR AO CARRINHO
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}