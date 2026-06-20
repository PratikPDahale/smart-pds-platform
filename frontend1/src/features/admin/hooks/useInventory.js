import { useCallback, useEffect, useState } from 'react';
import inventoryService from '../inventory/inventoryService';

export function useInventory(threshold = 50) {
  const [inventory, setInventory] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadInventory = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [inventoryData, lowStockData] = await Promise.all([
        inventoryService.getAll(),
        inventoryService.getLowStock(threshold),
      ]);

      setInventory(inventoryData || []);
      setLowStockItems(lowStockData || []);
    } catch (err) {
      setError(err.message || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, [threshold]);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  return {
    inventory,
    lowStockItems,
    loading,
    error,
    reload: loadInventory,
  };
}
