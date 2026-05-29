/**
 * Filter Builder - Constructs GROQ filter clauses
 * Extracted from getProductsByVfsKeys for better testability and maintainability
 */
export class FilterBuilder {
  // Known safe filter fields — anything else is treated as generic (overviewFields/specifications)
  private static readonly KNOWN_FIELDS = new Set(['brand', 'price', 'priceRange', 'stockMin']);

  /**
   * Sanitize a string value for safe GROQ interpolation.
   * Escapes double quotes to prevent GROQ injection.
   */
  private static sanitizeString(value: string): string {
    return value.replace(/"/g, '\\"');
  }

  /**
   * Validate that a string is a safe numeric value (integer).
   * Returns the number if valid, null otherwise.
   */
  private static validateNumeric(value: string): number | null {
    const num = Number(value);
    if (Number.isNaN(num) || !Number.isFinite(num)) return null;
    return Number.isInteger(num) ? num : null;
  }

  /**
   * Build complete filter clause from filter array
   */
  static buildClause(filters: string[]): string {
    if (filters.length === 0) {
      return '';
    }

    // Group filters by field
    const filtersByField = this.groupFiltersByField(filters);

    // Build clause for each field group
    const fieldClauses = Object.entries(filtersByField).map(([field, values]) => {
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
    const brandConditions = values
      .map(v => this.sanitizeString(v))
      .filter(v => v.length > 0)
      .map(value => `lower(brand->name) == lower("${value}")`)
      .join(' || ');
    if (!brandConditions) return '';
    return `&& (${brandConditions})`;
  }

  /**
   * Build price filter clause
   */
  private static buildPriceFilter(values: string[]): string {
    const priceConditions = values.map(value => {
      if (value.startsWith('min:')) {
        const num = this.validateNumeric(value.split(':')[1] ?? '');
        if (num === null) return null;
        return `price_data.unit_amount >= ${num}`;
      } else if (value.startsWith('max:')) {
        const num = this.validateNumeric(value.split(':')[1] ?? '');
        if (num === null) return null;
        return `price_data.unit_amount <= ${num}`;
      }
      const num = this.validateNumeric(value);
      if (num === null) return null;
      return `price_data.unit_amount == ${num}`;
    }).filter((c): c is string => c !== null);

    if (priceConditions.length === 0) return '';
    return `&& (${priceConditions.join(' && ')})`;
  }

  /**
   * Build price range filter clause (from sliders)
   */
  private static buildPriceRangeFilter(values: string[]): string {
    const priceConditions = values.map(value => {
      if (value.startsWith('min:')) {
        const num = this.validateNumeric(value.split(':')[1] ?? '');
        if (num === null) return null;
        return `price_data.unit_amount >= ${num}`;
      } else if (value.startsWith('max:')) {
        const num = this.validateNumeric(value.split(':')[1] ?? '');
        if (num === null) return null;
        return `price_data.unit_amount <= ${num}`;
      }
      const num = this.validateNumeric(value);
      if (num === null) return null;
      return `price_data.unit_amount == ${num}`;
    }).filter((c): c is string => c !== null);

    if (priceConditions.length === 0) return '';
    return `&& (${priceConditions.join(' && ')})`;
  }

  /**
   * Build stock filter clause
   */
  private static buildStockFilter(values: string[]): string {
    const stockConditions = values.map(value => {
      const num = this.validateNumeric(value);
      if (num === null) return null;
      return `stock >= ${num}`;
    }).filter((c): c is string => c !== null);

    if (stockConditions.length === 0) return '';
    return `&& (${stockConditions.join(' && ')})`;
  }

  /**
   * Build generic filter clause for overviewFields/specifications
   */
  private static buildGenericFilter(field: string, values: string[]): string {
    // Reject empty or overly long field names
    if (!field || field.length > 100) return '';

    const safeField = this.sanitizeString(field);
    const conditions = values
      .map(v => this.sanitizeString(v))
      .filter(v => v.length > 0)
      .map(value =>
        `(count(overviewFields[@.title == "${safeField}" && @.value == "${value}"]) > 0 || count(specifications[@.title == "${safeField}" && @.value == "${value}"]) > 0)`
      )
      .join(' || ');

    if (!conditions) return '';
    return `&& (${conditions})`;
  }
}
