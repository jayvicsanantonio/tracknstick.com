// Database cleanup utilities for development and error recovery
// Provides programmatic ways to reset and reinitialize the IndexedDB database

export class DatabaseCleanup {
  private static readonly dbName = 'TracknStickDB';

  /**
   * Completely deletes the IndexedDB database
   * This will force a fresh creation on next initialization
   */
  static async deleteDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('Deleting IndexedDB database...');

      const deleteRequest = indexedDB.deleteDatabase(this.dbName);

      deleteRequest.onsuccess = () => {
        console.log('Database deleted successfully');
        resolve();
      };

      deleteRequest.onerror = () => {
        console.error('Failed to delete database:', deleteRequest.error);
        reject(
          new Error(
            `Failed to delete database: ${deleteRequest.error?.message}`,
          ),
        );
      };

      deleteRequest.onblocked = () => {
        console.warn(
          'Database deletion blocked - other tabs may be using the database',
        );
        // Try to resolve anyway as the deletion may still work
        setTimeout(() => resolve(), 1000);
      };
    });
  }

  /**
   * Checks if the database exists and what version it is
   */
  static async getDatabaseInfo(): Promise<{
    exists: boolean;
    version?: number;
  }> {
    return new Promise((resolve) => {
      const openRequest = indexedDB.open(this.dbName);

      openRequest.onsuccess = () => {
        const db = openRequest.result;
        const info = {
          exists: true,
          version: db.version,
        };
        db.close();
        resolve(info);
      };

      openRequest.onerror = () => {
        resolve({ exists: false });
      };
    });
  }

  /**
   * Lists all object stores in the current database
   */
  static async listObjectStores(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const openRequest = indexedDB.open(this.dbName);

      openRequest.onsuccess = () => {
        const db = openRequest.result;
        const storeNames = Array.from(db.objectStoreNames);
        db.close();
        resolve(storeNames);
      };

      openRequest.onerror = () => {
        reject(new Error('Failed to open database for inspection'));
      };
    });
  }

  /**
   * Development utility to reset database and reload page
   */
  static async resetAndReload(): Promise<void> {
    try {
      await this.deleteDatabase();
      console.log('Database reset complete, reloading page...');
      window.location.reload();
    } catch (error) {
      console.error('Failed to reset database:', error);
      throw error;
    }
  }
}
