/**
 * Filter Builder - Constructs GROQ filter clauses
 * Extracted from getProductsByVfsKeys for better testability and maintainability
 */
export class FilterBuilder {
  /**
   * Build complete filter clause from filter array
   */
  static buildClause(filters: string[]): string {
    if (filters.length === 0) {
      return '';
    }

    // Group filters by field
    const filtersByField = this.groupFiltersByField(filters);
    console.log('=== FILTER GROUPING DEBUG ===');
    console.log('input filters:', filters);
    console.log('filtersByField:', filtersByField);

    // Build clause for each field group
    const fieldClauses = Object.entries(filtersByField).map(([field, values]) => {
      console.log(`Building clause for field: ${field}, values:`, values);
      
      if (field === 'brand') {
        return this.buildBrandFilter(values);
      } else if (field === 'price') {
        return this.buildPriceFilter(values);
      } else if (field === 'priceRange') {
        return this.buildPriceRangeFilter(values);
      } else if (field === 'stockMin') {
        return this.buildStockFilter(values);
      } else {
        return this.buildGenericFilter(field, values);
      }
    });

    const filterClause = fieldClauses.join(' ');
    console.log('=== FINAL FILTER CLAUSE ===');
    console.log('filterClause:', filterClause);
    
    return filterClause;
  }

  /**
   * Group filters by field with special handling for priceRange comma-separated values
   */
  private static groupFiltersByField(filters: string[]): Record<string, string[]> {
    return filters.reduce((acc, filter) => {
      const parts = filter.split(':');
      if (parts.length >= 2) {
        const field = parts[0];
        let value = parts.slice(1).join(':');
        
        // Special handling for priceRange with comma-separated min/max values
        if (field === 'priceRange' && value.includes(',')) {
          // Split "min:500,max:1500" into ["min:500", "max:1500"]
          const subValues = value.split(',').map(v => v.trim());
          if (!acc[field]) acc[field] = [];
          acc[field].push(...subValues);
        } else {
          // Normal case: single value
          if (!acc[field]) acc[field] = [];
          acc[field].push(value);
        }
      }
      return acc;
    }, {} as Record<string, string[]>);
  }

  /**
   * Build brand filter clause
   */
  private static buildBrandFilter(values: string[]): string {
    // Multiple brands: OR logic
    const brandConditions = values.map(value => `lower(brand->name) == lower("${value}")`).join(' || ');
    const clause = `&& (${brandConditions})`;
    console.log('brand clause:', clause);
    return clause;
  }

  /**
   * Build price filter clause
   */
  private static buildPriceFilter(values: string[]): string {
    // Price filtering: handle min/max values
    const priceConditions = values.map(value => {
      if (value.startsWith('min:')) {
        const minPrice = value.split(':')[1];
        return `price_data.unit_amount >= ${minPrice}`;
      } else if (value.startsWith('max:')) {
        const maxPrice = value.split(':')[1];
        return `price_data.unit_amount <= ${maxPrice}`;
      }
      return `price_data.unit_amount == ${value}`;
    }).join(' && ');
    const clause = `&& (${priceConditions})`;
    console.log('price clause:', clause);
    return clause;
  }

  /**
   * Build price range filter clause (from sliders)
   */
  private static buildPriceRangeFilter(values: string[]): string {
    // Price range filtering: handle min/max values from slider
    const priceConditions = values.map(value => {
      if (value.startsWith('min:')) {
        const minPrice = value.split(':')[1];
        return `price_data.unit_amount >= ${minPrice}`;
      } else if (value.startsWith('max:')) {
        const maxPrice = value.split(':')[1];
        return `price_data.unit_amount <= ${maxPrice}`;
      }
      return `price_data.unit_amount == ${value}`;
    }).join(' && ');
    const clause = `&& (${priceConditions})`;
    console.log('priceRange clause:', clause);
    return clause;
  }

  /**
   * Build stock filter clause
   */
  private static buildStockFilter(values: string[]): string {
    // Stock minimum filtering: handle stock values from slider
    const stockConditions = values.map(value => {
      const stockValue = parseInt(value, 10);
      // Note: Assuming stock field exists as 'stock' in product schema
      // If stock field doesn't exist, this will return 0 results
      return `stock >= ${stockValue}`;
    }).join(' && ');
    const clause = `&& (${stockConditions})`;
    console.log('stockMin clause:', clause);
    return clause;
  }

  /**
   * Build generic filter clause for overviewFields/specifications
   */
  private static buildGenericFilter(field: string, values: string[]): string {
    // Other filters: OR logic within field
    const conditions = values.map(value =>
      `(count(overviewFields[@.title == "${field}" && @.value == "${value}"]) > 0 || count(specifications[@.title == "${field}" && @.value == "${value}"]) > 0)`
    ).join(' || ');
    const clause = `&& (${conditions})`;
    console.log('other clause:', clause);
    return clause;
  }
}
