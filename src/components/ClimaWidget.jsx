import { useEffect, useState } from "react";

export default function ClimaWidget() {
  const [clima, setClima] = useState(null);

  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

  useEffect(() => {
    async function buscarClima() {
      try {
        const res = await fetch(
          `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=-23.55,-46.63&lang=pt`
        );
        const data = await res.json();
        setClima(data);
      } catch (err) {
        console.error(err);
      }
    }

    buscarClima();
  }, [API_KEY]);

  if (!clima) return null;

  const temp = Math.round(clima.current.temp_c);
  const cond = clima.current.condition.text;

  return (
    <div style={{
      width: "180px",
      height: "80px",
      borderRadius: "20px",
      padding: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      background: "linear-gradient(135deg, #4facfe, #00c6ff)",
      color: "#fff",
      boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
      position: "relative",
      overflow: "hidden",
      cursor: "pointer",
      transition: "transform 0.3s ease"
    }}
    onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
    onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
    title={`Sensação: ${clima.current.feelslike_c}°C`}
    >

      {/* 🌥️ Ícone grande estilo iOS */}
      <img
        src={clima.current.condition.icon}
        alt="clima"
        style={{
          width: "55px",
          position: "absolute",
          top: "-5px",
          right: "2px",
          opacity: 0.95
        }}
      />

      {/* 🌡️ Info */}
      <div>
        <div style={{ fontSize: "28px", fontWeight: "700", lineHeight: "1" }}>
          {temp}°
        </div>
        <div style={{ fontSize: "12px", opacity: 0.9 }}>
          {cond}
        </div>
        <div style={{ fontSize: "11px", opacity: 0.7 }}>
          {clima.location.name}
        </div>
      </div>

    </div>
  );
}