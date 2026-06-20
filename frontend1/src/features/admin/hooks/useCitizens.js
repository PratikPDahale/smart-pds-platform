import { useCallback, useEffect, useState } from 'react';
import CitizenService from '../citizen/CitizenService';

export function useCitizens() {
  const [citizens, setCitizens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCitizens = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await CitizenService.getAll();
      setCitizens(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load citizens');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCitizens();
  }, [loadCitizens]);

  return {
    citizens,
    loading,
    error,
    reload: loadCitizens,
    setCitizens,
  };
}
