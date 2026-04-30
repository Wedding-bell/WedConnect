import { useEffect, useState } from "react";
import { getCategories, createCategory, deleteCategory } from "../../api/adminVendors";
import type { Category } from "../../types";
import { Plus, Search, Layers, X, Trash2, Tag, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

export function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setCreating(true);
    setError("");
    try {
      await createCategory({ name: newCategoryName.trim() });
      setNewCategoryName("");
      setIsModalOpen(false);
      fetchCategories(); // Refresh the list
    } catch (err: any) {
      setError(err?.response?.data?.name?.[0] || "Failed to create category. It might already exist.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this category?")) {
      try {
        await deleteCategory(id);
        fetchCategories();
      } catch (err) {
        console.error(err);
        alert("Failed to delete category.");
      }
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20 lg:pb-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-zinc-50 rounded-xl">
            <Layers className="w-6 h-6 text-zinc-900" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">Categories</h2>
            <p className="text-sm text-zinc-500 mt-1">Manage service categories for vendors.</p>
          </div>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-zinc-900 hover:bg-zinc-800 text-white px-5 py-2.5 flex items-center justify-center space-x-2 w-full sm:w-auto rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
        >
          <Plus className="w-5 h-5" />
          <span className="font-semibold">New Category</span>
        </Button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-2 sm:p-2 rounded-2xl border border-zinc-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <Input 
            type="text" 
            placeholder="Search categories..." 
            className="pl-12 bg-transparent border-none focus-visible:ring-0 shadow-none h-12 text-base w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Grid Area */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm animate-pulse h-32 flex flex-col justify-between">
              <div className="h-6 bg-zinc-100 rounded-md w-1/2"></div>
              <div className="h-4 bg-zinc-50 rounded-md w-1/3"></div>
            </div>
          ))}
        </div>
      ) : filteredCategories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCategories.map((category) => (
            <div 
              key={category.id} 
              className="group bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md transition-all hover:border-zinc-200 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleDelete(category.id)}
                  className="text-zinc-400 hover:text-red-600 p-1.5 rounded-full hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-zinc-50 text-zinc-600 rounded-lg group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                  <Tag className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-lg text-zinc-900">{category.name}</h3>
              </div>
              
              <div className="flex items-center text-xs font-medium text-zinc-500 mt-4">
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-1.5" />
                Active Category
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-3xl border border-zinc-100 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
            <Layers className="w-8 h-8 text-zinc-300" />
          </div>
          <h3 className="text-xl font-semibold text-zinc-900 mb-2">No categories found</h3>
          <p className="text-zinc-500 max-w-sm mb-6">
            {searchQuery ? "We couldn't find any categories matching your search." : "Get started by creating your first service category."}
          </p>
          {!searchQuery && (
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 px-6 py-2 rounded-xl"
            >
              Create Category
            </Button>
          )}
        </div>
      )}

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
              <h3 className="font-semibold text-lg text-zinc-900">Create New Category</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 p-2 rounded-full hover:bg-zinc-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateCategory} className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl font-medium border border-red-100">
                  {error}
                </div>
              )}
              
              <div className="space-y-2 mb-8">
                <label className="text-sm font-semibold text-zinc-700 ml-1">
                  Category Name
                </label>
                <Input
                  autoFocus
                  placeholder="e.g. Photography, Catering..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="h-12 bg-zinc-50 border-zinc-200 rounded-xl focus-visible:ring-zinc-900 focus-visible:border-zinc-900"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 h-12 rounded-xl"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={creating || !newCategoryName.trim()}
                  className="flex-1 bg-zinc-900 text-white hover:bg-zinc-800 h-12 rounded-xl font-semibold"
                >
                  {creating ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Creating...</>
                  ) : "Create Category"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
