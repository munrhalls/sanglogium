 it('retries CMS freshness sync on network failure', () => {
     // Arrange: Mock fetch to fail twice, succeed third time
     // Act: Trigger sync
     // Assert: Exponential backoff retry succeeds
   })

   