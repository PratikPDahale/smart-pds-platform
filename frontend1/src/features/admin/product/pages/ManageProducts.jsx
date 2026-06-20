import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import ProductService from '../ProductService';
import getApiErrorMessage from '../../../../utils/getApiErrorMessage';

const initialForm = {
  productName: '',
  category: '',
  unit: 'KG',
  pricePerUnit: '',
};

function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialForm);

  const loadProducts = async (category = filterCategory) => {
    setLoading(true);
    try {
      const data = category && category !== 'ALL'
        ? await ProductService.getByCategory(category)
        : await ProductService.getAll();
      setProducts(data || []);
    } catch (error) {
      setProducts([]);
      toast.error(getApiErrorMessage(error, 'Failed to load products'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts('ALL');
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const resetForm = () => {
    setFormData(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    const payload = {
      productName: formData.productName.trim(),
      category: formData.category.trim() || null,
      unit: formData.unit.trim().toUpperCase(),
      pricePerUnit: Number(formData.pricePerUnit),
    };

    try {
      if (editingId) {
        await ProductService.update(editingId, payload);
        toast.success('Product updated successfully');
      } else {
        await ProductService.create(payload);
        toast.success('Product created successfully');
      }
      resetForm();
      await loadProducts();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to save product'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      productName: product.productName || '',
      category: product.category || '',
      unit: product.unit || 'KG',
      pricePerUnit: product.pricePerUnit ?? '',
    });
  };

  const handleDelete = async (id) => {
    setSubmitting(true);
    try {
      await ProductService.remove(id);
      toast.success('Product deleted successfully');
      if (editingId === id) {
        resetForm();
      }
      await loadProducts();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to delete product'));
    } finally {
      setSubmitting(false);
    }
  };

  const applyFilter = async (event) => {
    const nextCategory = event.target.value;
    setFilterCategory(nextCategory);
    await loadProducts(nextCategory);
  };

  return (
    <div className="dashboard-content">
      <section className="page-intro">
        <div>
          <h2>Manage products</h2>
          <p>Create products first, then use them in inventory add-stock flows for admins and dealers.</p>
        </div>
      </section>

      <section className="card">
        <div className="section-heading">
          <h3>{editingId ? 'Update product' : 'Create product'}</h3>
          <span className="badge badge-info">{editingId ? 'PUT /api/products/{id}' : 'POST /api/products'}</span>
        </div>

        <form className="admin-form-grid" onSubmit={handleSubmit}>
          <input
            className="form-control"
            name="productName"
            placeholder="Product name"
            value={formData.productName}
            onChange={handleChange}
            required
          />
          <input
            className="form-control"
            name="category"
            placeholder="Category"
            value={formData.category}
            onChange={handleChange}
          />
          <select className="form-control" name="unit" value={formData.unit} onChange={handleChange} required>
            <option value="KG">KG</option>
            <option value="LITER">LITER</option>
            <option value="PACKET">PACKET</option>
            <option value="UNIT">UNIT</option>
          </select>
          <input
            className="form-control"
            name="pricePerUnit"
            placeholder="Price per unit"
            type="number"
            min="0.01"
            step="0.01"
            value={formData.pricePerUnit}
            onChange={handleChange}
            required
          />
          <button className="btn btn-primary admin-form-actions" type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : editingId ? 'Update product' : 'Create product'}
          </button>
          {editingId && (
            <button className="btn btn-outline admin-form-actions" type="button" onClick={resetForm} disabled={submitting}>
              Cancel edit
            </button>
          )}
        </form>
      </section>

      <section className="card">
        <div className="section-heading">
          <h3>Product catalog</h3>
          <span className="badge badge-success">{products.length} records</span>
        </div>

        <div className="filter-group">
          <label htmlFor="product-category-filter">Filter by category</label>
          <select
            id="product-category-filter"
            className="form-control"
            value={filterCategory}
            onChange={applyFilter}
          >
            <option value="ALL">All</option>
            <option value="GRAIN">GRAIN</option>
            <option value="GRAINS">GRAINS</option>
            <option value="SUGAR">SUGAR</option>
            <option value="OIL">OIL</option>
            <option value="FUEL">FUEL</option>
          </select>
        </div>

        {loading ? (
          <p className="empty-state">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="empty-state">No products found for the selected view.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Unit</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>{product.productName}</td>
                    <td>{product.category || 'N/A'}</td>
                    <td>{product.unit || 'N/A'}</td>
                    <td>{product.pricePerUnit}</td>
                    <td><span className="badge badge-success">{product.active === false ? 'Inactive' : 'Active'}</span></td>
                    <td>
                      <button className="btn btn-outline btn-sm" type="button" onClick={() => handleEdit(product)} disabled={submitting}>
                        Edit
                      </button>
                      <button className="btn btn-outline btn-sm" type="button" onClick={() => handleDelete(product.id)} disabled={submitting}>
                        Delete
                      </button>
                    </td>
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

export default ManageProducts;
