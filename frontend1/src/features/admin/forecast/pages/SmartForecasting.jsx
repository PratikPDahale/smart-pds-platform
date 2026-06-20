import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Activity,
  BarChart3,
  Database,
  FileImage,
  LineChart as LineChartIcon,
  PackageSearch,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import forecastService, { resolveMlVisualUrl } from '../forecastService';

const nextMonth = () => {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return date.toISOString().slice(0, 7);
};

const formatKg = (value) => {
  const numericValue = Number(value || 0);
  return `${numericValue.toLocaleString(undefined, { maximumFractionDigits: 2 })} kg`;
};

const toTargetParts = (targetMonth) => {
  const [year, month] = targetMonth.split('-').map(Number);
  return { year, month };
};

function SmartForecasting() {
  const [metadata, setMetadata] = useState({
    fps_ids: [],
    commodities: [],
    beneficiary_classes: [],
    record_count: 0,
    date_range: null,
    visuals: [],
  });
  const [summary, setSummary] = useState({
    monthly_totals: [],
    commodity_totals: [],
    fps_totals: [],
    beneficiary_class_totals: [],
    feature_importance: [],
    visuals: [],
  });
  const [history, setHistory] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [batchForecast, setBatchForecast] = useState(null);
  const [recentForecasts, setRecentForecasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [batchSubmitting, setBatchSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fpsId: '',
    commodity: '',
    targetMonth: nextMonth(),
  });
  const [batchForm, setBatchForm] = useState({
    targetMonth: nextMonth(),
    fpsIds: [],
    commodities: [],
  });

  useEffect(() => {
    const loadForecasting = async () => {
      setLoading(true);
      setError('');

      try {
        const [metadataResponse, summaryResponse] = await Promise.all([
          forecastService.getMlMetadata(),
          forecastService.getMlSummary(),
        ]);

        const fpsIds = metadataResponse.fps_ids || [];
        const commodities = metadataResponse.commodities || [];
        const defaultFpsId = fpsIds[0] || '';
        const defaultCommodity = commodities[0] || '';

        setMetadata(metadataResponse);
        setSummary(summaryResponse);
        setFormData((current) => ({
          ...current,
          fpsId: current.fpsId || defaultFpsId,
          commodity: current.commodity || defaultCommodity,
        }));
        setBatchForm((current) => ({
          ...current,
          fpsIds: current.fpsIds.length ? current.fpsIds : fpsIds,
          commodities: current.commodities.length ? current.commodities : commodities,
        }));

        if (defaultFpsId && defaultCommodity) {
          const historyResponse = await forecastService.getMlHistory(defaultFpsId, defaultCommodity);
          setHistory(historyResponse.history || []);
        }
      } catch (err) {
        setError(err.message || 'Failed to connect to the ML forecasting service');
      } finally {
        setLoading(false);
      }
    };

    loadForecasting();
  }, []);

  const chartData = useMemo(() => {
    const actualSeries = history.map((item) => ({
      month: item.month,
      actualDemand: Number(item.quantity_distributed || 0),
      predictedDemand: null,
    }));

    if (!forecast) {
      return actualSeries;
    }

    const forecastMonth = `${forecast.year}-${String(forecast.month).padStart(2, '0')}`;
    return [
      ...actualSeries,
      {
        month: forecastMonth,
        actualDemand: null,
        predictedDemand: Number(forecast.predictedQuantity || 0),
      },
    ];
  }, [forecast, history]);

  const averageDemand = useMemo(() => {
    if (history.length === 0) {
      return 0;
    }

    const total = history.reduce((sum, item) => sum + Number(item.quantity_distributed || 0), 0);
    return total / history.length;
  }, [history]);

  const peakDemand = useMemo(() => (
    history.reduce((peak, item) => Math.max(peak, Number(item.quantity_distributed || 0)), 0)
  ), [history]);

  const batchTotal = useMemo(() => (
    batchForecast?.predictions?.reduce((sum, item) => sum + Number(item.predicted_quantity || 0), 0) || 0
  ), [batchForecast]);

  const visuals = useMemo(() => (
    summary.visuals?.length ? summary.visuals : metadata.visuals || []
  ), [metadata.visuals, summary.visuals]);

  const handleChange = async (event) => {
    const { name, value } = event.target;
    const nextFormData = { ...formData, [name]: value };
    setFormData(nextFormData);
    setForecast(null);

    if ((name === 'fpsId' || name === 'commodity') && nextFormData.fpsId && nextFormData.commodity) {
      try {
        const response = await forecastService.getMlHistory(nextFormData.fpsId, nextFormData.commodity);
        setHistory(response.history || []);
      } catch (err) {
        toast.error(err.message || 'Failed to load CSV history');
      }
    }
  };

  const handleToggle = (group, value) => {
    setBatchForm((current) => {
      const selected = current[group];
      const nextSelected = selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value];

      return {
        ...current,
        [group]: nextSelected,
      };
    });
  };

  const handleSelectAll = (group, values) => {
    setBatchForm((current) => ({
      ...current,
      [group]: current[group].length === values.length ? [] : values,
    }));
  };

  const handleForecast = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const { year, month } = toTargetParts(formData.targetMonth);
      const response = await forecastService.predictMlDemand({
        fpsId: formData.fpsId,
        commodity: formData.commodity,
        month,
        year,
      });

      setForecast(response);
      setHistory(response.history || []);
      setRecentForecasts((current) => [response, ...current].slice(0, 8));
      toast.success('On-demand forecast generated');
    } catch (err) {
      setError(err.message || 'Failed to generate ML forecast');
      toast.error(err.message || 'Failed to generate ML forecast');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBatchForecast = async (event) => {
    event.preventDefault();

    if (batchForm.fpsIds.length === 0 || batchForm.commodities.length === 0) {
      toast.error('Select at least one FPS and one commodity');
      return;
    }

    setBatchSubmitting(true);
    setError('');

    try {
      const { year, month } = toTargetParts(batchForm.targetMonth);
      const response = await forecastService.predictMlBatch({
        fpsIds: batchForm.fpsIds,
        commodities: batchForm.commodities,
        month,
        year,
      });

      setBatchForecast(response);
      toast.success('Batch forecast generated');
    } catch (err) {
      setError(err.message || 'Failed to generate batch forecast');
      toast.error(err.message || 'Failed to generate batch forecast');
    } finally {
      setBatchSubmitting(false);
    }
  };

  return (
    <div className="dashboard-content forecast-page">
      <section className="page-intro forecast-hero">
        <div>
          <span className="forecast-kicker">Python ML forecasting</span>
          <h2>On-demand ration demand intelligence</h2>
          <p>Forecast demand from the trained Python model, inspect CSV trends, compare FPS and commodity totals, and review model visuals in one admin workspace.</p>
        </div>
        <span className="badge badge-info">{metadata.source_dataset || 'forecasting_dataset_2023_cleaned.csv'}</span>
      </section>

      {error && <div className="alert alert-danger">{error}</div>}

      <section className="stats-grid-large">
        <article className="stat-card primary">
          <div className="stat-icon"><Database /></div>
          <div className="stat-details">
            <h3>{metadata.record_count?.toLocaleString() || 0}</h3>
            <p>CSV records</p>
          </div>
        </article>
        <article className="stat-card success">
          <div className="stat-icon"><PackageSearch /></div>
          <div className="stat-details">
            <h3>{metadata.fps_ids?.length || 0}</h3>
            <p>FPS IDs</p>
          </div>
        </article>
        <article className="stat-card info">
          <div className="stat-icon"><Activity /></div>
          <div className="stat-details">
            <h3>{metadata.commodities?.length || 0}</h3>
            <p>Commodities</p>
          </div>
        </article>
        <article className="stat-card warning">
          <div className="stat-icon"><BarChart3 /></div>
          <div className="stat-details">
            <h3>{metadata.feature_count || 0}</h3>
            <p>Model features</p>
          </div>
        </article>
      </section>

      <section className="forecast-main-grid">
        <article className="card">
          <div className="section-heading">
            <h3>Single FPS forecast</h3>
            <span className="badge badge-success">GET /api/forecast/predict</span>
          </div>

          <form className="admin-form-grid" onSubmit={handleForecast}>
            <label className="forecast-field">
              <span>FPS ID</span>
              <select className="form-control" name="fpsId" value={formData.fpsId} onChange={handleChange} required>
                <option value="">Select FPS</option>
                {metadata.fps_ids?.map((fpsId) => (
                  <option key={fpsId} value={fpsId}>{fpsId}</option>
                ))}
              </select>
            </label>

            <label className="forecast-field">
              <span>Commodity</span>
              <select className="form-control" name="commodity" value={formData.commodity} onChange={handleChange} required>
                <option value="">Select commodity</option>
                {metadata.commodities?.map((commodity) => (
                  <option key={commodity} value={commodity}>{commodity}</option>
                ))}
              </select>
            </label>

            <label className="forecast-field">
              <span>Target month</span>
              <input className="form-control" name="targetMonth" type="month" value={formData.targetMonth} onChange={handleChange} required />
            </label>

            <button className="btn btn-primary admin-form-actions" type="submit" disabled={submitting || loading}>
              <Sparkles size={18} />
              {submitting ? 'Forecasting...' : 'Forecast demand'}
            </button>
          </form>

          {forecast && (
            <div className="forecast-result">
              <span>Predicted demand</span>
              <strong>{formatKg(forecast.predictedQuantity)}</strong>
              <p>{forecast.fpsId} demand for {forecast.commodity} in {forecast.year}-{String(forecast.month).padStart(2, '0')}</p>
            </div>
          )}
        </article>

        <article className="card">
          <div className="section-heading">
            <h3>CSV history and prediction</h3>
            <span className="badge badge-info">{metadata.date_range ? `${metadata.date_range.from} to ${metadata.date_range.to}` : 'CSV data'}</span>
          </div>

          {loading ? (
            <p className="empty-state">Loading ML dataset...</p>
          ) : chartData.length === 0 ? (
            <p className="empty-state">Select a valid FPS and commodity to view demand history.</p>
          ) : (
            <div className="chart-shell">
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => (value == null ? 'N/A' : formatKg(value))} />
                  <Legend />
                  <Line type="monotone" dataKey="actualDemand" stroke="#000080" strokeWidth={3} name="CSV demand" connectNulls />
                  <Line type="monotone" dataKey="predictedDemand" stroke="#f97316" strokeWidth={3} name="ML forecast" connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="forecast-inline-metrics">
            <div>
              <span>Selected average</span>
              <strong>{formatKg(averageDemand)}</strong>
            </div>
            <div>
              <span>Selected peak</span>
              <strong>{formatKg(peakDemand)}</strong>
            </div>
          </div>
        </article>
      </section>

      <section className="card">
        <div className="section-heading">
          <h3>Batch monthly forecast</h3>
          <span className="badge badge-success">POST /api/forecast/predict-batch</span>
        </div>

        <form className="forecast-batch-layout" onSubmit={handleBatchForecast}>
          <label className="forecast-field">
            <span>Target month</span>
            <input className="form-control" name="targetMonth" type="month" value={batchForm.targetMonth} onChange={(event) => setBatchForm((current) => ({ ...current, targetMonth: event.target.value }))} required />
          </label>

          <div className="forecast-selector-panel">
            <div className="section-heading forecast-selector-heading">
              <h4>FPS coverage</h4>
              <button className="btn btn-sm btn-outline" type="button" onClick={() => handleSelectAll('fpsIds', metadata.fps_ids || [])}>
                {batchForm.fpsIds.length === metadata.fps_ids?.length ? 'Clear' : 'All'}
              </button>
            </div>
            <div className="forecast-check-grid">
              {metadata.fps_ids?.map((fpsId) => (
                <label key={fpsId} className="forecast-check">
                  <input type="checkbox" checked={batchForm.fpsIds.includes(fpsId)} onChange={() => handleToggle('fpsIds', fpsId)} />
                  <span>{fpsId}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="forecast-selector-panel">
            <div className="section-heading forecast-selector-heading">
              <h4>Commodities</h4>
              <button className="btn btn-sm btn-outline" type="button" onClick={() => handleSelectAll('commodities', metadata.commodities || [])}>
                {batchForm.commodities.length === metadata.commodities?.length ? 'Clear' : 'All'}
              </button>
            </div>
            <div className="forecast-check-grid">
              {metadata.commodities?.map((commodity) => (
                <label key={commodity} className="forecast-check">
                  <input type="checkbox" checked={batchForm.commodities.includes(commodity)} onChange={() => handleToggle('commodities', commodity)} />
                  <span>{commodity}</span>
                </label>
              ))}
            </div>
          </div>

          <button className="btn btn-secondary forecast-batch-action" type="submit" disabled={batchSubmitting || loading}>
            <TrendingUp size={18} />
            {batchSubmitting ? 'Forecasting network...' : 'Generate network forecast'}
          </button>
        </form>

        {batchForecast && (
          <div className="forecast-batch-results">
            <div className="forecast-result compact">
              <span>Total predicted demand</span>
              <strong>{formatKg(batchTotal)}</strong>
              <p>{batchForecast.predictions?.length || 0} FPS-commodity predictions for {batchForecast.year}-{String(batchForecast.month).padStart(2, '0')}</p>
            </div>

            <div className="forecast-batch-charts">
              <div className="chart-shell">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={batchForecast.commodity_totals || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="commodity" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatKg(value)} />
                    <Bar dataKey="predicted_quantity" fill="#138808" name="Predicted demand" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="table-container forecast-table-compact">
                <table>
                  <thead>
                    <tr>
                      <th>FPS</th>
                      <th>Commodity</th>
                      <th>Predicted demand</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batchForecast.predictions?.slice(0, 12).map((item) => (
                      <tr key={`${item.fps_id}-${item.commodity}-${item.month}-${item.year}`}>
                        <td>{item.fps_id}</td>
                        <td>{item.commodity}</td>
                        <td>{formatKg(item.predicted_quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="forecast-main-grid">
        <article className="card">
          <div className="section-heading">
            <h3>CSV commodity demand</h3>
            <span className="badge badge-info">Historical totals</span>
          </div>
          <div className="chart-shell">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={summary.commodity_totals || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="commodity" />
                <YAxis />
                <Tooltip formatter={(value) => formatKg(value)} />
                <Bar dataKey="demand" fill="#000080" name="CSV demand" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="card">
          <div className="section-heading">
            <h3>Model feature importance</h3>
            <span className="badge badge-info">{metadata.model_file || 'ration_model.pkl'}</span>
          </div>
          <div className="forecast-feature-list">
            {summary.feature_importance?.map((item) => (
              <div className="forecast-feature-item" key={item.feature}>
                <div>
                  <strong>{item.feature}</strong>
                  <span>{Number(item.importance || 0).toFixed(4)}</span>
                </div>
                <div className="forecast-feature-bar">
                  <span style={{ width: `${Math.min(100, Math.max(4, Number(item.importance || 0) * 100))}%` }} />
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="card">
        <div className="section-heading">
          <h3>Model report visuals</h3>
          <span className="badge badge-info">Python chart outputs</span>
        </div>

        {visuals.length === 0 ? (
          <p className="empty-state">No model report images are available yet.</p>
        ) : (
          <div className="forecast-visual-grid">
            {visuals.map((visual) => (
              <figure className="forecast-visual" key={visual.fileName}>
                <img src={resolveMlVisualUrl(visual.url)} alt={visual.title} />
                <figcaption>
                  <FileImage size={16} />
                  {visual.title}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </section>

      <section className="card">
        <div className="section-heading">
          <h3>Recent on-demand forecasts</h3>
          <span className="badge badge-info">Session results</span>
        </div>

        {recentForecasts.length === 0 ? (
          <p className="empty-state">Generated forecasts will appear here for this session.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Target month</th>
                  <th>FPS ID</th>
                  <th>Commodity</th>
                  <th>Predicted demand</th>
                  <th>Source dataset</th>
                </tr>
              </thead>
              <tbody>
                {recentForecasts.map((item, index) => (
                  <tr key={`${item.fpsId}-${item.commodity}-${item.month}-${item.year}-${index}`}>
                    <td>{item.year}-{String(item.month).padStart(2, '0')}</td>
                    <td>{item.fpsId}</td>
                    <td>{item.commodity}</td>
                    <td>{formatKg(item.predictedQuantity)}</td>
                    <td>{item.sourceDataset || metadata.source_dataset || 'forecasting_dataset_2023_cleaned.csv'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default SmartForecasting;
