// ListaProdutos.jsx
import { useEffect, useState } from "react";

export default function ListaProdutos({ categoria, aoAdicionar, aoVisualizar }) {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Endpoint do seu backend (conforme definido no seu docker-compose.yml)
  const API_URL = "http://localhost:8000/produtos";

  useEffect(() => {
    async function buscarProdutosDoBackend() {
      setCarregando(true);
      try {
        // --- REQUISITO MVP: Chamada HTTP GET para componente Backend ---
        const resposta = await fetch(API_URL);
        
        if (!resposta.ok) {
          throw new Error("Erro ao carregar produtos do servidor.");
        }

        const dados = await resposta.json();

        // Lógica de filtragem baseada nos dados retornados pela API
        if (categoria) {
          const filtrados = dados.filter(p => p.categoria === categoria);
          setProdutos(filtrados);
        } else {
          setProdutos(dados);
        }
      } catch (error) {
        console.error("Falha na integração com o Backend:", error);
      } finally {
        setCarregando(false);
      }
    }

    buscarProdutosDoBackend();
  }, [categoria]);

  if (carregando) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
        Carregando produtos da Natural Organic Store...
      </div>
    );
  }

  return (
    <div>
      <div className="section-header" style={{textAlign: 'center', marginBottom: '40px'}}>
        <h2 style={{fontSize: '32px', color: '#1a1a1a'}}>
          {categoria ? `Categoria: ${categoria}` : "Mais Vendidos"}
        </h2>
        <p style={{color: '#666'}}>Produtos frescos vindos diretamente do nosso servidor</p>
      </div>

      <div className="products-grid">
        {produtos.length > 0 ? (
          produtos.map((p) => (
            <div className="product-card" key={p.id}>
              <div 
                className="card-image-wrapper" 
                onClick={() => aoVisualizar(p)} 
                style={{cursor: 'pointer', width: '100%', height: '250px'}}
              >
                <img 
                  src={p.imagem} 
                  alt={p.titulo} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{padding: '15px'}}>
                <h4 style={{ marginBottom: '10px', fontSize: '18px' }}>{p.titulo}</h4>
                <p className="price" style={{ fontWeight: 'bold', color: '#0d9658' }}>
                  R$ {Number(p.preco).toFixed(2).replace('.', ',')}
                </p>
                <button 
                  className="btn-pill" 
                  style={{padding: '12px 25px', marginTop: '15px', width: '100%'}} 
                  onClick={() => aoAdicionar(p)}
                >
                  Adicionar
                </button>
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '20px' }}>
            Nenhum produto disponível nesta categoria no momento.
          </div>
        )}
      </div>
    </div>
  );
}

