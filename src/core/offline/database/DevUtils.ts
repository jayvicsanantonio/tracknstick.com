// Development utilities for debugging and managing the offline database
// Expose helpful functions to the global window object for easy access from browser console

import { DatabaseCleanup } from './DatabaseCleanup';

declare global {
  interface Window {
    // Development utilities
    devUtils: {
      resetDatabase: () => Promise<void>;
      checkDatabase: () => Promise<void>;
      listStores: () => Promise<void>;
      clearAllData: () => Promise<void>;
    };
  }
}

class DevUtils {
  /**
   * Reset the database and reload the page
   */
  static async resetDatabase(): Promise<void> {
    console.log('🔄 Resetting database...');
    await DatabaseCleanup.resetAndReload();
  }

  /**
   * Check database status and version
   */
  static async checkDatabase(): Promise<void> {
    try {
      const info = await DatabaseCleanup.getDatabaseInfo();
      console.log('📊 Database Info:', info);

      if (info.exists) {
        const stores = await DatabaseCleanup.listObjectStores();
        console.log('🗂️  Object Stores:', stores);
      }
    } catch (error) {
      console.error('❌ Failed to check database:', error);
    }
  }

  /**
   * List all object stores
   */
  static async listStores(): Promise<void> {
    try {
      const stores = await DatabaseCleanup.listObjectStores();
      console.log('🗂️  Available Object Stores:', stores);
    } catch (error) {
      console.error('❌ Failed to list stores:', error);
    }
  }

  /**
   * Clear all browser storage for this domain
   */
  static async clearAllData(): Promise<void> {
    console.log('🧹 Clearing all browser data...');

    try {
      // Clear IndexedDB
      await DatabaseCleanup.deleteDatabase();

      // Clear localStorage
      localStorage.clear();

      // Clear sessionStorage
      sessionStorage.clear();

      console.log('✅ All data cleared. Reloading page...');
      window.location.reload();
    } catch (error) {
      console.error('❌ Failed to clear data:', error);
    }
  }
}

// Expose to global window object in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.devUtils = {
    resetDatabase: () => DevUtils.resetDatabase(),
    checkDatabase: () => DevUtils.checkDatabase(),
    listStores: () => DevUtils.listStores(),
    clearAllData: () => DevUtils.clearAllData(),
  };

  console.log(`
🛠️  Development Utilities Available:
   devUtils.resetDatabase()  - Reset database and reload
   devUtils.checkDatabase()  - Check database status
   devUtils.listStores()     - List object stores
   devUtils.clearAllData()   - Clear all browser data
  `);
}

export { DevUtils };
