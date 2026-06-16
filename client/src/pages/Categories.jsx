import { useNavigate } from "react-router-dom";

const Categories = () => {
  const navigate = useNavigate();

  const categories = [
    {
      id: "electronics",
      name: "Electronics & Tech",
      icon: "💻",
      description: "Explore cutting-edge laptops, high-performance smartphones, premium noise-canceling headphones, and essential smart gadgets.",
      bgGradient: "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.08) 100%)",
      borderColor: "rgba(59, 130, 246, 0.2)"
    },
    {
      id: "fashion",
      name: "Fashion & Apparel",
      icon: "👕",
      description: "Stay ahead in style with comfortable activewear shoes, lightweight down jackets, classic denim pants, and timeless sunglasses.",
      bgGradient: "linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(139, 92, 246, 0.08) 100%)",
      borderColor: "rgba(236, 72, 153, 0.2)"
    },
    {
      id: "health",
      name: "Health & Wellness",
      icon: "🌿",
      description: "Optimize your well-being with premium whey isolates, adjustable home dumbbells, support collagen peptides, and top-tier electric toothbrushes.",
      bgGradient: "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(59, 130, 246, 0.08) 100%)",
      borderColor: "rgba(16, 185, 129, 0.2)"
    },
    {
      id: "hardware",
      name: "Hardware & Tools",
      icon: "🛠️",
      description: "Build, restore, and improve with solid-steel claw hammers, compact cordless drills, versatile utility knives, and multi-position ladders.",
      bgGradient: "linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(239, 68, 68, 0.08) 100%)",
      borderColor: "rgba(245, 158, 11, 0.2)"
    }
  ];

  const handleCategoryClick = (categoryName) => {
    navigate(`/?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: "3rem" }}>
      <div style={{ textAlign: "left", marginBottom: "2.5rem" }}>
        <h1 style={{ margin: 0, fontSize: "2.2rem", fontWeight: 800 }}>Browse Categories</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1rem", marginTop: "0.5rem" }}>
          Select a department below to discover our curated inventory of premium products.
        </p>
      </div>

      <div className="category-grid">
        {categories.map((cat) => (
          <div
            key={cat.id}
            onClick={() => handleCategoryClick(cat.name)}
            className="glass-card interactive category-card"
            style={{
              background: cat.bgGradient,
              borderColor: cat.borderColor,
              borderWidth: "1px",
              borderStyle: "solid"
            }}
          >
            <div className="category-card-icon">{cat.icon}</div>
            <h2 className="category-card-title">{cat.name}</h2>
            <p className="category-card-desc">{cat.description}</p>
            <button 
              className="btn btn-secondary" 
              style={{ marginTop: "1.5rem", width: "100%", padding: "0.5rem 1rem", fontSize: "0.85rem" }}
            >
              Explore Products →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;
