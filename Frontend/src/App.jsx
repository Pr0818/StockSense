import { useState } from 'react'
import './App.css'

const initialProducts = [
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

function App() {
  const [products, setProducts] = useState(initialProducts)

  const [selectedWarehouse, setSelectedWarehouse] =
    useState("Main Warehouse")

  const [activePage, setActivePage] =
    useState("Dashboard")

  const [productSearch, setProductSearch] =
    useState("")

  const [showAddProduct, setShowAddProduct] =
    useState(false)

  const [newProduct, setNewProduct] = useState({
    name: "",
    sku: "",
    category: "",
    stock: "",
    reorderLevel: ""
  })

  const totalProducts = products.length

  const totalStock = products.reduce(
    (total, product) => total + product.stock,
    0
  )

  const lowStock = products.filter(
    product => product.stock <= product.reorderLevel
  ).length

  const filteredProducts = products.filter(product =>
    product.name
      .toLowerCase()
      .includes(productSearch.toLowerCase()) ||

    product.sku
      .toLowerCase()
      .includes(productSearch.toLowerCase()) ||

    product.category
      .toLowerCase()
      .includes(productSearch.toLowerCase())
  )

  const lowStockProducts = products.filter(
    product => product.stock <= product.reorderLevel
  )

  const handleAddProduct = (event) => {
    event.preventDefault()

    if (
      !newProduct.name.trim() ||
      !newProduct.sku.trim() ||
      !newProduct.category.trim() ||
      newProduct.stock === "" ||
      newProduct.reorderLevel === ""
    ) {
      alert("Please fill in all product fields.")
      return
    }

    const stock = Number(newProduct.stock)
    const reorderLevel = Number(newProduct.reorderLevel)

    if (stock < 0 || reorderLevel < 0) {
      alert("Stock and reorder level cannot be negative.")
      return
    }

    const product = {
      id: Date.now(),
      name: newProduct.name.trim(),
      sku: newProduct.sku.trim(),
      category: newProduct.category.trim(),
      stock,
      reorderLevel,
      status: stock <= reorderLevel
        ? "Low Stock"
        : "In Stock"
    }

    setProducts(previousProducts => [
      ...previousProducts,
      product
    ])

    setNewProduct({
      name: "",
      sku: "",
      category: "",
      stock: "",
      reorderLevel: ""
    })

    setShowAddProduct(false)
  }

  const handleCancelAddProduct = () => {
    setNewProduct({
      name: "",
      sku: "",
      category: "",
      stock: "",
      reorderLevel: ""
    })

    setShowAddProduct(false)
  }

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

            <button
              className={`nav-item ${
                activePage === "Dashboard" ? "active" : ""
              }`}
              onClick={() => setActivePage("Dashboard")}
            >
              <span>▦</span>
              Dashboard
            </button>

            <button
              className={`nav-item ${
                activePage === "Products" ? "active" : ""
              }`}
              onClick={() => setActivePage("Products")}
            >
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

            <div className="avatar">
              U
            </div>

            <div>
              <strong>
                Inventory Manager
              </strong>

              <small>
                Administrator
              </small>
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

            <p className="breadcrumb">
              {activePage === "Products"
                ? "Inventory"
                : "Overview"}
            </p>

            <h1>
              {activePage === "Products"
                ? "Products"
                : "Dashboard"}
            </h1>

          </div>

          <div className="warehouse">

            <span>
              Warehouse
            </span>

            <select
              value={selectedWarehouse}
              onChange={(event) =>
                setSelectedWarehouse(event.target.value)
              }
            >
              <option value="Main Warehouse">
                Main Warehouse
              </option>

              <option value="Warehouse 2">
                Warehouse 2
              </option>

              <option value="Warehouse 3">
                Warehouse 3
              </option>
            </select>

          </div>

        </header>

        {/* Products Page */}
        {activePage === "Products" ? (

          <section className="products-page">

            <div className="page-header">

              <div>

                <p className="eyebrow">
                  INVENTORY
                </p>

                <h2>
                  Products
                </h2>

                <p>
                  View and manage your inventory products.
                </p>

              </div>

              <div className="products-actions">

                <input
                  type="text"
                  className="product-search"
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={(event) =>
                    setProductSearch(event.target.value)
                  }
                />

                <button
                  className="add-product-button"
                  onClick={() => setShowAddProduct(true)}
                >
                  + Add Product
                </button>

              </div>

            </div>

            <div className="panel products-panel">

              <div className="products-table">

                <div className="product-row product-header">

                  <span>
                    Product
                  </span>

                  <span>
                    SKU
                  </span>

                  <span>
                    Category
                  </span>

                  <span>
                    Stock
                  </span>

                  <span>
                    Status
                  </span>

                </div>

                {filteredProducts.map(product => (

                  <div
                    className="product-row"
                    key={product.id}
                  >

                    <strong>
                      {product.name}
                    </strong>

                    <span>
                      {product.sku}
                    </span>

                    <span>
                      {product.category}
                    </span>

                    <span>
                      {product.stock}
                    </span>

                    <span
                      className={
                        product.stock <= product.reorderLevel
                          ? "status-low"
                          : "status-in-stock"
                      }
                    >
                      {product.stock <= product.reorderLevel
                        ? "Low Stock"
                        : "In Stock"}
                    </span>

                  </div>

                ))}

                {filteredProducts.length === 0 && (

                  <div className="empty-state">

                    <h4>
                      No products found
                    </h4>

                    <p>
                      Try searching for a different product,
                      SKU, or category.
                    </p>

                  </div>

                )}

              </div>

            </div>

          </section>

        ) : (

          /* Dashboard */
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
                  Monitor your inventory, stock movements and
                  warehouse operations from one place.
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

                  {lowStockProducts.map(product => (

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

        )}

      </main>

      {/* Add Product Modal */}
      {showAddProduct && (

        <div
          className="modal-overlay"
          onClick={handleCancelAddProduct}
        >

          <div
            className="product-modal"
            onClick={(event) => event.stopPropagation()}
          >

            <div className="modal-header">

              <div>

                <p className="eyebrow">
                  INVENTORY
                </p>

                <h2>
                  Add Product
                </h2>

              </div>

              <button
                className="modal-close"
                onClick={handleCancelAddProduct}
              >
                ×
              </button>

            </div>

            <form onSubmit={handleAddProduct}>

              <div className="form-group">

                <label>
                  Product Name
                </label>

                <input
                  type="text"
                  placeholder="e.g. Wireless Headphones"
                  value={newProduct.name}
                  onChange={(event) =>
                    setNewProduct({
                      ...newProduct,
                      name: event.target.value
                    })
                  }
                />

              </div>

              <div className="form-group">

                <label>
                  SKU
                </label>

                <input
                  type="text"
                  placeholder="e.g. WH-006"
                  value={newProduct.sku}
                  onChange={(event) =>
                    setNewProduct({
                      ...newProduct,
                      sku: event.target.value
                    })
                  }
                />

              </div>

              <div className="form-group">

                <label>
                  Category
                </label>

                <input
                  type="text"
                  placeholder="e.g. Electronics"
                  value={newProduct.category}
                  onChange={(event) =>
                    setNewProduct({
                      ...newProduct,
                      category: event.target.value
                    })
                  }
                />

              </div>

              <div className="form-row">

                <div className="form-group">

                  <label>
                    Stock Quantity
                  </label>

                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={newProduct.stock}
                    onChange={(event) =>
                      setNewProduct({
                        ...newProduct,
                        stock: event.target.value
                      })
                    }
                  />

                </div>

                <div className="form-group">

                  <label>
                    Reorder Level
                  </label>

                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={newProduct.reorderLevel}
                    onChange={(event) =>
                      setNewProduct({
                        ...newProduct,
                        reorderLevel: event.target.value
                      })
                    }
                  />

                </div>

              </div>

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={handleCancelAddProduct}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="add-product-button"
                >
                  Add Product
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  )
}

export default App