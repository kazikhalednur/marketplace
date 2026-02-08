export function getCurrencySymbol(currency: unknown): string {
    if (
      currency &&
      typeof currency === 'object' &&
      ('symbol' in currency || 'name' in currency)
    ) {
      // @ts-expect-error - Dynamic property access on unknown object type
      return currency.symbol || currency.name || '$';
    }
    if (typeof currency === 'string') return currency;
    return '$';
  }
  