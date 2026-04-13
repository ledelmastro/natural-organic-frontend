export default function CarrinhoLateral({ estaAberto, aoFechar, itens, aoAtualizar, aoRemover }) {
  const total = itens.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);

  return (
    <>
      {/* 1. FECHAR AO CLICAR FORA: 
         O overlay agora ocupa a tela toda atrás do carrinho. 
         Ao clicar nele, chamamos aoFechar.
      */}
      {estaAberto && (
        <div 
          className="overlay-blur" 
          onClick={aoFechar}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 998
          }}
        ></div>
      )}
      
      <div className={`cart-drawer ${estaAberto ? 'open' : ''}`} style={{
        display: 'flex',
        flexDirection: 'column', // Faz o carrinho se comportar como uma coluna
        height: '100vh'          // Garante que ele ocupe a altura toda da tela
      }}>
        <div className="cart-header">
          <div className="header-empty-space"></div>
          <h3>🛒 Seu Carrinho</h3>
          <button className="close-btn" onClick={aoFechar}>✕</button>
        </div>
        
        {/* 2. ROLAMENTO VERTICAL: 
           A lista de itens ganha flex: 1 para ocupar o espaço disponível
           e overflow-y: auto para rolar apenas aqui.
        */}
        <div className="cart-list" style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '10px' 
        }}>
          {itens.length === 0 ? (
            <div style={{ textAlign: 'center', marginTop: '50px', color: '#999' }}>
              <p style={{ fontSize: '40px' }}>📦</p>
              <p>O seu carrinho está vazio</p>
            </div>
          ) : (
            itens.map((item) => (
              <div className="cart-item" key={item.id}>
                <img src={item.imagem} alt={item.titulo} className="cart-item-img" />
                <div className="cart-item-info">
                  <h4>{item.titulo}</h4>
                  <span className="price">R$ {item.preco.toFixed(2)}</span>
                  <div className="cart-controls-small">
                    <button onClick={() => aoAtualizar(item.id, item.quantidade - 1)}>-</button>
                    <span>{item.quantidade}</span>
                    <button onClick={() => aoAtualizar(item.id, item.quantidade + 1)}>+</button>
                    <button className="del-btn" onClick={() => aoRemover(item.id)}>🗑️</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* RODAPÉ FIXO: 
           Como a 'cart-list' tem flex: 1, este rodapé sempre ficará 
           no final do carrinho, visível mesmo com muitos itens.
        */}
        {itens.length > 0 && (
          <div className="cart-footer" style={{ 
            borderTop: '1px solid #eee', 
            padding: '20px',
            background: '#fff' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontWeight: 'bold', fontSize: '18px' }}>
              <span>Total:</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>
            <button className="btn-pill" style={{ width: '100%' }}>
              FINALIZAR COMPRA
            </button>
          </div>
        )}
      </div>
    </>
  );
}