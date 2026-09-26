import './App.css'

const products = [
  {
    id: 1,
    name: "Laptop",
    sku: "LP-001",
    category: "Electronics",
    stock: 24,
    reorderLevel: 10,
    status: "In Stock"
  },
  {
    id: 2,
    name: "Wireless Mouse",
    sku: "WM-002",
    category: "Accessories",
    stock: 8,
    reorderLevel: 15,
    status: "Low Stock"
  },
  {
    id: 3,
    name: "Keyboard",
    sku: "KB-003",
    category: "Accessories",
    stock: 32,
    reorderLevel: 10,
    status: "In Stock"
  },
  {
    id: 4,
    name: "USB-C Cable",
    sku: "UC-004",
    category: "Accessories",
    stock: 5,
    reorderLevel: 10,
    status: "Low Stock"
  },
  {
    id: 5,
    name: "Monitor",
    sku: "MN-005",
    category: "Electronics",
    stock: 18,
    reorderLevel: 8,
    status: "In Stock"
  }
]

const stockMovements = [
  {
    id: 1,
    product: "Laptop",
    type: "Receipt",
    quantity: 10,
    date: "Today"
  },
  {
    id: 2,
    product: "Wireless Mouse",
    type: "Delivery",
    quantity: -4,
    date: "Today"
  },
  {
    id: 3,
    product: "Keyboard",
    type: "Receipt",
    quantity: 8,
    date: "Yesterday"
  },
  {
    id: 4,
    product: "USB-C Cable",
    type: "Adjustment",
    quantity: -2,
    date: "Yesterday"
  }
]

const totalProducts = products.length

const totalStock = products.reduce(
  (total, product) => total + product.stock,
  0
)

const lowStock = products.filter(
  product => product.stock <= product.reorderLevel
).length

function App() {
  return (
    <div className="app">

      {/* Sidebar */}
      <aside className="sidebar">

        <div className="logo">
          <div className="logo-box">S</div>
          <span>StockSense</span>
        </div>

        <nav className="navigation">

          <div className="nav-section">
            <p className="nav-title">MAIN</p>

            <button className="nav-item active">
              <span>▦</span>
              Dashboard
            </button>

            <button className="nav-item">
              <span>□</span>
              Products
            </button>
          </div>

          <div className="nav-section">
            <p className="nav-title">OPERATIONS</p>

            <button className="nav-item">
              <span>↓</span>
              Receipts
            </button>

            <button className="nav-item">
              <span>↑</span>
              Delivery Orders
            </button>

            <button className="nav-item">
              <span>⇄</span>
              Move History
            </button>

            <button className="nav-item">
              <span>±</span>
              Inventory Adjustment
            </button>
          </div>

          <div className="nav-section">
            <p className="nav-title">SYSTEM</p>

            <button className="nav-item">
              <span>⚙</span>
              Settings
            </button>
          </div>

        </nav>

        <div className="sidebar-bottom">

          <div className="user-info">
            <div className="avatar">U</div>

            <div>
              <strong>Inventory Manager</strong>
              <small>Administrator</small>
            </div>
          </div>

          <button className="logout-button">
            Logout
          </button>

        </div>

      </aside>

      {/* Main Content */}
      <main className="main-content">

        <header className="topbar">

          <div>
            <p className="breadcrumb">Overview</p>
            <h1>Dashboard</h1>
          </div>

          <div className="warehouse">
            <span>Warehouse</span>
            <strong>Main Warehouse ▾</strong>
          </div>

        </header>

        <section className="dashboard">

          {/* Welcome Section */}
          <div className="welcome">

            <div>
              <p className="eyebrow">
                INVENTORY OVERVIEW
              </p>

              <h2>
                Welcome to StockSense
              </h2>

              <p>
                Monitor your inventory, stock movements and warehouse
                operations from one place.
              </p>
            </div>

          </div>

          {/* KPI Cards */}
          <div className="stats-grid">

            <div className="stat-card">
              <span className="stat-label">
                Total Products
              </span>

              <strong>
                {totalProducts}
              </strong>

              <small>
                Products in inventory
              </small>
            </div>

            <div className="stat-card">
              <span className="stat-label">
                Total Stock
              </span>

              <strong>
                {totalStock}
              </strong>

              <small>
                Units available
              </small>
            </div>

            <div className="stat-card">
              <span className="stat-label">
                Low Stock
              </span>

              <strong>
                {lowStock}
              </strong>

              <small>
                Products need attention
              </small>
            </div>

            <div className="stat-card">
              <span className="stat-label">
                Stock Movements
              </span>

              <strong>
                {stockMovements.length}
              </strong>

              <small>
                Recent movements
              </small>
            </div>

          </div>

          {/* Bottom Sections */}
          <div className="content-grid">

            {/* Recent Stock Movements */}
            <div className="panel">

              <div className="panel-header">

                <div>
                  <p className="eyebrow">
                    RECENT ACTIVITY
                  </p>

                  <h3>
                    Recent Stock Movements
                  </h3>
                </div>

                <button className="view-button">
                  View all
                </button>

              </div>

              <div className="movement-list">

                {stockMovements.map(movement => (

                  <div
                    className="movement-item"
                    key={movement.id}
                  >

                    <div className="movement-info">

                      <strong>
                        {movement.product}
                      </strong>

                      <small>
                        {movement.type} · {movement.date}
                      </small>

                    </div>

                    <span
                      className={
                        movement.quantity > 0
                          ? "movement-positive"
                          : "movement-negative"
                      }
                    >
                      {movement.quantity > 0 ? "+" : ""}
                      {movement.quantity} units
                    </span>

                  </div>

                ))}

              </div>

            </div>

            {/* Low Stock */}
            <div className="panel">

              <div className="panel-header">

                <div>
                  <p className="eyebrow">
                    ALERTS
                  </p>

                  <h3>
                    Low Stock
                  </h3>
                </div>

              </div>

              <div className="low-stock-list">

                {products
                  .filter(
                    product =>
                      product.stock <= product.reorderLevel
                  )
                  .map(product => (

                    <div
                      className="low-stock-item"
                      key={product.id}
                    >

                      <div>

                        <strong>
                          {product.name}
                        </strong>

                        <small>
                          {product.sku}
                        </small>

                      </div>

                      <span>
                        {product.stock} left
                      </span>

                    </div>

                  ))}

              </div>

            </div>

          </div>

        </section>

      </main>

    </div>
  )
}

export default App