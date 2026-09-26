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

const emptyProduct = {
  name: "",
  sku: "",
  category: "",
  stock: "",
  reorderLevel: ""
}

function App() {
  const [products, setProducts] = useState(initialProducts)

  const [selectedWarehouse, setSelectedWarehouse] =
    useState("Main Warehouse")

  const [activePage, setActivePage] =
    useState("Dashboard")

  const [productSearch, setProductSearch] =
    useState("")

  const [showProductModal, setShowProductModal] =
    useState(false)

  const [editingProductId, setEditingProductId] =
    useState(null)

  const [productForm, setProductForm] =
    useState(emptyProduct)

  const totalProducts = products.length

  const totalStock = products.reduce(
    (total, product) => total + product.stock,
    0
  )

  const lowStock = products.filter(
    product => product.stock <= product.reorderLevel
  ).length

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    product.sku.toLowerCase().includes(productSearch.toLowerCase()) ||
    product.category.toLowerCase().includes(productSearch.toLowerCase())
  )

  const lowStockProducts = products.filter(
    product => product.stock <= product.reorderLevel
  )

  const openAddProductModal = () => {
    setEditingProductId(null)
    setProductForm(emptyProduct)
    setShowProductModal(true)
  }

  const openEditProductModal = (product) => {
    setEditingProductId(product.id)

    setProductForm({
      name: product.name,
      sku: product.sku,
      category: product.category,
      stock: String(product.stock),
      reorderLevel: String(product.reorderLevel)
    })

    setShowProductModal(true)
  }

  const closeProductModal = () => {
    setShowProductModal(false)
    setEditingProductId(null)
    setProductForm(emptyProduct)
  }

  const handleProductSubmit = (event) => {
    event.preventDefault()

    if (
      !productForm.name.trim() ||
      !productForm.sku.trim() ||
      !productForm.category.trim() ||
      productForm.stock === "" ||
      productForm.reorderLevel === ""
    ) {
      alert("Please fill in all product fields.")
      return
    }

    const stock = Number(productForm.stock)
    const reorderLevel = Number(productForm.reorderLevel)

    if (stock < 0 || reorderLevel < 0) {
      alert("Stock and reorder level cannot be negative.")
      return
    }

    const updatedProduct = {
      id: editingProductId ?? Date.now(),
      name: productForm.name.trim(),
      sku: productForm.sku.trim(),
      category: productForm.category.trim(),
      stock,
      reorderLevel,
      status: stock <= reorderLevel
        ? "Low Stock"
        : "In Stock"
    }

    if (editingProductId !== null) {
      setProducts(previousProducts =>
        previousProducts.map(product =>
          product.id === editingProductId
            ? updatedProduct
            : product
        )
      )
    } else {
      setProducts(previousProducts => [
        ...previousProducts,
        updatedProduct
      ])
    }

    closeProductModal()
  }

  const handleDeleteProduct = (productId) => {
    const product = products.find(
      product => product.id === productId
    )

    if (!product) {
      return
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`
    )

    if (!confirmed) {
      return
    }

    setProducts(previousProducts =>
      previousProducts.filter(product =>
        product.id !== productId
      )
    )
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
                  onClick={openAddProductModal}
                >
                  + Add Product
                </button>

              </div>

            </div>

            <div className="panel products-panel">

              <div className="products-table">

                <div className="product-row product-header">

                  <span>Product</span>
                  <span>SKU</span>
                  <span>Category</span>
                  <span>Stock</span>
                  <span>Status</span>
                  <span>Actions</span>

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

                    <div className="product-actions">

                      <button
                        className="edit-product-button"
                        onClick={() =>
                          openEditProductModal(product)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="delete-product-button"
                        onClick={() =>
                          handleDeleteProduct(product.id)
                        }
                      >
                        Delete
                      </button>

                    </div>

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

            <div className="content-grid">

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

      {/* Add / Edit Product Modal */}
      {showProductModal && (

        <div
          className="modal-overlay"
          onClick={closeProductModal}
        >

          <div
            className="product-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>

                <p className="eyebrow">
                  INVENTORY
                </p>

                <h2>
                  {editingProductId !== null
                    ? "Edit Product"
                    : "Add Product"}
                </h2>

              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeProductModal}
              >
                ×
              </button>

            </div>

            <form onSubmit={handleProductSubmit}>

              <div className="form-group">

                <label>
                  Product Name
                </label>

                <input
                  type="text"
                  placeholder="e.g. Wireless Headphones"
                  value={productForm.name}
                  onChange={(event) =>
                    setProductForm({
                      ...productForm,
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
                  value={productForm.sku}
                  onChange={(event) =>
                    setProductForm({
                      ...productForm,
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
                  value={productForm.category}
                  onChange={(event) =>
                    setProductForm({
                      ...productForm,
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
                    value={productForm.stock}
                    onChange={(event) =>
                      setProductForm({
                        ...productForm,
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
                    value={productForm.reorderLevel}
                    onChange={(event) =>
                      setProductForm({
                        ...productForm,
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
                  onClick={closeProductModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="add-product-button"
                >
                  {editingProductId !== null
                    ? "Save Changes"
                    : "Add Product"}
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