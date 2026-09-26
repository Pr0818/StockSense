import React, { useState } from 'react'
import { ArrowLeft, PackagePlus, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { createProduct } from '../services/productService'

const initialForm = {
  name: '',
  category: '',
  sku: '',
  quantity: '',
  minQuantity: '',
  unit: 'PIECE',
}

function AddProduct() {
  const [formData, setFormData] = useState(initialForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsSubmitting(true)

    try {
      const payload = {
        ...formData,
        quantity: Number(formData.quantity),
        minQuantity: Number(formData.minQuantity),
        shop: JSON.parse(localStorage.getItem('activeShop') || 'null'),
      }

      await createProduct(payload)

      setSuccess('Product created successfully')
      setFormData(initialForm)

    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create product')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">

      <div className="mx-auto max-w-5xl rounded-3xl bg-white shadow-xl ring-1 ring-slate-200">

        {/* Header */}
        <div className="border-b border-slate-200 px-6 py-6 md:px-10">

          <button
            onClick={() => navigate(-1)}
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-sky-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

            <div>

              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-600">
                Add Product
              </p>

              <h1 className="text-3xl font-bold text-slate-900">
                Create a new product entry
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Add product details and initial stock information.
              </p>

            </div>

            <div className="rounded-2xl bg-sky-100 p-4 text-sky-700">
              <PackagePlus className="h-8 w-8" />
            </div>

          </div>

        </div>


        <form
          onSubmit={handleSubmit}
          className="grid gap-8 px-6 py-8 md:grid-cols-[1.1fr_0.9fr] md:px-10"
        >

          <div className="space-y-4">

            <div className="grid gap-4 md:grid-cols-2">

              <label className="space-y-2 text-sm font-medium text-slate-700">

                <span>Product Name</span>

                <input
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
                />

              </label>


              <label className="space-y-2 text-sm font-medium text-slate-700">

                <span>Category</span>

                <input
                  required
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="Enter category"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
                />

              </label>

            </div>


            <div className="grid gap-4 md:grid-cols-2">

              <label className="space-y-2 text-sm font-medium text-slate-700">

                <span>SKU</span>

                <input
                  required
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="Enter SKU / Product Code"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
                />

              </label>


              <label className="space-y-2 text-sm font-medium text-slate-700">

                <span>Unit</span>

                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
                >

                  <option value="PIECE">Piece</option>
                  <option value="KG">Kg</option>
                  <option value="GRAM">Gram</option>
                  <option value="LITER">Liter</option>
                  <option value="ML">Ml</option>
                  <option value="PACKET">Packet</option>
                  <option value="BOX">Box</option>

                </select>

              </label>

            </div>

          </div>


          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">

              <Sparkles className="h-4 w-4 text-sky-600" />

              Stock Information

            </div>


            <div className="mt-4 space-y-4">


              <label className="space-y-2 text-sm font-medium text-slate-700">

                <span>Initial Quantity</span>

                <input
                  required
                  type="number"
                  min="0"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="Enter initial quantity"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5"
                />

              </label>


              <label className="space-y-2 text-sm font-medium text-slate-700">

                <span>Minimum Quantity</span>

                <input
                  required
                  type="number"
                  min="0"
                  name="minQuantity"
                  value={formData.minQuantity}
                  onChange={handleChange}
                  placeholder="Enter minimum stock level"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5"
                />

              </label>


              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                  {error}
                </div>
              )}


              {success && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-600">
                  {success}
                </div>
              )}


              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-sky-600 px-4 py-3 font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? 'Creating product...'
                  : 'Create Product'}
              </button>

            </div>

          </div>

        </form>

      </div>

    </div>
  )
}

export default AddProduct

