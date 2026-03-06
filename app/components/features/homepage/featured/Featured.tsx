import products from "./content-dump.json";

export default function Featured() {
  return (
    <section>
      <h2>Featured Products (Raw Audit)</h2>
      <div>
        {products.map((product) => (
          <div key={product.id} style={{ marginBottom: '40px', borderBottom: '1px solid #333' }}>
            {/* 1. Image Audit: Check aspect ratios and resolution */}
            <img
              src={product.imageUrl}
              alt={product.name}
              style={{ width: '300px', height: 'auto', display: 'block' }}
            />

            {/* 2. Text Audit: Brand & Name length check */}
            <div style={{ padding: '10px 0' }}>
              <span style={{ textTransform: 'uppercase', fontSize: '12px', color: '#888' }}>
                {product.brand}
              </span>
              <h3 style={{ margin: '5px 0', fontSize: '1.5rem' }}>
                {product.name}
              </h3>
            </div>

            {/* 3. Price & Tag Audit */}
            <div style={{ paddingBottom: '20px' }}>
              <p style={{ fontWeight: 'bold' }}>
                Price: ${product.displayPrice}
              </p>
              <p style={{ fontSize: '0.9rem', color: '#666', maxWidth: '600px' }}>
                <strong>Meta/Tag:</strong> {product.tag}
              </p>
              <p style={{ fontSize: '0.8rem', fontStyle: 'italic' }}>
                Slug: {product.slug}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}