import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../../api/axios';
import getApiErrorMessage from '../../../../utils/getApiErrorMessage';
import inventoryService from '../inventoryService';
import DealerService from '../../dealer/DealerService';
import { useInventory } from '../../hooks/useInventory';

function NetworkInventory() {
  const [dealers, setDealers] = useState([]);
  const [products, setProducts] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [formData, setFormData] = useState({
    dealerId: '',
    productId: '',
    quantity: '',
  });
  const { inventory, lowStockItems, loading, error, reload } = useInventory();

  useEffect(() => {
    Promise.all([DealerService.getAll(), api.get('/products')])
      .then(([dealerData, productResponse]) => {
        setDealers((dealerData || []).filter((dealer) => dealer?.id));
        setProducts(productResponse.data?.data || []);
      })
      .catch(() => {
        setDealers([]);
        setProducts([]);
      })
      .finally(() => {
        setLoadingOptions(false);
      });
  }, []);

  const inventorySummary = useMemo(() => {
    return inventory.reduce((summary, item) => {
      summary.totalStock += item.currentStock || 0;
      summary.totalReceived += item.stockReceived || 0;
      summary.totalDistributed += item.stockDistributed || 0;
      return summary;
    }, { totalStock: 0, totalReceived: 0, totalDistributed: 0 });
  }, [inventory]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await inventoryService.addStock({
        dealerId: formData.dealerId,
        productId: formData.productId,
        quantity: formData.quantity,
      });
      toast.success('Stock added successfully');
      setFormData({ dealerId: '', productId: '', quantity: '' });
      await reload();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to add stock'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-content">
      <section className="page-intro">
        <div>
          <h2>Network inventory</h2>
          <p>Track stock across dealers and push new stock through the inventory microservice.</p>
        </div>
      </section>

      {error && <div className="alert alert-danger">{error}</div>}

      <section className="stats-grid">
        <article className="stat-panel info">
          <div><p>Total stock</p><h3>{inventorySummary.totalStock.toFixed(2)}</h3></div>
        </article>
        <article className="stat-panel success">
          <div><p>Total received</p><h3>{inventorySummary.totalReceived.toFixed(2)}</h3></div>
        </article>
        <article className="stat-panel warning">
          <div><p>Total distributed</p><h3>{inventorySummary.totalDistributed.toFixed(2)}</h3></div>
        </article>
        <article className="stat-panel danger">
          <div><p>Low stock alerts</p><h3>{lowStockItems.length}</h3></div>
        </article>
      </section>

      <section className="insight-grid">
        <article className="card">
          <div className="section-heading">
            <h3>Add stock</h3>
            <span className="badge badge-info">POST /api/inventory/add-stock</span>
          </div>

          <form className="admin-form-grid" onSubmit={handleSubmit}>
            <select className="form-control" name="dealerId" value={formData.dealerId} onChange={handleChange} required>
              <option value="">Select dealer</option>
              {dealers.map((dealer) => (
                <option key={dealer.id} value={dealer.id}>
                  {dealer.shopName} (Dealer ID: {dealer.id})
                </option>
              ))}
            </select>
            <select className="form-control" name="productId" value={formData.productId} onChange={handleChange} required>
              <option value="">Select product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.productName} (Product ID: {product.id})
                </option>
              ))}
            </select>
            <input className="form-control" name="quantity" type="number" min="0.01" step="0.01" placeholder="Quantity" value={formData.quantity} onChange={handleChange} required />
            <button
              className="btn btn-primary admin-form-actions"
              type="submit"
              disabled={submitting || loadingOptions || dealers.length === 0 || products.length === 0}
            >
              {submitting ? 'Submitting...' : loadingOptions ? 'Loading...' : 'Add stock'}
            </button>
          </form>
          {!loadingOptions && dealers.length === 0 && (
            <p className="empty-state">No dealers available. Create a dealer before adding stock.</p>
          )}
          {!loadingOptions && products.length === 0 && (
            <p className="empty-state">No products available. Create a product before adding stock.</p>
          )}
        </article>

        <article className="card">
          <div className="section-heading">
            <h3>Low stock watchlist</h3>
            <AlertTriangle size={18} />
          </div>
          {lowStockItems.length === 0 ? (
            <p className="empty-state">No low stock warnings right now.</p>
          ) : (
            <div className="stack-list">
              {lowStockItems.slice(0, 5).map((item) => (
                <div key={item.id} className="stack-item">
                  <strong>{item.productName}</strong>
                  <span>{item.dealerName}</span>
                  <span>{item.currentStock} remaining</span>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>

      <section className="card">
        <div className="section-heading">
          <h3>All inventory records</h3>
          <span className="badge badge-success">{inventory.length} records</span>
        </div>

        {loading ? (
          <p className="empty-state">Loading inventory...</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Dealer</th>
                  <th>Product</th>
                  <th>Current stock</th>
                  <th>Received</th>
                  <th>Distributed</th>
                  <th>Last updated</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.id}>
                    <td>{item.dealerName}</td>
                    <td>{item.productName}</td>
                    <td>{item.currentStock}</td>
                    <td>{item.stockReceived}</td>
                    <td>{item.stockDistributed}</td>
                    <td>{item.lastUpdated ? new Date(item.lastUpdated).toLocaleString() : 'N/A'}</td>
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

export default NetworkInventory;
