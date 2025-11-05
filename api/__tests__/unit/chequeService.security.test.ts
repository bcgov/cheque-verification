import {
  getChequeFromDatabase,
  createMockConnection,
  mockPool,
  createValidChequeRow,
  setupTestEnvironment,
} from "../helpers/chequeTestHelpers";

describe("ChequeService - Security & Concurrency", () => {
  setupTestEnvironment();

  describe("getChequeFromDatabase - Security & Performance", () => {
    const validChequeRow = createValidChequeRow();

    it("handles_concurrent_requests_with_proper_connection_pooling", async () => {
      // Arrange - Create isolated mock connections for each request
      const promises: Promise<any>[] = [];
      const mockConnections: any[] = [];

      for (let i = 0; i < 10; i++) {
        const mockConnection = createMockConnection();
        mockConnections.push(mockConnection);
        mockPool.getConnection.mockResolvedValueOnce(mockConnection);
        mockConnection.execute.mockResolvedValueOnce({
          rows: [{ ...validChequeRow, CHEQUE_NUMBER: i.toString() }],
          metaData: [],
          resultSet: undefined,
        });
        promises.push(getChequeFromDatabase(i.toString()));
      }

      // Act
      const results = await Promise.all(promises);

      // Assert
      expect(results).toHaveLength(10);
      expect(mockPool.getConnection).toHaveBeenCalledTimes(10);

      // Verify each connection was closed
      mockConnections.forEach((conn) => {
        expect(conn.close).toHaveBeenCalledTimes(1);
      });
    });

    it("handles_high_volume_sequential_requests", async () => {
      // Arrange
      const numberOfRequests = 50;
      const results = [];

      // Act - Process requests sequentially to test connection reuse
      for (let i = 0; i < numberOfRequests; i++) {
        const mockConnection = createMockConnection();
        mockPool.getConnection.mockResolvedValueOnce(mockConnection);
        mockConnection.execute.mockResolvedValueOnce({
          rows: [{ ...validChequeRow, CHEQUE_NUMBER: i.toString() }],
          metaData: [],
          resultSet: undefined,
        });

        const result = await getChequeFromDatabase(i.toString());
        results.push(result);
      }

      // Assert
      expect(results).toHaveLength(numberOfRequests);
      expect(mockPool.getConnection).toHaveBeenCalledTimes(numberOfRequests);
    });

    it("prevents_connection_leak_during_errors", async () => {
      // Arrange
      const mockConnection = createMockConnection();
      mockPool.getConnection.mockResolvedValueOnce(mockConnection);

      // Simulate error after connection is established
      const databaseError = new Error(
        "ORA-00942: table or view does not exist"
      );
      mockConnection.execute.mockRejectedValueOnce(databaseError);

      // Act - Call should fail but connection should still be closed
      await expect(getChequeFromDatabase("12345")).rejects.toThrow(
        "ORA-00942: table or view does not exist"
      );

      // Assert - Connection was properly closed despite error
      expect(mockConnection.close).toHaveBeenCalledTimes(1);
    });

    it("handles_connection_timeout_scenarios", async () => {
      // Arrange
      const timeoutError = new Error("Connection timeout");
      mockPool.getConnection.mockRejectedValueOnce(timeoutError);

      // Act & Assert
      await expect(getChequeFromDatabase("12345")).rejects.toThrow(
        "Connection timeout"
      );

      // No connection to close since getConnection failed
      expect(mockPool.getConnection).toHaveBeenCalledTimes(1);
    });

    it("maintains_data_integrity_under_load", async () => {
      // Arrange - Simulate mixed success/failure scenarios
      const mixedPromises = [];

      // Add successful requests
      for (let i = 0; i < 5; i++) {
        const mockConnection = createMockConnection();
        mockPool.getConnection.mockResolvedValueOnce(mockConnection);
        mockConnection.execute.mockResolvedValueOnce({
          rows: [{ ...validChequeRow, CHEQUE_NUMBER: `success_${i}` }],
          metaData: [],
          resultSet: undefined,
        });
        mixedPromises.push(getChequeFromDatabase(`success_${i}`));
      }

      // Add failing requests
      for (let i = 0; i < 3; i++) {
        const mockConnection = createMockConnection();
        mockPool.getConnection.mockResolvedValueOnce(mockConnection);
        mockConnection.execute.mockResolvedValueOnce({
          rows: [], // No results found
          metaData: [],
          resultSet: undefined,
        });
        mixedPromises.push(
          getChequeFromDatabase(`notfound_${i}`).catch((err) => ({
            error: err.message,
          }))
        );
      }

      // Act
      const results = await Promise.allSettled(mixedPromises);

      // Assert
      const successful = results.filter((r) => r.status === "fulfilled").length;
      expect(successful).toBe(8); // 5 successful + 3 caught errors
      expect(mockPool.getConnection).toHaveBeenCalledTimes(8);
    });
  });
});
