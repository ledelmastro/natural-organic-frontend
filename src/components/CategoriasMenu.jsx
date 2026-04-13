export default function CategoriasMenu({ setCategoria, categoriaAtiva }) {
  const categorias = [
    { id: null, nome: "Todos os Produtos", img: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=200" },
    { id: "frutas", nome: "Frutas Frescas", img: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200" },
    { id: "vegetais", nome: "Vegetais", img: "https://images.pexels.com/photos/5966431/pexels-photo-5966431.jpeg" },
    { id: "sucos", nome: "Sucos Frescos", img: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=200" },
    {id: "legumes", nome: "Legumes Selecionados", img: "https://images.unsplash.com/photo-1581493297375-6bf56ab23719?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDh8fGxlZ3VtZXMlMjBzZWxlY2lvbmFkb3N8ZW58MHx8MHx8fDA%3D?w=200"},
    {id: "verduras", nome: "Verduras e Folhas", img: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200" },
    {id: "graos", nome: "Grãos e Cereais", img: "https://images.unsplash.com/photo-1512149177596-f817c7ef5d4c?w=200" }
  ];

  return (
    <div className="modern-categories">
      {categorias.map((cat) => (
        <div 
          key={cat.nome} 
          className={`cat-card ${categoriaAtiva === cat.id ? 'active' : ''}`}
          onClick={() => setCategoria(cat.id)}
        >
          <div className="cat-img-wrapper">
            <img src={cat.img} alt={cat.nome} />
          </div>
          <span>{cat.nome}</span>
        </div>
      ))}
    </div>
  );
}