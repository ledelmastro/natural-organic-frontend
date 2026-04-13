import { useEffect, useState, useRef } from "react";

const ESTADOS_BR = {
  "AC": "Acre", "AL": "Alagoas", "AP": "Amapá", "AM": "Amazonas", "BA": "Bahia",
  "CE": "Ceará", "DF": "Distrito Federal", "ES": "Espírito Santo", "GO": "Goiás",
  "MA": "Maranhão", "MT": "Mato Grosso", "MS": "Mato Grosso do Sul", "MG": "Minas Gerais",
  "PA": "Pará", "PB": "Paraíba", "PR": "Paraná", "PE": "Pernambuco", "PI": "Piauí",
  "RJ": "Rio de Janeiro", "RN": "Rio Grande do Norte", "RS": "Rio Grande do Sul",
  "RO": "Rondônia", "RR": "Roraima", "SC": "Santa Catarina", "SP": "São Paulo",
  "SE": "Sergipe", "TO": "Tocantins"
};

const MOON_PHASES_BR = {
  "New Moon": "Lua Nova", "Waxing Crescent": "Crescente", "First Quarter": "Quarto Crescente",
  "Waxing Gibbous": "Gibosa Crescente", "Full Moon": "Lua Cheia", "Waning Gibbous": "Gibosa Minguante",
  "Last Quarter": "Quarto Minguante", "Waning Crescent": "Minguante"
};

// --- COMPONENTE DE VÍDEO BACKGROUND ---
function VideoBackground({ code, temp }) {
  const videoRef = useRef(null);
  
  // Lógica de seleção baseada nos links enviados
  const getBotVideo = () => {
    const isVeryHot = temp >= 29;
    
    // Chuva / Tempestade (Link: GSJ3LUM)
    if ([1087, 1273, 1276].includes(code)) return "/Chuva.mp4";

    if (code [1087, 1273, 1276]) return "/Chuva.mp4"; 
    
    // Possibilidade de Chuva (Link: DG8HTUW)
    if ([1063, 1069, 1072, 1150, 1153].includes(code)) return "/Possibilidade-de-chuva.mp4";
    
    // Nublado / Mudança (Link: K3D7KGA)
    if ([1003, 1006, 1009].includes(code)) return "/Nublado.mp4";
    
    // Ensolarado / Céu Limpo (Link: 75W3ZH2)
    return "/Ensolarado.mp4";
  };

  const videoSrc = getBotVideo();

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load(); // Recarrega o vídeo quando a fonte muda
    }
  }, [videoSrc]);

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 1, overflow: "hidden" }}>
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center"  }}
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
      {/* Camada de escurecimento para leitura do texto */}
      <div style={{ 
        position: "absolute", 
        inset: 0, 
        background: "linear-gradient(to bottom, rgba(55, 52, 52, 0.07), rgba(124, 111, 111, 0.24))",
        zIndex: 2 
      }} />
    </div>
  );
}

// --- DASHBOARD PRINCIPAL ---
// Adicionada a prop 'produtos' que deve vir do seu componente pai (App.jsx)
export default function ClimaDashboard({ cep, adicionarAoCarrinho, produtos = [] }) {
  const [clima, setClima] = useState(null);
  const [horaLocal, setHoraLocal] = useState("");
  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

  useEffect(() => {
    const t = setInterval(() => setHoraLocal(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    async function fetchData() {
      if (!cep || cep.length !== 8) return;
      try {
        const resVia = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const vData = await resVia.json();
        if (!vData.localidade) return;
        const q = `${vData.localidade}, ${ESTADOS_BR[vData.uf] || vData.uf}, Brazil`;
        const resW = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${encodeURIComponent(q)}&days=7&aqi=yes&lang=pt`);
        const wData = await resW.json();
        if (wData && !wData.error) setClima(wData);
      } catch (e) { console.error("Erro ao buscar clima:", e); }
    }
    fetchData();
  }, [cep, API_KEY]);

  if (!clima) return null;

  const { current, location, forecast } = clima;
  const isHot = current.temp_c >= 29;

  const formatIcon = (url) => url.startsWith("http") ? url : `https:${url}`;

  // Lógica de sugestão de IDs baseada na temperatura
    // 1. CORREÇÃO: Chave alterada para 'ids' (plural) para manter consistência
  const obterSugestao = () => {
    if (isHot) {
      // Sugestão para calor: Suco de Cenoura (108) + Itens refrescantes (101, 104)
      return { 
        ids: [108, 101, 104], 
        nome: "Combo Tropical Verão", 
        preco: 21.30 
      };
    }
    // Sugestão para clima ameno: Cenoura Baby (109), Cebola Roxa (110), Grão-de-Bico (114)
    return { 
      ids: [109, 110, 114], 
      nome: "Combo Legumes Nutritivos", 
      preco: 26.80 
    };
  };

  const sugestaoAtiva = obterSugestao();

  const handleAdicionarCombo = async () => {
  const itensParaAdicionar = produtos.filter(p => 
  p && 
  sugestaoAtiva.ids.includes(Number(p.id))
);

  if (itensParaAdicionar.length === 0) {
    console.error("IDs buscados:", sugestaoAtiva.ids);
    console.error("Produtos disponíveis:", produtos);
    alert("Os produtos deste combo não foram encontrados no estoque.");
    return;
  }

  try {
    await Promise.all(
      itensParaAdicionar.map(item =>
        fetch("http://localhost:8000/carrinho", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: Number(item.id),
            titulo: item.titulo,
            preco: Number(item.preco),
            imagem: item.imagem,
            quantidade: 1
          })
        })
      )
    );

    // 🔥 Atualiza carrinho só UMA VEZ
    await adicionarAoCarrinho({}); // ou melhor:

  } catch (err) {
    console.error("Erro ao adicionar combo:", err);
  }
};

return (
    <div style={{ 
      borderRadius: "24px", 
      padding: "20px", 
      color: "#fff", 
      position: "relative", 
      overflow: "hidden", 
      marginBottom: "30px", 
      boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
      minHeight: "300px"
    }}>
      
      {/* Background Animado com os seus vídeos */}
      <VideoBackground code={current.condition.code} temp={current.temp_c} />
      
      <div style={{ position: "relative", zIndex: 10, display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {/* Coluna Principal */}
        <div style={{ flex: "1.2", minWidth: "200px" }}>
          <div style={{ fontSize: "11px", opacity: 0.9, fontWeight: "bold", textShadow: "1px 1px 2px rgba(0,0,0,0.5)" }}>
            📍 {location.name}, {location.region}
          </div>
          <div style={{ fontSize: "18px", fontWeight: "bold" }}>{horaLocal} • {current.condition.text}</div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "10px 0" }}>
            <img src={formatIcon(current.condition.icon)} width="65" alt="icon" style={{ filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.5))" }} />
            <div style={{ fontSize: "52px", fontWeight: "200" }}>{Math.round(current.temp_c)}°C</div>
          </div>
          <div style={{ fontSize: "13px", background: "rgba(255,255,255,0.25)", backdropFilter: "blur(5px)", padding: "4px 12px", borderRadius: "10px", display: "inline-block" }}>
            🔥 Sensação: <strong>{Math.round(current.feelslike_c)}°C</strong>
          </div>
        </div>

        {/* Coluna Central Detalhes */}
        <div style={{ flex: "1", borderLeft: "1px solid rgba(255,255,255,0.3)", paddingLeft: "20px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontSize: "10px", fontWeight: "bold", opacity: 0.8 }}>UMIDADE / VENTO</div>
          <div style={{ fontSize: "16px", marginBottom: "12px", fontWeight: "bold" }}>{current.humidity}% | {current.wind_kph} km/h</div>
          <div style={{ fontSize: "10px", fontWeight: "bold", opacity: 0.8 }}>UV / AR (EPA)</div>
          <div style={{ fontSize: "16px", fontWeight: "bold" }}>{current.uv} / {current.air_quality?.["us-epa-index"] || 1}</div>
        </div>

        {/* Card de Sugestão */}
        <div style={{ flex: "1.5", background: "rgba(255,255,255,0.18)", backdropFilter: "blur(15px)", padding: "15px", borderRadius: "20px", textAlign: "center", border: "1px solid rgba(255,255,255,0.2)" }}>
          <div style={{ fontSize: "10px", fontWeight: "900", color: "#81d4fa" }}>SUGESTÃO DO CHEF</div>
          <div style={{ fontSize: "14px", fontWeight: "600", margin: "5px 0" }}>{sugestaoAtiva.nome}</div>
          <div style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "10px" }}>R$ {sugestaoAtiva.preco.toFixed(2).replace('.', ',')}</div>
          <button type="button" onClick={handleAdicionarCombo} style={{ width: "100%", background: "#2ecc71", color: "#fff", border: "none", padding: "12px", borderRadius: "20px", fontWeight: "bold", cursor: "pointer", boxShadow: "0 4px 15px rgba(46, 204, 113, 0.3)" }}>
            ADICIONAR AO CARRINHO 🛒
          </button>
        </div>
      </div>

      {/* Grid Previsão */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "10px", marginTop: "25px", position: "relative", zIndex: 10 }}>
        {forecast.forecastday.map((day, i) => (
          <div key={i} style={{ background: "rgba(0,0,0,0.2)", backdropFilter: "blur(5px)", padding: "12px 5px", borderRadius: "15px", textAlign: "center", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ fontSize: "11px", fontWeight: "bold" }}>{i === 0 ? "Hoje" : new Date(day.date + "T00:00:00").toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "")}</div>
            <img src={formatIcon(day.day.condition.icon)} width="30" alt="forecast" />
            <div style={{ fontSize: "13px", fontWeight: "bold" }}>{Math.round(day.day.maxtemp_c)}°</div>
          </div>
        ))}
      </div>
    </div>
  );
}