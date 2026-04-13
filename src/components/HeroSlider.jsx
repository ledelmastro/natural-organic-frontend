import { useState, useEffect } from "react";

const slides_dados = [
  { id: 1, imagem: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200", titulo: "Comida Fresca e Orgânica", subtitulo: "Entregue na sua porta" },
  { id: 2, imagem: "https://images.unsplash.com/photo-1610348725531-843dff563e2c?q=80&w=1200", titulo: "Promoção de Verão", subtitulo: "Até 30% de DESCONTO em frutas" }
];

export default function HeroSlider() {
  const [atual, setAtual] = useState(0);

  const proximoSlide = () => setAtual((prev) => (prev + 1) % slides_dados.length);
  const slideAnterior = () => setAtual((prev) => (prev - 1 + slides_dados.length) % slides_dados.length);

  useEffect(() => {
    const timer = setInterval(proximoSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hero-slider">
      <div className="slide" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${slides_dados[atual].imagem})` }}>
        <button className="slider-arrow prev" onClick={slideAnterior}>❮</button>
        <div className="slide-content">
          <p>{slides_dados[atual].subtitulo}</p>
          <h1>{slides_dados[atual].titulo}</h1>
          <button className="btn-pill">COMPRAR AGORA</button>
        </div>
        <button className="slider-arrow next" onClick={proximoSlide}>❯</button>
      </div>
    </div>
  );
}