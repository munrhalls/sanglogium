describe('Basket Latest Check (Sync on Mount)', () => {

  describe('Sanity CMS Basket Data Transformation to basket items', () => {
    it('given sanity CMS basket items payload, converts Sanity cents to displayPrice and calculates availableStock correctly in a basket item', () => {
      // Arrange: Mock Sanity CMS product with price: 1500 (cents), stock: 10, reservedStock: 2
      // Act: Call transformation function with CMS data
      // Assert: Resulting item has displayPrice: 15 and availableStock: 8
    })
  })

  describe('State of Basket Items - Partitioning into available and unavailable items', () => {
    it('partitions items into available and unavailable arrays without metadata on unavailable ones', () => {
      // Arrange: Local basket has 2 items. CMS returns stock 0 for item A, stock 5 for item B.
      // Act: const [available, { unavailable }] = syncFreshness()
      // Assert: available.length === 1
      // Assert: unavailable.length === 1
      // Assert: expect(unavailable[0].metadata).toBeUndefined()
    })
    it('when all items are available')

  })
  it('attaches metadata with old values on discrepancy', () => {
    // Arrange: Local price 10, CMS price 12. Local qty 5, CMS stock 2.
    // Act: const [available] = syncFreshness()
    // Assert: expect(available[0].metadata).toBeDefined()
    // Assert: expect(available[0].metadata.old_price).toBe(10)
    // Assert: expect(available[0].metadata.old_availableStock).toBe(5)
  })

  it('identifies zero available items', () => {
    // Arrange: All items return stock 0
    // Act: const [available, { unavailable }] = syncFreshness()
    // Assert: available.length === 0 && unavailable.length > 0
  })

  describe('Sync Return Structure (The Contract)', () => {
      it('returns a single-element tuple [available] when no items are unavailable', () => {
        // Arrange: Mock CMS where all local items have availableStock > 0
        // Act: const result = await syncFreshness()
        // Assert: expect(result).toHaveLength(1)
        // Assert: expect(result[0]).toBeInstanceOf(Array)
        // Assert: expect(result[1]).toBeUndefined()
      })

      // should test return structure for case when there are available and unavailable items 

      // should test return structure for when there are 
  })
  
})