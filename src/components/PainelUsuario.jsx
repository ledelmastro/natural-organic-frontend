import React, { useState, useEffect } from 'react';

export default function PainelUsuario({ aoFechar }) {
  const [favoritos, setFavoritos] = useState([]);
  const [editando, setEditando] = useState(null);
  const [novoApelido, setNovoApelido] = useState("");

  const carregarFavoritos = async () => {
    try {
      const res = await fetch("http://localhost:8000/geolocalizacao/favoritos");
      const data = await res.json();
      setFavoritos(data);
    } catch (err) {
      console.error("Erro ao carregar favoritos", err);
    }
  };

  useEffect(() => {
    carregarFavoritos();
  }, []);

  const removerFavorito = async (id) => {
    if (!confirm("Deseja remover esta loja dos favoritos?")) return;
    await fetch(`http://localhost:8000/geolocalizacao/favoritos/${id}`, { method: 'DELETE' });
    carregarFavoritos();
  };

  const salvarEdicao = async (fav) => {
    await fetch(`http://localhost:8000/geolocalizacao/favoritos/${fav.id_favorito}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        loja_id: fav.loja_id,
        apelido: novoApelido,
        cep_usuario: fav.cep_usuario
      }),
    });
    setEditando(null);
    carregarFavoritos();
  };

  // Estilos inline para evitar erros de build
  const estilos = {
    overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 3000, display: 'flex', justifyContent: 'center', alignItems: 'center' },
    modal: { background: 'white', width: '90%', maxWidth: '800px', height: '80vh', borderRadius: '20px', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    header: { padding: '20px', background: '#16a34a', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    body: { padding: '20px', overflowY: 'auto', flex: 1 },
    favGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginTop: '20px' },
    favCard: { padding: '15px', border: '1px solid #eee', borderRadius: '12px', background: '#f9f9f9' }
  };

  return (
    <div style={estilos.overlay} onClick={aoFechar}>
      <div style={estilos.modal} onClick={e => e.stopPropagation()}>
        <div style={estilos.header}>
          <h2 style={{margin: 0}}>👤 Meu Perfil</h2>
          <button onClick={aoFechar} style={{background:'none', border:'none', color:'white', fontSize:'20px', cursor:'pointer'}}>✕</button>
        </div>

        <div style={estilos.body}>
          <h3>Minhas Unidades Favoritas</h3>
          <div style={estilos.favGrid}>
            {favoritos.length === 0 ? <p>Nenhum favorito encontrado.</p> : favoritos.map((fav) => (
              <div key={fav.id_favorito} style={estilos.favCard}>
                {editando === fav.id_favorito ? (
                  <div>
                    <input 
                      style={{width: '100%', padding: '8px', marginBottom: '10px'}}
                      value={novoApelido} 
                      onChange={(e) => setNovoApelido(e.target.value)}
                    />
                    <button onClick={() => salvarEdicao(fav)}>Salvar</button>
                    <button onClick={() => setEditando(null)}>Cancelar</button>
                  </div>
                ) : (
                  <div>
                    <h4 style={{margin: '0 0 5px 0', color: '#16a34a'}}>{fav.apelido}</h4>
                    <p style={{margin: 0, fontSize: '14px'}}>{fav.nome_loja}</p>
                    <div style={{marginTop: '10px', display: 'flex', gap: '10px'}}>
                      <button onClick={() => { setEditando(fav.id_favorito); setNovoApelido(fav.apelido); }} style={{cursor:'pointer'}}>✏️</button>
                      <button onClick={() => removerFavorito(fav.id_favorito)} style={{cursor:'pointer', color: 'red'}}>🗑️</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}