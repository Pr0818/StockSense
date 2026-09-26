import { useDeferredValue, useEffect, useState } from 'react'
import {
    AlertTriangle, ArrowDownToLine, ArrowLeftRight, ArrowRight, ArrowUpFromLine,
    Boxes, Check, ChevronDown, Clock3, FileClock, LayoutDashboard,
    LogOut, Menu, Package, PackageOpen, Pencil, Plus, RefreshCw, Search, Settings2,
    ShieldCheck, SlidersHorizontal, Trash2, Warehouse, X,
} from 'lucide-react'
import { api } from './api'
import AuthPage from './pages/AuthPage'
import './Workspace.css'

const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'WORKSPACE' },
    { id: 'products', label: 'Products', icon: Package, group: 'WORKSPACE' },
    { id: 'receipt', label: 'Receipts', icon: ArrowDownToLine, group: 'OPERATIONS', type: 'RECEIPT' },
    { id: 'delivery', label: 'Delivery orders', icon: ArrowUpFromLine, group: 'OPERATIONS', type: 'DELIVERY' },
    { id: 'transfer', label: 'Internal transfers', icon: ArrowLeftRight, group: 'OPERATIONS', type: 'INTERNAL' },
    { id: 'adjustment', label: 'Adjustments', icon: SlidersHorizontal, group: 'OPERATIONS', type: 'ADJUSTMENT' },
    { id: 'ledger', label: 'Move history', icon: FileClock, group: 'OPERATIONS' },
    { id: 'warehouses', label: 'Warehouses', icon: Warehouse, group: 'SYSTEM' },
]

const VIEW_TITLES = {
    dashboard: 'Dashboard', products: 'Products', receipt: 'Receipts', delivery: 'Delivery orders',
    transfer: 'Internal transfers', adjustment: 'Inventory adjustments', ledger: 'Move history',
    warehouses: 'Warehouses', profile: 'My profile',
}

function Workspace() {
    const [token, setToken] = useState(() => localStorage.getItem('stocksense.token'))
    const [user, setUser] = useState(null)
    const [booting, setBooting] = useState(Boolean(localStorage.getItem('stocksense.token')))
    const [view, setView] = useState('dashboard')
    const [selectedStore, setSelectedStore] = useState('')
    const [stores, setStores] = useState([])
    const [revision, setRevision] = useState(0)
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [toast, setToast] = useState('')

    useEffect(() => {
        if (!token) return
        let active = true
        api('/api/auth/me', { token })
            .then((profile) => { if (active) setUser(profile) })
            .catch(() => {
                localStorage.removeItem('stocksense.token')
                if (active) {
                    setToken(null)
                    setUser(null)
                }
            })
            .finally(() => { if (active) setBooting(false) })
        return () => { active = false }
    }, [token])

    useEffect(() => {
        if (!token) return
        let active = true
        api('/api/warehouses', { token })
            .then((result) => { if (active) setStores(result) })
            .catch((error) => showToast(error.message))
        return () => { active = false }
    }, [token, revision])

    useEffect(() => {
        if (!toast) return undefined
        const timeout = window.setTimeout(() => setToast(''), 3600)
        return () => window.clearTimeout(timeout)
    }, [toast])

    function handleAuthenticated(result) {
        localStorage.setItem('stocksense.token', result.token)
        setToken(result.token)
        setUser(result.user)
        setView('dashboard')
    }

    function signOut() {
        localStorage.removeItem('stocksense.token')
        setToken(null)
        setUser(null)
        setStores([])
        setView('dashboard')
    }

    function showToast(message) {
        setToast(message)
    }

    if (booting) return <div className="app-loading"><span className="spinner" /><span>Opening your workspace</span></div>
    if (!token || !user) return <AuthPage onAuthenticated={handleAuthenticated} />

    const role = user.role || 'EMPLOYEE'
    const isAdmin = role === 'ADMIN'
    const activeNav = NAV_ITEMS.find((item) => item.id === view)
    const pageTitle = VIEW_TITLES[view] || 'Dashboard'
    const currentType = activeNav?.type || ''

    return (
        <div className="app-shell">
            {sidebarOpen && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}
            <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
                <div className="sidebar-brand">
                    <span className="brand-mark"><PackageOpen size={19} /></span>
                    <span className="brand-name">stocksense</span>
                    <span className="brand-edition">IMS</span>
                </div>
                <div className="workspace-switcher">
                    <span className="workspace-avatar"><Boxes size={16} /></span>
                    <span className="workspace-name"><strong>Operations</strong><small>Inventory workspace</small></span>
                    <ChevronDown size={15} />
                </div>
                <nav className="primary-nav" aria-label="Primary navigation">
                    {['WORKSPACE', 'OPERATIONS', 'SYSTEM'].map((group) => (
                        <div className="nav-group" key={group}>
                            <p className="nav-label">{group}</p>
                            {NAV_ITEMS.filter((item) => item.group === group).map((item) => {
                                const Icon = item.icon
                                return (
                                    <button key={item.id} className={`nav-link ${view === item.id ? 'is-active' : ''}`} onClick={() => { setView(item.id); setSidebarOpen(false) }}>
                                        <Icon size={17} strokeWidth={1.8} /><span>{item.label}</span>
                                    </button>
                                )
                            })}
                        </div>
                    ))}
                </nav>
                <div className="sidebar-bottom">
                    <div className="sidebar-status"><span className="live-dot" /> API connected <span className="status-region">LOCAL</span></div>
                    <button className={`account-row ${view === 'profile' ? 'is-active' : ''}`} onClick={() => { setView('profile'); setSidebarOpen(false) }}>
                        <span className="user-avatar">{initials(user.userName)}</span>
                        <span className="account-copy"><strong>{user.userName}</strong><small>{roleLabel(role)}</small></span>
                        <ChevronDown size={15} />
                    </button>
                </div>
            </aside>

            <div className="main-column">
                <header className="topbar">
                    <button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setSidebarOpen(true)}><Menu size={19} /></button>
                    <div className="page-heading"><div className="breadcrumb">StockSense <span>/</span> {pageTitle}</div><h1>{pageTitle}</h1></div>
                    <div className="topbar-actions">
                        <label className="location-select" aria-label="Filter by warehouse">
                            <Warehouse size={16} />
                            <select value={selectedStore} onChange={(event) => setSelectedStore(event.target.value)}>
                                <option value="">All locations</option>
                                {stores.map((store) => <option key={store.storeId} value={store.storeId}>{store.storeName}</option>)}
                            </select>
                            <ChevronDown size={14} />
                        </label>
                        <button className="icon-button refresh-button" aria-label="Refresh data" title="Refresh data" onClick={() => setRevision((value) => value + 1)}><RefreshCw size={17} /></button>
                        <span className="topbar-divider" />
                        <button className="top-profile" onClick={() => setView('profile')} aria-label="Open profile">
                            <span className="user-avatar user-avatar-small">{initials(user.userName)}</span>
                            <span>{user.userName}</span>
                            <ChevronDown size={14} />
                        </button>
                    </div>
                </header>

                <main className="page-content" key={view}>
                    {view === 'dashboard' && <DashboardView token={token} storeId={selectedStore} revision={revision} onNavigate={setView} />}
                    {view === 'products' && <ProductsView token={token} stores={stores} storeId={selectedStore} isAdmin={isAdmin} revision={revision} onSaved={() => setRevision((value) => value + 1)} notify={showToast} />}
                    {['receipt', 'delivery', 'transfer', 'adjustment', 'ledger'].includes(view) && <OperationsView token={token} type={currentType} storeId={selectedStore} onSaved={() => setRevision((value) => value + 1)} notify={showToast} />}
                    {view === 'warehouses' && <WarehousesView token={token} stores={stores} isAdmin={isAdmin} onSaved={() => setRevision((value) => value + 1)} notify={showToast} />}
                    {view === 'profile' && <ProfileView user={user} onSignOut={signOut} />}
                </main>
                <footer className="app-footer"><span>STOCKSENSE / INVENTORY CONTROL</span><span>LIVE DATA · {new Date().toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' })}</span></footer>
            </div>
            {toast && <div className="toast-message" role="status"><AlertTriangle size={16} />{toast}<button className="icon-button" onClick={() => setToast('')} aria-label="Dismiss"><X size={15} /></button></div>}
        </div>
    )
}

function DashboardView({ token, storeId, revision, onNavigate }) {
    const [dashboard, setDashboard] = useState(null)
    const [stock, setStock] = useState([])
    const [type, setType] = useState('')
    const [status, setStatus] = useState('')
    const [category, setCategory] = useState('')
    const [categories, setCategories] = useState([])
    const [busy, setBusy] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let active = true
        const filters = new URLSearchParams()
        if (type) filters.set('type', type)
        if (status) filters.set('status', status)
        if (storeId) filters.set('storeId', storeId)
        if (category) filters.set('category', category)
        const suffix = filters.size ? `?${filters}` : ''
        const stockQuery = storeId ? `?storeId=${storeId}&lowStockOnly=true` : '?lowStockOnly=true'
        Promise.all([api(`/api/dashboard${suffix}`, { token }), api(`/api/stock${stockQuery}`, { token }), api('/api/products', { token })])
            .then(([summary, lowLevels, products]) => {
                if (!active) return
                setDashboard(summary)
                setStock(lowLevels)
                setCategories([...new Set(products.map((product) => product.itemCategory))].sort())
            })
            .catch((requestError) => { if (active) setError(requestError.message) })
            .finally(() => { if (active) setBusy(false) })
        return () => { active = false }
    }, [token, storeId, type, status, category, revision])

    return (
        <section className="view-stack">
            <div className="overview-strip">
                <div><p className="eyebrow">INVENTORY OVERVIEW</p><h2>Good work starts with a clear count.</h2><p className="muted">A live read on stock and the movements behind it.</p></div>
                <div className="overview-meta"><span className="live-dot" /> LIVE SNAPSHOT <span className="overview-date">{new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span></div>
            </div>
            <div className="filter-bar">
                <span className="filter-caption"><SlidersHorizontal size={15} /> FILTER VIEW</span>
                <select aria-label="Document type" value={type} onChange={(event) => setType(event.target.value)}><option value="">All documents</option><option value="RECEIPT">Receipts</option><option value="DELIVERY">Deliveries</option><option value="INTERNAL">Internal transfers</option><option value="ADJUSTMENT">Adjustments</option></select>
                <select aria-label="Operation status" value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option><option>DRAFT</option><option>WAITING</option><option>READY</option><option>DONE</option><option>CANCELED</option></select>
                <select aria-label="Product category" value={category} onChange={(event) => setCategory(event.target.value)}><option value="">All categories</option>{categories.map((name) => <option key={name}>{name}</option>)}</select>
            </div>
            {error && <ErrorBanner message={error} />}
            <div className="kpi-grid">
                <KpiCard label="Units on hand" value={dashboard?.totalProductsInStock ?? '—'} note="Across all tracked products" icon={Boxes} tone="green" />
                <KpiCard label="Products in stock" value={dashboard?.productCountInStock ?? '—'} note="Unique SKUs with availability" icon={Package} tone="blue" />
                <KpiCard label="Low / out of stock" value={dashboard ? `${dashboard.lowStockItems} / ${dashboard.outOfStockItems}` : '—'} note="At or below reorder level" icon={AlertTriangle} tone="amber" />
                <KpiCard label="Pending receipts" value={dashboard?.pendingReceipts ?? '—'} note="Waiting to be received" icon={ArrowDownToLine} tone="peach" />
                <KpiCard label="Pending deliveries" value={dashboard?.pendingDeliveries ?? '—'} note="Awaiting dispatch" icon={ArrowUpFromLine} tone="slate" />
                <KpiCard label="Transfers scheduled" value={dashboard?.internalTransfersScheduled ?? '—'} note="Waiting or ready to move" icon={ArrowLeftRight} tone="green" />
            </div>
            <div className="dashboard-grid">
                <section className="surface activity-surface">
                    <PanelHeading eyebrow="MOVEMENT LEDGER" title="Recent operations" action={<button className="text-action" onClick={() => onNavigate('ledger')}>Open history <ArrowRight size={15} /></button>} />
                    <OperationTable operations={dashboard?.operations || []} busy={busy} compact />
                </section>
                <section className="surface low-stock-surface">
                    <PanelHeading eyebrow="REORDER WATCH" title="Needs attention" action={<span className="count-pill">{stock.length}</span>} />
                    {busy ? <LoadingRows /> : stock.length ? <div className="attention-list">{stock.slice(0, 6).map((level) => <div className="attention-row" key={`${level.itemId}-${level.storeId}`}><span className="product-glyph"><Package size={16} /></span><span className="attention-copy"><strong>{level.itemName}</strong><small>{level.itemSku} · {level.storeName}</small></span><span className={`stock-quantity ${level.quantity === 0 ? 'is-zero' : ''}`}>{level.quantity} <small>{level.itemUnit} left</small></span></div>)}</div> : <EmptyState title="All stocked up" copy="No locations are at or below their reorder level." />}
                    {!!stock.length && <button className="subtle-link" onClick={() => onNavigate('products')}>Review all products <ArrowRight size={14} /></button>}
                </section>
            </div>
        </section>
    )
}

function ProductsView({ token, stores, storeId, isAdmin, revision, onSaved, notify }) {
    const [products, setProducts] = useState([])
    const [stock, setStock] = useState([])
    const [search, setSearch] = useState('')
    const [category, setCategory] = useState('')
    const [busy, setBusy] = useState(true)
    const [error, setError] = useState('')
    const [editing, setEditing] = useState(null)
    const deferredSearch = useDeferredValue(search)
    const categories = [...new Set(products.map((product) => product.itemCategory))].sort()

    useEffect(() => {
        let active = true
        const query = new URLSearchParams()
        if (deferredSearch.trim()) query.set('search', deferredSearch.trim())
        if (category) query.set('category', category)
        const stockPath = storeId ? `/api/stock?storeId=${storeId}` : '/api/stock'
        Promise.all([api(`/api/products${query.size ? `?${query}` : ''}`, { token }), api(stockPath, { token })])
            .then(([result, levels]) => { if (active) { setProducts(result); setStock(levels); setError('') } })
            .catch((requestError) => { if (active) setError(requestError.message) })
            .finally(() => { if (active) setBusy(false) })
        return () => { active = false }
    }, [token, deferredSearch, category, storeId, revision])

    async function deactivate(product) {
        if (!window.confirm(`Archive ${product.itemName}?`)) return
        try {
            await api(`/api/products/${product.itemId}`, { token, method: 'DELETE' })
            onSaved()
            notify('Product archived.')
        } catch (requestError) { notify(requestError.message) }
    }

    return (
        <section className="view-stack">
            <PageIntro eyebrow="CATALOG" title="Product register" copy="Search products, compare location balances, and keep reorder points current." action={isAdmin && <button className="button button-primary" onClick={() => setEditing({})}><Plus size={17} /> New product</button>} />
            {error && <ErrorBanner message={error} />}
            <section className="surface table-surface">
                <div className="table-toolbar">
                    <label className="search-box"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or SKU" aria-label="Search products" />{search && <button className="icon-button" onClick={() => setSearch('')} aria-label="Clear search"><X size={14} /></button>}</label>
                    <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter category"><option value="">Every category</option>{categories.map((name) => <option key={name}>{name}</option>)}</select>
                    <span className="table-count">{products.length} PRODUCTS</span>
                </div>
                <div className="table-scroll"><table><thead><tr><th>PRODUCT</th><th>SKU</th><th>CATEGORY</th><th>ON HAND</th><th>LOCATION STATUS</th>{isAdmin && <th aria-label="Actions" />}</tr></thead><tbody>
                    {busy ? <TableMessage columns={isAdmin ? 6 : 5} text="Loading product register…" /> : products.length === 0 ? <TableMessage columns={isAdmin ? 6 : 5} text="No products match this search." /> : products.map((product) => {
                        const levels = stock.filter((level) => level.itemId === product.itemId)
                        const critical = levels.some((level) => level.lowStock)
                        return <tr key={product.itemId}><td><div className="product-cell"><span className="product-glyph"><Package size={16} /></span><span><strong>{product.itemName}</strong><small>{product.itemUnit} · tracked</small></span></div></td><td className="mono-cell">{product.itemSku}</td><td>{product.itemCategory}</td><td><strong>{product.totalQuantity}</strong> <span className="muted">{product.itemUnit}</span></td><td><span className={`status-tag ${critical ? 'status-warning' : 'status-good'}`}><i />{critical ? 'Reorder' : 'Healthy'}</span></td>{isAdmin && <td className="row-actions"><button className="icon-button" title="Edit product" aria-label={`Edit ${product.itemName}`} onClick={() => setEditing(product)}><Pencil size={15} /></button><button className="icon-button danger-hover" title="Archive product" aria-label={`Archive ${product.itemName}`} onClick={() => deactivate(product)}><Trash2 size={15} /></button></td>}</tr>
                    })}
                </tbody></table></div>
            </section>
            <section className="surface stock-breakdown">
                <PanelHeading eyebrow="BY LOCATION" title="Stock availability" action={<span className="table-count">{stock.length} BALANCES</span>} />
                <div className="table-scroll"><table><thead><tr><th>PRODUCT</th><th>WAREHOUSE</th><th>AVAILABLE</th><th>REORDER AT</th><th>STATUS</th></tr></thead><tbody>{stock.length ? stock.map((level) => <tr key={`${level.itemId}-${level.storeId}`}><td><strong>{level.itemName}</strong><small className="table-subline">{level.itemSku}</small></td><td>{level.storeName}</td><td>{level.quantity} {level.itemUnit}</td><td>{level.minQuantity}</td><td><span className={`status-tag ${level.lowStock ? 'status-warning' : 'status-good'}`}><i />{level.quantity === 0 ? 'Out of stock' : level.lowStock ? 'Low stock' : 'Available'}</span></td></tr>) : <TableMessage columns={5} text="No stock balances recorded yet." />}</tbody></table></div>
            </section>
            {editing !== null && <ProductDialog product={editing.itemId ? editing : null} token={token} stores={stores} defaultStoreId={storeId} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); onSaved() }} notify={notify} />}
        </section>
    )
}

function ProductDialog({ product, token, stores, defaultStoreId, onClose, onSaved, notify }) {
    const [form, setForm] = useState({ itemName: product?.itemName || '', itemSku: product?.itemSku || '', itemCategory: product?.itemCategory || '', itemUnit: product?.itemUnit || 'units', initialStoreId: defaultStoreId || '', initialQuantity: '', reorderLevel: '' })
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')
    const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
    async function submit(event) {
        event.preventDefault()
        setBusy(true)
        setError('')
        const body = { itemName: form.itemName, itemSku: form.itemSku, itemCategory: form.itemCategory, itemUnit: form.itemUnit }
        if (form.initialStoreId) body.initialStoreId = Number(form.initialStoreId)
        if (!product && form.initialQuantity !== '') body.initialQuantity = Number(form.initialQuantity)
        if (form.reorderLevel !== '') body.reorderLevel = Number(form.reorderLevel)
        try {
            await api(product ? `/api/products/${product.itemId}` : '/api/products', { token, method: product ? 'PUT' : 'POST', body })
            onSaved()
            notify(product ? 'Product updated.' : 'Product created.')
        } catch (requestError) { setError(requestError.message) } finally { setBusy(false) }
    }
    return <Modal title={product ? 'Edit product' : 'Add product'} onClose={onClose}><form className="dialog-form" onSubmit={submit}>
        {error && <ErrorBanner message={error} />}
        <Field label="Product name" name="itemName" value={form.itemName} onChange={update} required />
        <div className="form-columns"><Field label="SKU / code" name="itemSku" value={form.itemSku} onChange={update} required /><Field label="Unit of measure" name="itemUnit" value={form.itemUnit} onChange={update} required /></div>
        <Field label="Category" name="itemCategory" value={form.itemCategory} onChange={update} placeholder="e.g. Raw materials" required />
        <div className="form-columns"><SelectField label={product ? 'Reorder location' : 'Initial location'} name="initialStoreId" value={form.initialStoreId} onChange={update} options={stores.map((store) => [store.storeId, store.storeName])} placeholder="Choose location" /><Field label={product ? 'New reorder level' : 'Reorder level'} name="reorderLevel" type="number" min="0" value={form.reorderLevel} onChange={update} placeholder="0" /></div>
        {!product && <Field label="Initial quantity (optional)" name="initialQuantity" type="number" min="0" value={form.initialQuantity} onChange={update} placeholder="0" />}
        <div className="dialog-actions"><button type="button" className="button button-quiet" onClick={onClose}>Cancel</button><button className="button button-primary" disabled={busy}>{busy ? 'Saving…' : product ? 'Save changes' : 'Create product'}</button></div>
    </form></Modal>
}

function OperationsView({ token, type, storeId, onSaved, notify }) {
    const [operations, setOperations] = useState([])
    const [products, setProducts] = useState([])
    const [stores, setStores] = useState([])
    const [status, setStatus] = useState('')
    const [busy, setBusy] = useState(true)
    const [error, setError] = useState('')
    const [creating, setCreating] = useState(false)
    const [selectedType, setSelectedType] = useState(type)
    const isLedger = !type

    useEffect(() => {
        let active = true
        const query = new URLSearchParams()
        if (selectedType) query.set('type', selectedType)
        if (status) query.set('status', status)
        if (storeId) query.set('storeId', storeId)
        Promise.all([
            api(`/api/operations${query.size ? `?${query}` : ''}`, { token }),
            api('/api/products', { token }),
            api('/api/warehouses', { token }),
        ]).then(([result, productList, warehouseList]) => {
            if (active) { setOperations(result); setProducts(productList); setStores(warehouseList); setError('') }
        }).catch((requestError) => { if (active) setError(requestError.message) }).finally(() => { if (active) setBusy(false) })
        return () => { active = false }
    }, [token, selectedType, status, storeId, onSaved])

    async function progress(operation, nextStatus) {
        try {
            await api(`/api/operations/${operation.stockOperationId}/status`, { token, method: 'PATCH', body: { status: nextStatus } })
            onSaved()
            notify(nextStatus === 'DONE' ? 'Stock movement validated and posted.' : `Operation moved to ${nextStatus.toLowerCase()}.`)
        } catch (requestError) { notify(requestError.message) }
    }

    return (
        <section className="view-stack">
            <PageIntro eyebrow={isLedger ? 'AUDIT TRAIL' : 'STOCK MOVEMENT'} title={isLedger ? 'Movement history' : operationLabel(selectedType)} copy={isLedger ? 'A searchable record of every operation and validated stock change.' : 'Create a document, progress it through review, then validate to post the stock change.'} action={<button className="button button-primary" onClick={() => setCreating(true)}><Plus size={17} /> New {isLedger ? 'operation' : shortOperationLabel(selectedType).toLowerCase()}</button>} />
            {error && <ErrorBanner message={error} />}
            <section className="surface table-surface">
                <div className="table-toolbar">
                    <div className="toolbar-selects">
                        {isLedger && <SelectField label="Document type" value={selectedType} onChange={(event) => setSelectedType(event.target.value)} options={[["", 'All document types'], ['RECEIPT', 'Receipts'], ['DELIVERY', 'Deliveries'], ['INTERNAL', 'Internal transfers'], ['ADJUSTMENT', 'Adjustments']]} />}
                        <SelectField label="Status" value={status} onChange={(event) => setStatus(event.target.value)} options={[["", 'All statuses'], ['DRAFT', 'Draft'], ['WAITING', 'Waiting'], ['READY', 'Ready'], ['DONE', 'Done'], ['CANCELED', 'Canceled']]} />
                    </div>
                    <span className="table-count">{operations.length} DOCUMENTS</span>
                </div>
                <OperationTable operations={operations} busy={busy} onProgress={progress} showActions />
            </section>
            {creating && <OperationDialog token={token} products={products} stores={stores} defaultType={selectedType || 'RECEIPT'} onClose={() => setCreating(false)} onSaved={() => { setCreating(false); onSaved() }} notify={notify} />}
        </section>
    )
}

function OperationDialog({ token, products, stores, defaultType, onClose, onSaved, notify }) {
    const [form, setForm] = useState({ operationType: defaultType, itemId: '', sourceStoreId: '', destinationStoreId: '', quantity: '', countedQuantity: '', counterparty: '', note: '' })
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')
    const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
    const needsSource = ['DELIVERY', 'INTERNAL', 'ADJUSTMENT'].includes(form.operationType)
    const needsDestination = ['RECEIPT', 'INTERNAL'].includes(form.operationType)
    async function submit(event) {
        event.preventDefault()
        setBusy(true)
        setError('')
        const body = { operationType: form.operationType, itemId: Number(form.itemId), note: form.note, counterparty: form.counterparty }
        if (needsSource) body.sourceStoreId = Number(form.sourceStoreId)
        if (needsDestination) body.destinationStoreId = Number(form.destinationStoreId)
        if (form.operationType === 'ADJUSTMENT') body.countedQuantity = Number(form.countedQuantity)
        else body.quantity = Number(form.quantity)
        try {
            await api('/api/operations', { token, method: 'POST', body })
            onSaved()
            notify('Draft operation created.')
        } catch (requestError) { setError(requestError.message) } finally { setBusy(false) }
    }
    return <Modal title={`New ${shortOperationLabel(form.operationType).toLowerCase()}`} onClose={onClose}><form className="dialog-form" onSubmit={submit}>
        {error && <ErrorBanner message={error} />}
        <SelectField label="Document type" name="operationType" value={form.operationType} onChange={update} options={[["RECEIPT", 'Receipt'], ['DELIVERY', 'Delivery order'], ['INTERNAL', 'Internal transfer'], ['ADJUSTMENT', 'Inventory adjustment']]} />
        <SelectField label="Product" name="itemId" value={form.itemId} onChange={update} options={products.map((product) => [product.itemId, `${product.itemName} · ${product.itemSku}`])} placeholder="Choose product" required />
        <div className="form-columns">
            {needsSource && <SelectField label={form.operationType === 'ADJUSTMENT' ? 'Location to count' : 'From location'} name="sourceStoreId" value={form.sourceStoreId} onChange={update} options={stores.map((store) => [store.storeId, store.storeName])} placeholder="Choose location" required />}
            {needsDestination && <SelectField label={form.operationType === 'RECEIPT' ? 'Receive into' : 'To location'} name="destinationStoreId" value={form.destinationStoreId} onChange={update} options={stores.map((store) => [store.storeId, store.storeName])} placeholder="Choose location" required />}
        </div>
        <Field label={form.operationType === 'ADJUSTMENT' ? 'Physically counted quantity' : 'Quantity'} name={form.operationType === 'ADJUSTMENT' ? 'countedQuantity' : 'quantity'} type="number" min="0" value={form.operationType === 'ADJUSTMENT' ? form.countedQuantity : form.quantity} onChange={update} required />
        {(form.operationType === 'RECEIPT' || form.operationType === 'DELIVERY') && <Field label={form.operationType === 'RECEIPT' ? 'Supplier' : 'Customer / reference'} name="counterparty" value={form.counterparty} onChange={update} placeholder="Optional" />}
        <Field label="Note" name="note" value={form.note} onChange={update} placeholder="Optional operation note" />
        <p className="dialog-hint"><Clock3 size={14} /> This document starts as a draft. Stock changes only after validation.</p>
        <div className="dialog-actions"><button type="button" className="button button-quiet" onClick={onClose}>Cancel</button><button className="button button-primary" disabled={busy}>{busy ? 'Creating…' : 'Create draft'}</button></div>
    </form></Modal>
}

function WarehousesView({ token, stores, isAdmin, onSaved, notify }) {
    const [editing, setEditing] = useState(null)
    return <section className="view-stack">
        <PageIntro eyebrow="LOCATIONS" title="Warehouse settings" copy="Manage the warehouses and internal locations that hold your inventory." action={isAdmin && <button className="button button-primary" onClick={() => setEditing({})}><Plus size={17} /> Add location</button>} />
        <div className="warehouse-grid">{stores.map((store, index) => <article className="surface warehouse-card" key={store.storeId}><div className={`warehouse-card-icon warehouse-tone-${index % 3}`}><Warehouse size={20} /></div><div className="warehouse-card-top"><span className="status-tag status-good"><i /> Active</span>{isAdmin && <button className="icon-button" aria-label={`Edit ${store.storeName}`} onClick={() => setEditing(store)}><Pencil size={15} /></button>}</div><h3>{store.storeName}</h3><p>{store.storeType}</p><div className="warehouse-card-foot"><span><Settings2 size={14} /> Location ID</span><code>{String(store.storeId).padStart(3, '0')}</code></div></article>)}
            {!stores.length && <div className="surface empty-warehouse"><Warehouse size={24} /><strong>No locations yet</strong><span>Create a warehouse before receiving stock.</span>{isAdmin && <button className="button button-primary" onClick={() => setEditing({})}><Plus size={16} /> Add location</button>}</div>}
        </div>
        {!isAdmin && <div className="permission-note"><ShieldCheck size={16} /> Warehouse changes are restricted to administrators.</div>}
        {editing !== null && <StoreDialog token={token} store={editing.storeId ? editing : null} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); onSaved() }} notify={notify} />}
    </section>
}

function StoreDialog({ token, store, onClose, onSaved, notify }) {
    const [name, setName] = useState(store?.storeName || '')
    const [kind, setKind] = useState(store?.storeType || 'WAREHOUSE')
    const [error, setError] = useState('')
    const [busy, setBusy] = useState(false)
    async function submit(event) {
        event.preventDefault()
        setBusy(true)
        setError('')
        try {
            await api(store ? `/api/warehouses/${store.storeId}` : '/api/warehouses', {
                token, method: store ? 'PUT' : 'POST', body: { storeName: name, storeType: kind },
            })
            onSaved()
            notify(store ? 'Location updated.' : 'Location added.')
        } catch (requestError) { setError(requestError.message) } finally { setBusy(false) }
    }
    return <Modal title={store ? 'Edit location' : 'Add warehouse'} onClose={onClose}><form className="dialog-form" onSubmit={submit}>
        {error && <ErrorBanner message={error} />}
        <Field label="Location name" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Main warehouse" required />
        <SelectField label="Location type" value={kind} onChange={(event) => setKind(event.target.value)} options={[["WAREHOUSE", 'Warehouse'], ['INTERNAL', 'Internal location'], ['PRODUCTION', 'Production floor'], ['STORAGE', 'Storage area']]} />
        <div className="dialog-actions"><button type="button" className="button button-quiet" onClick={onClose}>Cancel</button><button className="button button-primary" disabled={busy}>{busy ? 'Saving…' : store ? 'Save location' : 'Create location'}</button></div>
    </form></Modal>
}

function ProfileView({ user, onSignOut }) {
    return <section className="view-stack">
        <PageIntro eyebrow="ACCOUNT" title="My profile" copy="Your StockSense workspace identity and access." />
        <section className="surface profile-card"><div className="profile-avatar">{initials(user.userName)}</div><div className="profile-details"><span className="eyebrow">WORKSPACE MEMBER</span><h2>{user.userName}</h2><p>{user.email}</p></div><span className={`role-chip ${user.role === 'ADMIN' ? 'role-admin' : ''}`}><ShieldCheck size={14} />{roleLabel(user.role)}</span></section>
        <section className="surface profile-access"><div><span className="eyebrow">ACCESS LEVEL</span><h3>{user.role === 'ADMIN' ? 'Administrator access' : 'Warehouse staff access'}</h3><p>{user.role === 'ADMIN' ? 'You can manage the catalog, warehouses, and all stock operations.' : 'You can create and progress stock operations. Catalog and warehouse changes are reserved for administrators.'}</p></div><button className="button button-danger-quiet" onClick={onSignOut}><LogOut size={16} /> Sign out</button></section>
    </section>
}

function OperationTable({ operations, busy, compact = false, showActions = false, onProgress }) {
    if (busy) return <div className="table-loading"><LoadingRows /></div>
    if (!operations.length) return <EmptyState title="No operations to show" copy="New receipts, deliveries, transfers, and counts will appear here." />
    return <div className="table-scroll"><table className={compact ? 'compact-table' : ''}><thead><tr><th>REFERENCE</th><th>TYPE</th><th>PRODUCT</th><th>LOCATION</th><th>QUANTITY</th><th>STATUS</th>{showActions && <th />}</tr></thead><tbody>{operations.map((operation) => {
        const next = operation.status === 'DRAFT' ? 'WAITING' : operation.status === 'WAITING' ? 'READY' : operation.status === 'READY' ? 'DONE' : null
        const location = operation.operationType === 'RECEIPT' ? operation.destinationStoreName : operation.operationType === 'DELIVERY' || operation.operationType === 'ADJUSTMENT' ? operation.sourceStoreName : `${operation.sourceStoreName || '—'} → ${operation.destinationStoreName || '—'}`
        return <tr key={operation.stockOperationId}><td><strong className="reference">MOV-{String(operation.stockOperationId).padStart(5, '0')}</strong><small className="table-subline">{formatDate(operation.createdAt)}</small></td><td><span className={`operation-kind kind-${operation.operationType.toLowerCase()}`}>{shortOperationLabel(operation.operationType)}</span></td><td><strong>{operation.itemName}</strong><small className="table-subline">{operation.itemSku}</small></td><td className="location-cell">{location || '—'}</td><td><strong>{operation.operationType === 'ADJUSTMENT' ? signed(operation.quantity) : operation.quantity}</strong></td><td><StatusTag status={operation.status} /></td>{showActions && <td className="row-actions">{next && <button className="button button-small" onClick={() => onProgress(operation, next)}>{next === 'DONE' ? <><Check size={14} /> Validate</> : `Mark ${next.toLowerCase()}`}</button>}{next && operation.status !== 'READY' && <button className="icon-button" title="Cancel operation" aria-label="Cancel operation" onClick={() => onProgress(operation, 'CANCELED')}><X size={15} /></button>}</td>}</tr>
    })}</tbody></table></div>
}

function Modal({ title, onClose, children }) {
    useEffect(() => {
        function escape(event) { if (event.key === 'Escape') onClose() }
        window.addEventListener('keydown', escape)
        return () => window.removeEventListener('keydown', escape)
    }, [onClose])
    return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="modal-panel" role="dialog" aria-modal="true" aria-label={title}><header className="modal-header"><div><span className="eyebrow">STOCKSENSE / WORKSPACE</span><h2>{title}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close dialog"><X size={18} /></button></header>{children}</section></div>
}

function Field({ label, name, value, onChange, type = 'text', ...props }) {
    return <div className="field-wrap"><label htmlFor={name}>{label}</label><input id={name} name={name} type={type} value={value} onChange={onChange} {...props} /></div>
}

function SelectField({ label, name, value, onChange, options, placeholder }) {
    return <div className="field-wrap"><label htmlFor={name || label}>{label}</label><select id={name || label} name={name} value={value} onChange={onChange} required={placeholder === 'Choose location' || placeholder === 'Choose product'}><option value="">{placeholder || 'All'}</option>{options.map(([key, text]) => <option key={key || 'all'} value={key}>{text}</option>)}</select></div>
}

function PageIntro({ eyebrow, title, copy, action }) {
    return <div className="page-intro"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2><p>{copy}</p></div>{action}</div>
}

function PanelHeading({ eyebrow, title, action }) {
    return <header className="panel-heading"><div><p className="eyebrow">{eyebrow}</p><h3>{title}</h3></div>{action}</header>
}

function KpiCard({ label, value, note, icon: Icon, tone }) {
    return <article className="kpi-card"><div className={`kpi-icon tone-${tone}`}><Icon size={18} strokeWidth={1.8} /></div><span className="kpi-label">{label}</span><strong className="kpi-value">{value}</strong><span className="kpi-note">{note}</span></article>
}

function StatusTag({ status }) {
    const normalized = (status || '').toLowerCase()
    return <span className={`status-tag status-${normalized}`}><i />{status?.toLowerCase()}</span>
}

function ErrorBanner({ message }) { return <div className="error-banner" role="alert"><AlertTriangle size={16} /><span>{message}</span></div> }
function EmptyState({ title, copy }) { return <div className="empty-state"><span className="empty-icon"><PackageOpen size={20} /></span><strong>{title}</strong><p>{copy}</p></div> }
function LoadingRows() { return <div className="loading-rows"><span /><span /><span /></div> }
function TableMessage({ columns, text }) { return <tr><td colSpan={columns} className="table-message">{text}</td></tr> }

function initials(name = '') { return name.split(/[\s._-]+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'S' }
function roleLabel(role) { return role === 'ADMIN' ? 'Administrator' : 'Warehouse staff' }
function operationLabel(type) { return ({ RECEIPT: 'Receipts', DELIVERY: 'Delivery orders', INTERNAL: 'Internal transfers', ADJUSTMENT: 'Inventory adjustments' })[type] || 'Operations' }
function shortOperationLabel(type) { return ({ RECEIPT: 'Receipt', DELIVERY: 'Delivery', INTERNAL: 'Transfer', ADJUSTMENT: 'Adjustment' })[type] || 'Operation' }
function signed(value) { const quantity = Number(value || 0); return quantity > 0 ? `+${quantity}` : String(quantity) }
function formatDate(value) { return value ? new Date(value).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—' }

export default Workspace