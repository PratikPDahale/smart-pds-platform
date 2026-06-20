import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  Boxes,
  Building2,
  CircleDollarSign,
  PackageCheck,
  ShieldCheck,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import ProductService from '../product/ProductService';
import { useAdminStats } from '../hooks/useAdminStats';
import { useCitizens } from '../hooks/useCitizens';
import { useDealers } from '../hooks/useDealers';
import { useInventory } from '../hooks/useInventory';

const CHART_COLORS = ['#8b0000', '#f97316', '#2563eb', '#16a34a', '#7c3aed', '#0f766e'];

const compactNumber = new Intl.NumberFormat('en-IN', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const currencyNumber = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const decimalNumber = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function normalizeRegion(region) {
  return region?.trim() || 'Unassigned';
}

function Analytics() {
  const { stats, loading: statsLoading, error: statsError } = useAdminStats();
  const { inventory, lowStockItems, loading: inventoryLoading, error: inventoryError } = useInventory();
  const { dealers, loading: dealersLoading, error: dealersError } = useDealers();
  const { citizens, loading: citizensLoading, error: citizensError } = useCitizens();
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      setProductsLoading(true);
      setProductsError('');

      try {
        const data = await ProductService.getAll();
        if (active) {
          setProducts(data || []);
        }
      } catch (error) {
        if (active) {
          setProducts([]);
          setProductsError(error.message || 'Failed to load products');
        }
      } finally {
        if (active) {
          setProductsLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      active = false;
    };
  }, []);

  const loading = statsLoading || inventoryLoading || dealersLoading || citizensLoading || productsLoading;
  const errors = [statsError, inventoryError, dealersError, citizensError, productsError].filter(Boolean);

  const analytics = useMemo(() => {
    const totalCitizens = Number(stats?.totalCitizens ?? citizens.length ?? 0);
    const totalDealers = Number(stats?.totalDealers ?? dealers.length ?? 0);
    const totalProducts = Number(stats?.totalProducts ?? products.length ?? 0);
    const totalDistributions = Number(stats?.totalDistributions ?? 0);
    const activeDealers =
      Number(stats?.activeDealers ?? dealers.filter((dealer) => dealer.active || dealer.status === 'ACTIVE').length);

    const totalFamilies = citizens.reduce((sum, citizen) => sum + (citizen.familySize || 0), 0);
    const assignedCitizens = citizens.filter((citizen) => citizen.dealerId).length;

    const totalCurrentStock = inventory.reduce((sum, item) => sum + (item.currentStock || 0), 0);
    const totalOpeningStock = inventory.reduce((sum, item) => sum + (item.openingStock || 0), 0);
    const totalReceivedStock = inventory.reduce((sum, item) => sum + (item.stockReceived || 0), 0);
    const totalDistributedStock = inventory.reduce((sum, item) => sum + (item.stockDistributed || 0), 0);

    const productPriceMap = new Map(products.map((product) => [product.id, product.pricePerUnit || 0]));
    const estimatedInventoryValue = inventory.reduce((sum, item) => {
      const unitPrice = productPriceMap.get(item.productId) || 0;
      return sum + (item.currentStock || 0) * unitPrice;
    }, 0);

    const citizenCategoryMap = citizens.reduce((accumulator, citizen) => {
      const key = citizen.category || 'UNSPECIFIED';
      accumulator[key] = (accumulator[key] || 0) + 1;
      return accumulator;
    }, {});

    const categoryData = Object.entries(citizenCategoryMap)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort((left, right) => right.value - left.value);

    const productMixMap = inventory.reduce((accumulator, item) => {
      const key = item.productName || `Product #${item.productId}`;

      if (!accumulator[key]) {
        accumulator[key] = {
          name: key,
          stock: 0,
          value: 0,
        };
      }

      const price = productPriceMap.get(item.productId) || 0;
      accumulator[key].stock += item.currentStock || 0;
      accumulator[key].value += (item.currentStock || 0) * price;
      return accumulator;
    }, {});

    const topProducts = Object.values(productMixMap)
      .sort((left, right) => right.stock - left.stock)
      .slice(0, 5);

    const dealerCitizenMap = citizens.reduce((accumulator, citizen) => {
      if (citizen.dealerId) {
        accumulator[citizen.dealerId] = (accumulator[citizen.dealerId] || 0) + 1;
      }
      return accumulator;
    }, {});

    const dealerStockMap = inventory.reduce((accumulator, item) => {
      if (item.dealerId) {
        accumulator[item.dealerId] = (accumulator[item.dealerId] || 0) + (item.currentStock || 0);
      }
      return accumulator;
    }, {});

    const regionMap = dealers.reduce((accumulator, dealer) => {
      const key = normalizeRegion(dealer.region);

      if (!accumulator[key]) {
        accumulator[key] = {
          region: key,
          dealers: 0,
          activeDealers: 0,
          citizens: 0,
          stock: 0,
        };
      }

      accumulator[key].dealers += 1;
      accumulator[key].activeDealers += dealer.active || dealer.status === 'ACTIVE' ? 1 : 0;
      accumulator[key].citizens += dealerCitizenMap[dealer.id] || 0;
      accumulator[key].stock += dealerStockMap[dealer.id] || 0;
      return accumulator;
    }, {});

    const regionData = Object.values(regionMap)
      .map((entry) => {
        const activityScore = entry.dealers
          ? Math.round(((entry.activeDealers / entry.dealers) * 55) + Math.min((entry.citizens / 25), 25) + Math.min((entry.stock / 150), 20))
          : 0;

        return {
          ...entry,
          activityScore: Math.min(activityScore, 100),
        };
      })
      .sort((left, right) => right.activityScore - left.activityScore)
      .slice(0, 6);

    const supplyFlowData = [
      { name: 'Opening', value: totalOpeningStock, fill: '#94a3b8' },
      { name: 'Received', value: totalReceivedStock, fill: '#2563eb' },
      { name: 'Issued', value: totalDistributedStock, fill: '#f97316' },
      { name: 'Balance', value: totalCurrentStock, fill: '#16a34a' },
    ];

    const lowStockRate = inventory.length ? (lowStockItems.length / inventory.length) * 100 : 0;
    const dealerActivationRate = totalDealers ? (activeDealers / totalDealers) * 100 : 0;
    const citizenCoverageRate = totalCitizens ? (assignedCitizens / totalCitizens) * 100 : 0;
    const networkReadiness = Math.max(
      0,
      Math.min(
        100,
        Math.round((dealerActivationRate * 0.38) + (citizenCoverageRate * 0.34) + ((100 - lowStockRate) * 0.28))
      )
    );

    const householdsPerDealer = activeDealers ? totalCitizens / activeDealers : 0;
    const familySizeAverage = totalCitizens ? totalFamilies / totalCitizens : 0;
    const stockPerDealer = activeDealers ? totalCurrentStock / activeDealers : 0;

    return {
      totalCitizens,
      totalDealers,
      totalProducts,
      totalDistributions,
      activeDealers,
      totalFamilies,
      assignedCitizens,
      totalCurrentStock,
      totalOpeningStock,
      totalReceivedStock,
      totalDistributedStock,
      estimatedInventoryValue,
      categoryData,
      topProducts,
      regionData,
      supplyFlowData,
      lowStockRate,
      dealerActivationRate,
      citizenCoverageRate,
      networkReadiness,
      householdsPerDealer,
      familySizeAverage,
      stockPerDealer,
    };
  }, [citizens, dealers, inventory, lowStockItems.length, products, stats]);

  const summaryCards = [
    {
      label: 'Network readiness',
      value: `${analytics.networkReadiness}%`,
      note: `${Math.round(analytics.dealerActivationRate)}% dealer activation`,
      icon: ShieldCheck,
      tone: 'maroon',
    },
    {
      label: 'Inventory value',
      value: currencyNumber.format(analytics.estimatedInventoryValue || 0),
      note: `${compactNumber.format(analytics.totalCurrentStock || 0)} live stock units`,
      icon: CircleDollarSign,
      tone: 'amber',
    },
    {
      label: 'Citizen coverage',
      value: `${Math.round(analytics.citizenCoverageRate)}%`,
      note: `${compactNumber.format(analytics.assignedCitizens || 0)} citizens mapped to dealers`,
      icon: Users,
      tone: 'blue',
    },
    {
      label: 'Low stock exposure',
      value: `${Math.round(analytics.lowStockRate)}%`,
      note: `${lowStockItems.length} alert${lowStockItems.length === 1 ? '' : 's'} across the network`,
      icon: AlertTriangle,
      tone: 'green',
    },
  ];

  const executiveSignals = [
    {
      title: 'Dealer load',
      value: `${compactNumber.format(analytics.householdsPerDealer || 0)} citizens / active dealer`,
    },
    {
      title: 'Average household size',
      value: `${decimalNumber.format(analytics.familySizeAverage || 0)} members`,
    },
    {
      title: 'Stock depth',
      value: `${compactNumber.format(analytics.stockPerDealer || 0)} units / active dealer`,
    },
  ];

  const topRegion = analytics.regionData[0];
  const topCategory = analytics.categoryData[0];

  return (
    <div className="dashboard-content analytics-page">
      <section className="analytics-hero">
        <div className="analytics-hero__content">
          <span className="analytics-hero__eyebrow">System intelligence</span>
          <h2>Network analytics command center</h2>
          <p>
            Track service coverage, stock health, product concentration, and dealer performance from one
            operational view built on live admin data.
          </p>

          <div className="analytics-hero__signals">
            {executiveSignals.map((signal) => (
              <div key={signal.title} className="analytics-signal">
                <span>{signal.title}</span>
                <strong>{loading ? '...' : signal.value}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-hero__panel">
          <div className="analytics-health-ring">
            <div className="analytics-health-ring__inner">
              <span>Readiness</span>
              <strong>{loading ? '...' : `${analytics.networkReadiness}%`}</strong>
            </div>
          </div>

          <div className="analytics-hero__meta">
            <div>
              <span>Top region</span>
              <strong>{loading ? '...' : topRegion?.region || 'No regional data'}</strong>
            </div>
            <div>
              <span>Lead category</span>
              <strong>{loading ? '...' : topCategory?.name || 'No citizen data'}</strong>
            </div>
            <div>
              <span>Portfolio size</span>
              <strong>
                {loading ? '...' : `${analytics.totalProducts} products / ${analytics.totalDealers} dealers`}
              </strong>
            </div>
          </div>
        </div>
      </section>

      {errors.length > 0 && (
        <div className="alert alert-danger">
          Some analytics widgets may be partial: {errors.join(' | ')}
        </div>
      )}

      <section className="analytics-summary-grid">
        {summaryCards.map(({ label, value, note, icon: Icon, tone }) => (
          <article key={label} className={`analytics-summary-card ${tone}`}>
            <div className="analytics-summary-card__icon">
              <Icon size={20} />
            </div>
            <div className="analytics-summary-card__body">
              <span>{label}</span>
              <strong>{loading ? '...' : value}</strong>
              <p>{loading ? 'Loading live network metrics...' : note}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="analytics-main-grid">
        <article className="card analytics-card analytics-card--wide">
          <div className="section-heading analytics-section-heading">
            <div>
              <h3>Supply movement snapshot</h3>
              <p>Opening, inbound, issued, and current inventory totals across the network.</p>
            </div>
            <span className="badge badge-info">Live inventory</span>
          </div>

          <div className="analytics-chart">
            {loading ? (
              <div className="analytics-empty">Rendering supply analytics...</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.supplyFlowData} barCategoryGap={28}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip formatter={(value) => compactNumber.format(value || 0)} />
                  <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                    {analytics.supplyFlowData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="analytics-inline-metrics">
            <div>
              <span>Total stock balance</span>
              <strong>{loading ? '...' : compactNumber.format(analytics.totalCurrentStock || 0)}</strong>
            </div>
            <div>
              <span>Total distributions</span>
              <strong>{loading ? '...' : compactNumber.format(analytics.totalDistributions || 0)}</strong>
            </div>
            <div>
              <span>Tracked households</span>
              <strong>{loading ? '...' : compactNumber.format(analytics.totalFamilies || 0)}</strong>
            </div>
          </div>
        </article>

        <article className="card analytics-card">
          <div className="section-heading analytics-section-heading">
            <div>
              <h3>Citizen category mix</h3>
              <p>Distribution of registered citizens by ration category.</p>
            </div>
            <span className="badge badge-success">Beneficiary lens</span>
          </div>

          <div className="analytics-chart analytics-chart--compact">
            {loading ? (
              <div className="analytics-empty">Loading category distribution...</div>
            ) : analytics.categoryData.length === 0 ? (
              <div className="analytics-empty">No citizen records available yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={analytics.categoryData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={62}
                    outerRadius={96}
                    paddingAngle={3}
                  >
                    {analytics.categoryData.map((entry, index) => (
                      <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => compactNumber.format(value || 0)} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="analytics-legend-list">
            {analytics.categoryData.slice(0, 4).map((entry, index) => (
              <div key={entry.name} className="analytics-legend-item">
                <span className="analytics-legend-item__swatch" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                <span>{entry.name}</span>
                <strong>{compactNumber.format(entry.value || 0)}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="card analytics-card">
          <div className="section-heading analytics-section-heading">
            <div>
              <h3>Regional performance</h3>
              <p>Score blends dealer activity, linked citizens, and available stock.</p>
            </div>
            <span className="badge badge-warning">Operational ranking</span>
          </div>

          <div className="analytics-chart analytics-chart--compact">
            {loading ? (
              <div className="analytics-empty">Compiling regional coverage...</div>
            ) : analytics.regionData.length === 0 ? (
              <div className="analytics-empty">No regional dealer data available.</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={analytics.regionData} layout="vertical" margin={{ left: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" tickLine={false} axisLine={false} domain={[0, 100]} />
                  <YAxis dataKey="region" type="category" tickLine={false} axisLine={false} width={90} />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Bar dataKey="activityScore" fill="#8b0000" radius={[0, 12, 12, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="analytics-region-list">
            {analytics.regionData.slice(0, 3).map((region) => (
              <div key={region.region} className="analytics-region-item">
                <div>
                  <strong>{region.region}</strong>
                  <span>{region.activeDealers}/{region.dealers} active dealers</span>
                </div>
                <div>
                  <strong>{region.citizens}</strong>
                  <span>linked citizens</span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="card analytics-card">
          <div className="section-heading analytics-section-heading">
            <div>
              <h3>Product concentration</h3>
              <p>Highest stock-holding products by current portfolio share.</p>
            </div>
            <span className="badge badge-danger">Stock weight</span>
          </div>

          <div className="analytics-stack-list">
            {loading ? (
              <div className="analytics-empty">Calculating stock mix...</div>
            ) : analytics.topProducts.length === 0 ? (
              <div className="analytics-empty">No inventory records available yet.</div>
            ) : (
              analytics.topProducts.map((product, index) => {
                const share = analytics.totalCurrentStock ? (product.stock / analytics.totalCurrentStock) * 100 : 0;

                return (
                  <div key={product.name} className="analytics-stack-item">
                    <div className="analytics-stack-item__row">
                      <div>
                        <strong>{product.name}</strong>
                        <span>{compactNumber.format(product.stock || 0)} units</span>
                      </div>
                      <div className="analytics-stack-item__meta">
                        <strong>{Math.round(share)}%</strong>
                        <span>{currencyNumber.format(product.value || 0)}</span>
                      </div>
                    </div>
                    <div className="analytics-progress">
                      <span
                        style={{
                          width: `${Math.max(share, 6)}%`,
                          background: CHART_COLORS[index % CHART_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </article>
      </section>

      <section className="analytics-lower-grid">
        <article className="card analytics-card">
          <div className="section-heading analytics-section-heading">
            <div>
              <h3>Executive notes</h3>
              <p>Priority signals for operations, compliance, and planning teams.</p>
            </div>
            <ArrowUpRight size={18} />
          </div>

          <div className="analytics-note-list">
            <div className="analytics-note-item">
              <div className="analytics-note-item__icon maroon">
                <Building2 size={18} />
              </div>
              <div>
                <strong>Dealer readiness is at {loading ? '...' : `${Math.round(analytics.dealerActivationRate)}%`}.</strong>
                <p>Focus onboarding on inactive shops before seasonal volume rises.</p>
              </div>
            </div>
            <div className="analytics-note-item">
              <div className="analytics-note-item__icon blue">
                <Boxes size={18} />
              </div>
              <div>
                <strong>{loading ? '...' : lowStockItems.length} locations are below threshold.</strong>
                <p>Replenishment should prioritize high-citizen dealers with repeated low-balance exposure.</p>
              </div>
            </div>
            <div className="analytics-note-item">
              <div className="analytics-note-item__icon amber">
                <PackageCheck size={18} />
              </div>
              <div>
                <strong>{loading ? '...' : analytics.totalProducts} product lines are under active monitoring.</strong>
                <p>Use stock concentration to balance procurement against dependency on a small set of commodities.</p>
              </div>
            </div>
          </div>
        </article>

        <article className="card analytics-card">
          <div className="section-heading analytics-section-heading">
            <div>
              <h3>Critical stock alerts</h3>
              <p>Most urgent dealer-product combinations approaching stock risk.</p>
            </div>
            <span className="badge badge-danger">{lowStockItems.length} alerts</span>
          </div>

          {loading ? (
            <div className="analytics-empty">Loading stock alert queue...</div>
          ) : lowStockItems.length === 0 ? (
            <div className="analytics-empty">No low stock alerts at the current threshold.</div>
          ) : (
            <div className="analytics-alert-list">
              {lowStockItems.slice(0, 5).map((item) => (
                <div key={item.id} className="analytics-alert-item">
                  <div className="analytics-alert-item__header">
                    <strong>{item.productName}</strong>
                    <span>{item.currentStock} units left</span>
                  </div>
                  <p>{item.dealerName || `Dealer #${item.dealerId}`}</p>
                  <div className="analytics-alert-item__bar">
                    <span style={{ width: `${Math.min((item.currentStock || 0) * 2, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>
    </div>
  );
}

export default Analytics;
