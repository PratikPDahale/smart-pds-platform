import { useCallback, useEffect, useState } from 'react';
import DealerService from '../dealer/DealerService';

export function useDealers(initialStatus = 'ALL') {
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDealers = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = initialStatus === 'ALL'
        ? await DealerService.getAll()
        : await DealerService.getByStatus(initialStatus);

      setDealers(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load dealers');
    } finally {
      setLoading(false);
    }
  }, [initialStatus]);

  useEffect(() => {
    loadDealers();
  }, [loadDealers]);

  return {
    dealers,
    loading,
    error,
    reload: loadDealers,
    setDealers,
  };
}
