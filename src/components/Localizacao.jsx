import React, { useState, useEffect, useRef } from "react";
import maplibregl from 'maplibre-gl';
import "maplibre-gl/dist/maplibre-gl.css";
import * as turf from "@turf/turf";
import ClimaDashboard from "./ClimaDashboard";

export default function Localizacao({ adicionarAoCarrinho, produtos }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const animationRef = useRef(null);
  const truckReadyRef = useRef(false);
  
  const [cep, setCep] = useState("");
  const [lojas, setLojas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userCoords, setUserCoords] = useState([-46.6333, -23.5505]);
  const [lojaSelecionada, setLojaSelecionada] = useState(null);
  const [fotoAtiva, setFotoAtiva] = useState(0);
  const [cepGlobal, setCepGlobal] = useState(""); 

  const MAP_STYLE = "https://tiles.openfreemap.org/styles/bright";

  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: MAP_STYLE,
      center: userCoords,
      zoom: 15.5,
      pitch: 45,
      bearing: -17.6,
      antialias: true
    });

    map.current.on("load", () => {
      // ✅ Evitar erros de ícones faltando no console
      map.current.on('styleimagemissing', (e) => {
        const id = e.id;
        if (!map.current.hasImage(id)) {
          // Cria um pixel transparente para silenciar o erro
          const data = new Uint8Array(4);
          map.current.addImage(id, { width: 1, height: 1, data: data });
        }
      });

      map.current.addSource("route-line", {
        type: "geojson",
        data: { type: "Feature", geometry: { type: "LineString", coordinates: [] } }
      });

      map.current.addSource("truck-point", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [{
            type: "Feature",
            properties: { bearing: 0 },
            geometry: { type: "Point", coordinates: userCoords }
          }]
        }
      });

      map.current.addLayer({
        id: "route-layer",
        type: "line",
        source: "route-line",
        paint: { "line-color": "#16a34a", "line-width": 5 }
      });

      map.current.addSource('openfreemap', {
        url: 'https://tiles.openfreemap.org/planet',
        type: 'vector',
      });

      map.current.addLayer({
        id: '3d-buildings',
        source: 'openfreemap',
        'source-layer': 'building',
        type: 'fill-extrusion',
        minzoom: 15,
        paint: {
          'fill-extrusion-color': [
            'interpolate', ['linear'], ['coalesce', ['number', ['get', 'render_height']], 0],
            0, '#4169E1', 100, '#87CEEB'
          ],
          'fill-extrusion-height': ['coalesce', ['number', ['get', 'render_height']], 0],
          'fill-extrusion-base': ['coalesce', ['number', ['get', 'render_min_height']], 0],
          'fill-extrusion-opacity': 0.85
        }
      });

      // ✅ Caminhão vista de cima
      const size = 110;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      const s = size;

      // Carroceria (parte de baixo — sul)
      ctx.fillStyle = '#475344'; // cinza claro
      ctx.beginPath();
      ctx.roundRect(s*0.18, s*0.38, s*0.64, s*0.52, 5);
      ctx.fill();

      // Detalhe interno carroceria
      ctx.fillStyle = '#6e9282';
      ctx.beginPath();
      ctx.roundRect(s*0.23, s*0.43, s*0.54, s*0.42, 3);
      ctx.fill();

      // Cabine (frente = topo = norte)
      ctx.fillStyle = '#f97316'; // laranja vibrante como na imagem
      ctx.beginPath();
      ctx.roundRect(s*0.20, s*0.10, s*0.60, s*0.32, 18);
      ctx.fill();

      // Parabrisa
      ctx.fillStyle = '#bfdbfe';
      ctx.beginPath();
      ctx.roundRect(s*0.27, s*0.14, s*0.46, s*0.18, 5);
      ctx.fill();

      // Reflexo parabrisa
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.roundRect(s*0.29, s*0.16, s*0.14, s*0.13, 3);
      ctx.fill();
      ctx.globalAlpha = 1.0;

      // Divisória central parabrisa
      ctx.fillStyle = '#ea6c0a';
      ctx.fillRect(s*0.485, s*0.14, s*0.025, s*0.18);

      // Linha separando cabine da carroceria
      ctx.fillStyle = '#c2410c';
      ctx.fillRect(s*0.18, s*0.38, s*0.64, s*0.03);

      // Espelho esquerdo
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.roundRect(s*0.06, s*0.15, s*0.13, s*0.07, 3);
      ctx.fill();

      // Espelho direito
      ctx.beginPath();
      ctx.roundRect(s*0.81, s*0.15, s*0.13, s*0.07, 3);
      ctx.fill();

      // Faróis esquerdos
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.roundRect(s*0.20, s*0.10, s*0.13, s*0.06, 3);
      ctx.fill();

      // Faróis direitos
      ctx.beginPath();
      ctx.roundRect(s*0.67, s*0.10, s*0.13, s*0.06, 3);
      ctx.fill();

      // Detalhe frente (grade)
      ctx.fillStyle = '#c2410c';
      ctx.beginPath();
      ctx.roundRect(s*0.33, s*0.08, s*0.34, s*0.04, 2);
      ctx.fill();

      const imageData = ctx.getImageData(0, 0, size, size);
      if (!map.current.hasImage("truck-icon")) {
        map.current.addImage("truck-icon", { width: size, height: size, data: imageData.data });
      }

      map.current.addLayer({
        id: "truck-layer",
        type: "symbol",
        source: "truck-point",
        layout: {
          "icon-image": "truck-icon",
          "icon-size": 0.45,
          "icon-rotate": ["get", "bearing"],
          "icon-rotation-alignment": "map",
          "icon-allow-overlap": true,
          "icon-ignore-placement": true
        }
      });

      truckReadyRef.current = true;
    });
  }, []);

  const animarEntregaSuave = (coords) => {
    if (!map.current) return;
    if (animationRef.current) cancelAnimationFrame(animationRef.current);

    const line = turf.lineString(coords);
    const totalDistance = turf.length(line, { units: 'kilometers' });
    if (totalDistance === 0) return;

    const steps = Math.min(600, Math.max(300, Math.round(totalDistance * 150)));

    const arc = [];
    for (let i = 0; i <= steps; i++) {
      const segment = turf.along(line, (i * totalDistance) / steps, { units: 'kilometers' });
      arc.push(segment.geometry.coordinates);
    }

    const pointGeoJSON = {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        properties: { bearing: 0 },
        geometry: { type: 'Point', coordinates: arc[0] }
      }]
    };

    let counter = 0;
    let frameCount = 0;

    const step = () => {
      if (counter >= steps) return;

      frameCount++;
      if (frameCount % 2 === 0) {
        const current = arc[counter];
        const next = arc[Math.min(counter + 1, steps)];

        let bearing = turf.bearing(turf.point(current), turf.point(next));
        if (bearing < 0) bearing += 360;

        pointGeoJSON.features[0].geometry.coordinates = current;
        pointGeoJSON.features[0].properties.bearing = bearing;

        const truckSource = map.current.getSource("truck-point");
        if (truckSource) truckSource.setData(pointGeoJSON);

        counter++;
      }

      animationRef.current = requestAnimationFrame(step);
    };

    step();
  };

  const buscarCEP = async () => {
    if (cep.length !== 8) return alert("CEP inválido");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/geolocalizacao/busca", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loja_id: 0, apelido: "busca", cep_usuario: cep }),
      });
      const data = await res.json();
      setLojas(data.lojas);
      const novaCoord = [data.lon_usuario, data.lat_usuario];
      setUserCoords(novaCoord);
      map.current.flyTo({ center: novaCoord, zoom: 14.5, pitch: 45, bearing: -17.6 });
      setCepGlobal(cep);
    } catch (err) {
      alert("Erro ao buscar lojas.");
    } finally {
      setLoading(false);
    }
  };

  const salvarFavorito = async (loja) => {
  const apelido = prompt(`Dê um apelido para a unidade ${loja.nome} (ex: Casa, Trabalho):`);
  
  if (!apelido) return; // Cancela se o usuário não digitar nada

  try {
    const res = await fetch("http://localhost:8000/geolocalizacao/favoritos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        loja_id: loja.id,
        apelido: apelido,
        cep_usuario: cep || "00000000" // Usa o CEP buscado ou um padrão
      }),
    });

      if (res.ok) {
        alert("Loja adicionada aos favoritos! ❤️");
      } else {
        alert("Erro ao favoritar loja.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro na conexão com o servidor.");
    }
  };

  const tracarRota = async (loja) => {
    try {
      const res = await fetch("http://localhost:8000/geolocalizacao/rota", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origem: [userCoords[1], userCoords[0]],
          destino: [loja.lat, loja.lon]
        }),
      });
      const data = await res.json();
      const rawCoords = data?.features?.[0]?.geometry?.coordinates;
      if (!rawCoords) { alert("Não foi possível traçar a rota."); return; }

      const coords = Array.isArray(rawCoords[0][0]) ? rawCoords.flat(1) : rawCoords;

      const routeSource = map.current.getSource("route-line");
      if (routeSource) {
        routeSource.setData({
          type: "Feature",
          geometry: { type: "LineString", coordinates: coords }
        });
      }

      if (coords.length > 0) {
        const bounds = new maplibregl.LngLatBounds(coords[0], coords[0]);
        coords.forEach(coord => bounds.extend(coord));

        map.current.once("moveend", () => {
          if (truckReadyRef.current) {
            animarEntregaSuave(coords);
          }
        });

        map.current.fitBounds(bounds, { padding: 50, maxZoom: 14.5 });
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao traçar rota.");
    }
  };

  const obterStatusLoja = () => {
  const agora = new Date();
  const diaSemana = agora.getDay(); // 0 (Domingo) a 6 (Sábado)
  const hora = agora.getHours();
  const minutos = agora.getMinutes();

  // Definindo horário: Segunda (1) a Sábado (6) das 08:00 às 20:00
  const isDiaUtil = diaSemana >= 1 && diaSemana <= 6;
  const isHorarioAberto = hora >= 8 && hora < 20;

  if (isDiaUtil && isHorarioAberto) {
    return {
      texto: "Aberta agora",
      cor: "#16a34a",
      icone: "✅",
      subtexto: "Fecha às 20:00"
    };
  } else {
    return {
      texto: "Fechada agora",
      cor: "#dc2626", // Vermelho para fechado
      icone: "❌",
      subtexto: diaSemana === 0 ? "Abre segunda às 08:00" : "Abre amanhã às 08:00"
    };
  }
};

const status = obterStatusLoja();

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px", fontFamily: 'sans-serif' }}>
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input
          placeholder="Digite seu CEP (ex: 03650010)"
          value={cep}
          onChange={(e) => setCep(e.target.value.replace(/\D/g, ""))}
          style={{ padding: "12px", borderRadius: "10px", border: "1px solid #ddd", flex: 1 }}
        />
        <button
          onClick={buscarCEP}
          style={{
            padding: "12px 25px",
            borderRadius: "10px",
            background: "#16a34a",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontWeight: 'bold'
          }}
        >
          {loading ? "Buscando..." : "Ver Lojas"}
        </button>
      </div>
      {/* 🌤️ CLIMA DASHBOARD (SEPARADO E SEGURO) */}
      {cepGlobal.length === 8 && (
        <ClimaDashboard 
          cep={cep}
          adicionarAoCarrinho={adicionarAoCarrinho}
          produtos={produtos}
        />
      )}

      <div style={{
        height: "550px",
        borderRadius: "20px",
        overflow: "hidden",
        boxShadow: "0 10px 30px rgba(0,0,0,0.15)"
      }}>
        <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />
      </div>

      <div style={{
        marginTop: "20px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "20px"
      }}>
        {lojas.map((loja) => (
          <div key={loja.id} style={{
            background: "#fff",
            borderRadius: "15px",
            border: "1px solid #eee",
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            overflow: 'hidden',
            transition: 'transform 0.2s'
          }}>
            <div 
              onClick={() => { setLojaSelecionada(loja); setFotoAtiva(0); }}
              style={{ cursor: 'pointer' }}
            >
              <div style={{ 
                height: '160px', 
                background: `url(${loja.fotos?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e'}) center/cover`,
                width: '100%'
              }} />
              <div style={{ padding: '15px 20px 5px' }}>
                <h4 style={{ margin: "0 0 5px 0", color: '#333' }}>{loja.nome}</h4>
                <p style={{ fontSize: "14px", color: "#666", margin: 0 }}>
                  📍 {loja.bairro} - {loja.distancia} km
                </p>
              </div>
            </div>
            <div style={{ padding: '10px 20px 20px' }}>
            <button
              onClick={() => tracarRota(loja)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                background: "#e8f5e9",
                color: "#16a34a",
                border: "none",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              
              Simular Entrega 🚚
            </button>
            <button
                onClick={() => salvarFavorito(loja)}
                  style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  background: "#e8f5e9",
                  color: "#16a34a",
                  border: "none",
                  fontWeight: "bold",
                  cursor: "pointer",
                  marginTop: "5px" 
                }}
              >
                Adicionar aos Favoritos ⭐
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* MODAL DE DETALHES DA UNIDADE */}
      {lojaSelecionada && (
        <div className="modal-overlay" onClick={() => setLojaSelecionada(null)}>
          <div className="product-modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setLojaSelecionada(null)}>✕</button>
            
            <div className="product-gallery-container">
              <div className="main-image-wrapper">
                <img src={lojaSelecionada.fotos?.[fotoAtiva] || 'https://images.unsplash.com/photo-1542838132-92c53300491e'} alt="Fachada da loja" />
              </div>
              <div className="thumbnails-container">
                {(lojaSelecionada.fotos || []).map((foto, idx) => (
                  <div 
                    key={idx} 
                    className={`thumbnail-item ${fotoAtiva === idx ? 'active' : ''}`}
                    onClick={() => setFotoAtiva(idx)}
                  >
                    <img src={foto} alt={`Vista ${idx + 1}`} />
                  </div>
                ))}
              </div>
            </div>

            <div className="product-info-wrapper">
              <span style={{ color: '#16a34a', fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Unidade Natural Fresh
              </span>
              <h2 style={{ marginTop: '10px', marginBottom: '15px' }}>{lojaSelecionada.nome}</h2>
              
              <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '20px' }}>
                {lojaSelecionada.descricao || "Venha conhecer nossa unidade completa com hortifruti orgânico, cafeteria e produtos a granel selecionados."}
              </p>
              
              <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '12px', marginBottom: '25px' }}>
                <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}><strong>📍 Endereço:</strong> {lojaSelecionada.bairro}, {lojaSelecionada.cidade}</p>
                <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}><strong>⏰ Horário:</strong> Seg a Sáb: 08h às 20h</p>
                <p style={{ margin: '0', fontSize: '14px', color: status.cor, fontWeight: 'bold' }}>
                <strong>{status.icone} Status:</strong> {status.texto} 
                <span style={{ fontSize: '12px', color: '#666', fontWeight: 'normal', marginLeft: '8px' }}>
                  ({status.subtexto})
                </span>
                </p>
              </div>

              <button 
                className="btn-pill" 
                style={{ width: '100%' }}
                onClick={() => {
                  tracarRota(lojaSelecionada);
                  setLojaSelecionada(null);
                }}
              >
                Traçar Rota até esta Unidade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}