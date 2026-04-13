import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Localizacao from "./components/Localizacao"; 
import CategoriasMenu from "./components/CategoriasMenu";
import ListaProdutos from "./components/ListaProdutos";
import CarrinhoLateral from "./components/CarrinhoLateral";
import ModalProduto from "./components/ModalProduto";
import HeroSlider from "./components/HeroSlider";
import PainelUsuario from './components/PainelUsuario';
import ClimaWidget from "./components/ClimaWidget";
import ClimaDashboard from "./components/ClimaDashboard";

function PaginaHome({ adicionarAoCarrinho, setProdutoParaVisualizar }) {
  const [categoria, setCategoria] = useState(null);
  

  return (
    <>
      <HeroSlider />
      <section className="categories-section">
        <CategoriasMenu setCategoria={setCategoria} categoriaAtiva={categoria} />
      </section>
      <main className="content">
        <ListaProdutos 
          categoria={categoria} 
          aoAdicionar={adicionarAoCarrinho} 
          aoVisualizar={setProdutoParaVisualizar} 
        />
      </main>
    </>
  );
}

function PaginaEncontreUmaLoja({ adicionarAoCarrinho, produtos }) {
  return (
    <div style={{ minHeight: '80vh', backgroundColor: '#f9f9f9' }}>
      
      
      <HeroSlider />
      <div className="container" style={{ padding: "0px 0" }}>
        <div style={{ 
          maxWidth: '100%',
          margin: '25 auto', 
          padding: '20px 20px 60px' 
        }}>
        <div style={{ marginBottom: '10px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#1a1a1a', margin: '0 0 8px' }}>
            Encontre uma Loja
          </h1>
          <p style={{ color: '#666', fontSize: '16px', margin: 0 }}>
            Digite seu CEP para encontrar a unidade Natural Fresh mais próxima de você e simular a entrega.
          </p>
        </div>
        <Localizacao adicionarAoCarrinho={adicionarAoCarrinho} 
        produtos={produtos} /> 
      </div>
    </div>

    </div>
  );
}

function Layout({ itensCarrinho, setIsCarrinhoAberto, setPainelUsuarioAberto, children }) {
  return (
    <>
      <header className="main-header">
        <div className="header-left">
          <nav className="nav-main">
            <Link to="/">Início</Link>
            <Link to="/encontre-uma-loja">Encontre uma Loja</Link>
          </nav>
        </div>
        <div className="logo-center">
          <Link to="/" className="logo-brand">Natural Fresh</Link>
        </div>
        <div className="header-right">
          <div className="utility-icons">
            
           <ClimaWidget />

            <Link to="/encontre-uma-loja" style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
              <span title="Buscar Lojas">📍</span>
            </Link>

            <span 
              onClick={() => setPainelUsuarioAberto(true)} 
              style={{ cursor: 'pointer' }}
              title="Meu Painel"
            >
              👤
            </span>
            <div className="cart-icon-wrapper" onClick={() => setIsCarrinhoAberto(true)}>
              🛒 <span className="cart-count">{itensCarrinho.length}</span>
            </div>
          </div>
        </div>
      </header>
      {children}
      <footer className="footer-simple">
        <p>© 2026 Natural Fresh Organic Store. Projeto Final MVP - Backend Avançado</p>
      </footer>
    </>
  );
}

function App() {
  const [itensCarrinho, setItensCarrinho] = useState([]);
  const [produtoParaVisualizar, setProdutoParaVisualizar] = useState(null);
  const [isCarrinhoAberto, setIsCarrinhoAberto] = useState(false);
  const [painelUsuarioAberto, setPainelUsuarioAberto] = useState(false);
  const [produtos, setProdutos] = useState([]);

  const carregarCarrinho = () => {
    fetch("http://localhost:8000/carrinho")
      .then((res) => res.json())
      .then((data) => setItensCarrinho(data))
      .catch((err) => console.error("Erro ao carregar carrinho:", err));
  };

  useEffect(() => {
    carregarCarrinho();
  }, []);

  // 1. ADICIONAR
  const adicionarAoCarrinho = async (produto) => {
    try {
      await fetch("http://localhost:8000/carrinho", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: produto.id,
          titulo: produto.titulo,
          preco: produto.preco,      
          imagem: produto.imagem,
          quantidade: 1
        })
      });
      await carregarCarrinho(); // Espera o BD atualizar para recarregar a lista
      setIsCarrinhoAberto(true);
    } catch (err) {
      console.error("Erro ao adicionar:", err);
    }
  };

  // 2. ATUALIZAR QUANTIDADE
  const atualizarQuantidade = async (id, novaQuantidade) => {
    if (novaQuantidade < 1) return;
    try {
      await fetch(`http://localhost:8000/carrinho/${id}?quantidade=${novaQuantidade}`, {
        method: "PUT"
      });
      await carregarCarrinho(); // Recarrega em tempo real após a alteração
    } catch (err) {
      console.error("Erro ao atualizar quantidade:", err);
    }
  };

  // 3. REMOVER ITEM
  const removerItem = async (id) => {
    try {
      await fetch(`http://localhost:8000/carrinho/${id}`, {
        method: "DELETE"
      });
      await carregarCarrinho(); // Recarrega em tempo real após deletar
    } catch (err) {
      console.error("Erro ao remover item:", err);
    }
  };
 
  //4. CARREGAR PRODUTOS PARA SUGESTÕES DE CLIMA
  const carregarProdutos = () => {
    fetch("http://localhost:8000/produtos") // Verifique se sua rota é esta
      .then((res) => res.json())
      .then((data) => {
        console.log("Produtos carregados do banco:", data);
        setProdutos(data);
      })
      .catch((err) => console.error("Erro ao carregar produtos:", err));
  };
  useEffect(() => {
    carregarCarrinho();
    carregarProdutos(); 
  }, []);

  const [cepGlobal, setCepGlobal] = useState("");

  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          <Route path="/" element={
            <Layout 
              itensCarrinho={itensCarrinho} 
              setIsCarrinhoAberto={setIsCarrinhoAberto}
              setPainelUsuarioAberto={setPainelUsuarioAberto} // PASSEI A FUNÇÃO AQUI
            >
              <PaginaHome
                adicionarAoCarrinho={adicionarAoCarrinho}
                setProdutoParaVisualizar={setProdutoParaVisualizar}
                produtos={produtos}
              />
            </Layout>
          } />
          <Route path="/encontre-uma-loja" element={
            <Layout 
              itensCarrinho={itensCarrinho} 
              setIsCarrinhoAberto={setIsCarrinhoAberto}
              setPainelUsuarioAberto={setPainelUsuarioAberto} 
            >
              <PaginaEncontreUmaLoja adicionarAoCarrinho={adicionarAoCarrinho} 
              produtos={produtos} />
            </Layout>
          } />
        </Routes>

        {produtoParaVisualizar && (
          <ModalProduto 
            produto={produtoParaVisualizar} 
            fechar={() => setProdutoParaVisualizar(null)} 
            aoAdicionar={adicionarAoCarrinho}
          />
        )}

        <CarrinhoLateral 
          estaAberto={isCarrinhoAberto} 
          aoFechar={() => setIsCarrinhoAberto(false)} 
          itens={itensCarrinho}
          aoAtualizar={atualizarQuantidade}
          aoRemover={removerItem}
        />

        {painelUsuarioAberto && (
          <PainelUsuario aoFechar={() => setPainelUsuarioAberto(false)} />
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;