import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminDashboard = () => {
  // Navigation taccker state
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedFile, setSelectedFile] = useState(null);
  // State Ledger Metrics
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  // Product Form Input States
  const [formData, setFormData] = useState({
  name: '',
  description: '',
  price: '',
  discount_price: '', // Match serializer field
  stock: '',
  category: '',       // Writeable integer ID mapping to 'category'
  brand: '',          // Match serializer field
  is_available: true  // Default checkbox state
  });

  // 1. Fetch live database products on component mount
  useEffect(() => {
    fetchCurrentInventory();
  }, []);

  const fetchCurrentInventory = async () => {
    setLoading(true);
    try {
      // Direct call to your standard products listing endpoint
      const response = await api.get('/products/');
      // Adapt based on whether your API returns a paginated envelope array or a raw array
      setProducts(response.data.results || response.data || []);
    } catch (err) {
      setError("Failed to synchronize active product inventory tables.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Input value changes dynamically
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 2. CREATE: Submit new product to staff management endpoint
const handleCreateProduct = async (e) => {
  e.preventDefault();
  setError(null);
  setSuccessMsg("");

  try {
    const payload = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
      stock: parseInt(formData.stock, 10),
      category: parseInt(formData.category, 10),
      brand: formData.brand,
      is_available: formData.is_available
    };

    // 1. Save core product metrics first
    const productResponse = await api.post('/custom-admin/products/', payload);
    const newProductId = productResponse.data.id;

    // 2. If a file is selected, upload it immediately to the attachment route
    if (selectedFile) {
      const imagePayload = new FormData();
      imagePayload.append('product', newProductId); // Links to the product ID foreign key
      imagePayload.append('image', selectedFile);     // Appends binary asset data packet
      imagePayload.append('is_feature', true);       // Sets default display flags

      await api.post('/custom-admin/products/upload-image/', imagePayload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }

    setSuccessMsg(`"${productResponse.data.name}" and its primary image asset have been successfully deployed live!`);
    
    // Clear inputs
    setFormData({ name: '', description: '', price: '', discount_price: '', stock: '', category: '', brand: '', is_available: true });
    setSelectedFile(null);
    document.getElementById('product-image-input').value = ""; // Clear file field element
    fetchCurrentInventory();
    
  } catch (err) {
    setError(err.response?.data?.error || "Error during multi-stage production provisioning cycle.");
  }
};
  // 3. DELETE: Drop a product instance row out of database registry by primary key ID
  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you absolutely sure you want to delete this product? This action is permanent.")) return;
    
    setError(null);
    setSuccessMsg("");

    try {
      await api.delete(`/custom-admin/products/${id}/`);
      setSuccessMsg("Product instance scrubbed from registry successfully.");
      fetchCurrentInventory();
    } catch (err) {
      setError("Authorization denied or server processing error on item deletion.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="border-b border-slate-200 pb-5 mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Administration Console</h1>
        <p className="text-sm text-slate-500 mt-1">Authorized staff context engine for platform configurations.</p>
      </div>

      {/* Action Notification Banners */}
      {error && <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 font-medium">&#9888; {error}</div>}
      {successMsg && <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-medium">✨ {successMsg}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: PRODUCT INVENTORY INPUT CREATION FORM CONTAINER */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Provision New Product</h2>
          <form onSubmit={handleCreateProduct} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Product Title</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-black placeholder:text-slate-500 focus:outline-indigo-600" required />
            </div>
            <div>
           <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Brand Name</label>
          <input type="text" name="brand" value={formData.brand} onChange={handleInputChange} className="w-full px-3 py-2  border border-slate-700 rounded-lg text-sm text-black placeholder:text-slate-500 focus:outline-none focus:border-indigo-500" required />
           </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" className="w-full px-3 py-2  border border-slate-200 rounded-lg text-sm text-black placeholder:text-slate-500 focus:outline-indigo-600" required></textarea>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Price (ETB)</label>
                <input type="number" name="price" value={formData.price} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-indigo-600" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Stock Vol</label>
                <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-indigo-600" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
            <div>
             <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Discount Price (ETB)</label>
               <input type="number" name="discount_price" value={formData.discount_price} onChange={handleInputChange} className="w-full px-3 py-2 bg-[#161f32] border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500" placeholder="Optional" />
                </div>
                <div className="flex items-center mt-6">
                <input type="checkbox" name="is_available" checked={formData.is_available} onChange={(e) => setFormData(prev => ({ ...prev, is_available: e.target.checked }))} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-700 rounded bg-[#161f32]" />
                 <label className="ml-2 block text-sm font-medium text-slate-300">Is Available for Sale</label>
                 </div>
                </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Category Code ID</label>
              <input type="number" name="category" value={formData.category} onChange={handleInputChange} placeholder="e.g. 1" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-indigo-600" required />
            </div>
            <div>
       <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Product Visual Image</label>
     <input 
      id="product-image-input"
      type="file" 
      accept="image/*"
       onChange={(e) => setSelectedFile(e.target.files[0])} 
       className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-950 file:text-indigo-300 hover:file:bg-indigo-900 cursor-pointer"
       />
           </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-2.5 px-4 rounded-lg shadow-sm transition">
              Commit Row to Live Storefront
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: ACTIVE MANAGEMENT INVENTORY GRID LEDGER */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Active Database Catalog</h2>
          {loading ? (
            <p className="text-sm text-slate-400 animate-pulse">Re-indexing database layout rows...</p>
          ) : products.length === 0 ? (
            <p className="text-sm text-slate-400">Database product catalog is currently blank.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="text-xs font-bold text-slate-400 bg-slate-50 uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Item ID</th>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {products.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-400">#{prod.id}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{prod.name}</td>
                      <td className="py-3.5 px-4">{parseFloat(prod.price).toLocaleString()} ETB</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${prod.stock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                          {prod.stock} units
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button onClick={() => handleDeleteProduct(prod.id)} className="text-xs bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold px-2.5 py-1.5 rounded-lg transition">
                          Scrub Row
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

