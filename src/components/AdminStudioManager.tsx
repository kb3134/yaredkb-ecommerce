import React, { useState } from 'react';
import { StudioImage, StudioCategory, Product } from '../types';
import { 
  Plus, Edit, Trash2, Search, Eye, EyeOff, Sparkles, FolderPlus, 
  ArrowUp, ArrowDown, Image as ImageIcon, X, Check, Save, RefreshCw, Tag, Layers
} from 'lucide-react';

interface AdminStudioManagerProps {
  studioImages: StudioImage[];
  studioCategories: StudioCategory[];
  products?: Product[];
  onAddImage: (imgData: Omit<StudioImage, 'id' | 'createdAt'>) => Promise<boolean>;
  onEditImage: (id: string, imgData: Partial<StudioImage>) => Promise<boolean>;
  onDeleteImage: (id: string) => Promise<boolean>;
  onAddCategory: (catData: { name: string; description?: string }) => Promise<boolean>;
  onEditCategory: (id: string, catData: { name: string; description?: string }) => Promise<boolean>;
  onDeleteCategory: (id: string) => Promise<boolean>;
  onReorderImages?: (items: { id: string; orderIndex: number }[]) => Promise<boolean>;
  addToast: (title: string, description?: string) => void;
}

export const AdminStudioManager: React.FC<AdminStudioManagerProps> = ({
  studioImages,
  studioCategories,
  products = [],
  onAddImage,
  onEditImage,
  onDeleteImage,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onReorderImages,
  addToast
}) => {
  // Admin Sub-tab: 'images' or 'categories'
  const [activeSubTab, setActiveSubTab] = useState<'images' | 'categories'>('images');

  // Search & Category Filter for Admin Images List
  const [adminSearch, setAdminSearch] = useState<string>('');
  const [adminCategoryFilter, setAdminCategoryFilter] = useState<string>('all');

  // Image Modal State (Add / Edit)
  const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false);
  const [editingImageId, setEditingImageId] = useState<string | null>(null);

  // Form Fields for Studio Image
  const [formTitle, setFormTitle] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formImageUrl, setFormImageUrl] = useState<string>('');
  const [formCategories, setFormCategories] = useState<string[]>([]);
  const [formTags, setFormTags] = useState<string>('');
  const [formIsFeatured, setFormIsFeatured] = useState<boolean>(false);
  const [formIsHidden, setFormIsHidden] = useState<boolean>(false);
  const [formOrderIndex, setFormOrderIndex] = useState<number>(1);
  const [formProductIds, setFormProductIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Category Modal State (Add / Edit Category)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [catFormName, setCatFormName] = useState<string>('');
  const [catFormDesc, setCatFormDesc] = useState<string>('');

  // Delete Confirm Modal
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);

  // Open Modal to Add Image
  const handleOpenAddImageModal = () => {
    setEditingImageId(null);
    setFormTitle('');
    setFormDescription('');
    setFormImageUrl('');
    setFormCategories(studioCategories.length > 0 ? [studioCategories[0].slug] : ['traditional-dresses']);
    setFormTags('');
    setFormIsFeatured(false);
    setFormIsHidden(false);
    setFormOrderIndex(studioImages.length + 1);
    setFormProductIds([]);
    setIsImageModalOpen(true);
  };

  // Open Modal to Edit Image
  const handleOpenEditImageModal = (img: StudioImage) => {
    setEditingImageId(img.id);
    setFormTitle(img.title);
    setFormDescription(img.description || '');
    setFormImageUrl(img.imageUrl);
    setFormCategories(img.categories || []);
    setFormTags((img.tags || []).join(', '));
    setFormIsFeatured(img.isFeatured);
    setFormIsHidden(img.isHidden);
    setFormOrderIndex(img.orderIndex || 1);
    setFormProductIds(img.productIds || []);
    setIsImageModalOpen(true);
  };

  // Submit Image Form
  const handleSaveImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      addToast('Validation Error', 'Please enter a title for the Studio image.');
      return;
    }
    if (!formImageUrl.trim()) {
      addToast('Validation Error', 'Please enter an Image URL or upload an image file.');
      return;
    }
    if (formCategories.length === 0) {
      addToast('Validation Error', 'Please select at least one category.');
      return;
    }

    setIsSubmitting(true);
    const parsedTags = formTags.split(',').map(s => s.trim().replace(/^#/, '')).filter(Boolean);

    try {
      if (editingImageId) {
        // Edit existing image
        const success = await onEditImage(editingImageId, {
          title: formTitle,
          description: formDescription,
          imageUrl: formImageUrl,
          categories: formCategories,
          tags: parsedTags,
          isFeatured: formIsFeatured,
          isHidden: formIsHidden,
          orderIndex: formOrderIndex,
          productIds: formProductIds
        });
        if (success) {
          addToast('Image Updated', `Updated "${formTitle}" successfully.`);
          setIsImageModalOpen(false);
        }
      } else {
        // Add new image
        const success = await onAddImage({
          title: formTitle,
          description: formDescription,
          imageUrl: formImageUrl,
          categories: formCategories,
          tags: parsedTags,
          isFeatured: formIsFeatured,
          isHidden: formIsHidden,
          orderIndex: formOrderIndex,
          productIds: formProductIds
        });
        if (success) {
          addToast('Image Created', `Added "${formTitle}" to Studio.`);
          setIsImageModalOpen(false);
        }
      }
    } catch (err) {
      addToast('Save Failed', 'Failed to save Studio image. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // File Upload Handler (Simulated or Local Data URL conversion)
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormImageUrl(event.target.result as string);
          addToast('Image Uploaded', 'Local image file loaded into form preview.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Toggle Category Selection in Form
  const handleToggleFormCategory = (slug: string) => {
    setFormCategories(prev => {
      if (prev.includes(slug)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter(c => c !== slug);
      } else {
        return [...prev, slug];
      }
    });
  };

  // Handle Image Order Change
  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= filteredAdminImages.length) return;

    const currentImg = filteredAdminImages[index];
    const targetImg = filteredAdminImages[targetIndex];

    const newCurrentOrder = targetImg.orderIndex || targetIndex + 1;
    const newTargetOrder = currentImg.orderIndex || index + 1;

    await onEditImage(currentImg.id, { orderIndex: newCurrentOrder });
    await onEditImage(targetImg.id, { orderIndex: newTargetOrder });

    if (onReorderImages) {
      onReorderImages([
        { id: currentImg.id, orderIndex: newCurrentOrder },
        { id: targetImg.id, orderIndex: newTargetOrder }
      ]);
    }

    addToast('Order Updated', 'Studio order updated.');
  };

  // Open Category Modal
  const handleOpenAddCategoryModal = () => {
    setEditingCategoryId(null);
    setCatFormName('');
    setCatFormDesc('');
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategoryModal = (cat: StudioCategory) => {
    setEditingCategoryId(cat.id);
    setCatFormName(cat.name);
    setCatFormDesc(cat.description || '');
    setIsCategoryModalOpen(true);
  };

  // Submit Category Form
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catFormName.trim()) {
      addToast('Validation Error', 'Category name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCategoryId) {
        const success = await onEditCategory(editingCategoryId, { name: catFormName, description: catFormDesc });
        if (success) {
          addToast('Category Updated', `Updated "${catFormName}".`);
          setIsCategoryModalOpen(false);
        }
      } else {
        const success = await onAddCategory({ name: catFormName, description: catFormDesc });
        if (success) {
          addToast('Category Created', `Created Studio category "${catFormName}".`);
          setIsCategoryModalOpen(false);
        }
      }
    } catch (err) {
      addToast('Error', 'Failed to save category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter Admin Images List
  const filteredAdminImages = studioImages.filter(img => {
    // Search query matching
    if (adminSearch.trim()) {
      const q = adminSearch.toLowerCase().trim();
      const matchTitle = img.title.toLowerCase().includes(q);
      const matchDesc = (img.description || '').toLowerCase().includes(q);
      const matchCats = (img.categories || []).some(c => c.toLowerCase().includes(q));
      const matchTags = (img.tags || []).some(t => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchCats && !matchTags) return false;
    }

    // Category filter matching
    if (adminCategoryFilter !== 'all') {
      const target = adminCategoryFilter.toLowerCase().replace(/['’\s-]/g, '');
      const matchCat = (img.categories || []).some(c => {
        const norm = c.toLowerCase().replace(/['’\s-]/g, '');
        return norm === target || norm.includes(target) || target.includes(norm);
      });
      if (!matchCat) return false;
    }

    return true;
  }).sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

  return (
    <div className="space-y-6">
      
      {/* Studio Header Banner */}
      <div className="bg-[#181310] text-[#FDFBF7] rounded-xl p-6 border border-[#D4AF37]/30 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="font-serif font-bold text-lg text-[#FDFBF7]">Studio Gallery Manager</h2>
          </div>
          <p className="text-xs text-gray-300 font-sans">
            Upload, edit, arrange, and organize showcase images for the YARED TIBEB Studio Gallery.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveSubTab('images')}
            className={`px-4 py-2 rounded-lg text-xs font-serif font-bold uppercase tracking-wider transition cursor-pointer ${
              activeSubTab === 'images'
                ? 'bg-[#D4AF37] text-[#231B15] shadow-xs'
                : 'bg-[#231B15] text-gray-300 hover:text-white border border-gray-700'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 inline mr-1.5" />
            <span>Studio Images ({studioImages.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('categories')}
            className={`px-4 py-2 rounded-lg text-xs font-serif font-bold uppercase tracking-wider transition cursor-pointer ${
              activeSubTab === 'categories'
                ? 'bg-[#D4AF37] text-[#231B15] shadow-xs'
                : 'bg-[#231B15] text-gray-300 hover:text-white border border-gray-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5 inline mr-1.5" />
            <span>Studio Categories ({studioCategories.length})</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: STUDIO IMAGES MANAGEMENT */}
      {activeSubTab === 'images' && (
        <div className="space-y-6">
          
          {/* Controls Bar: Search, Category Filter, and Add Button */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#E5DFD3] shadow-xs">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                placeholder="Search studio images by title, tag, or category..."
                className="w-full pl-9 pr-8 py-2 bg-[#FDFBF7] border border-[#E5DFD3] rounded-lg text-xs font-sans text-[#231B15] focus:outline-none focus:border-[#D4AF37]"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              {adminSearch && (
                <button onClick={() => setAdminSearch('')} className="absolute right-2.5 top-2.5 text-gray-400 hover:text-black">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-serif text-gray-500 shrink-0">Category:</span>
              <select
                value={adminCategoryFilter}
                onChange={(e) => setAdminCategoryFilter(e.target.value)}
                className="py-2 px-3 bg-[#FDFBF7] border border-[#E5DFD3] rounded-lg text-xs font-serif font-bold text-[#231B15] focus:outline-none focus:border-[#D4AF37] cursor-pointer"
              >
                <option value="all">All Categories</option>
                {studioCategories.map(cat => (
                  <option key={cat.id} value={cat.slug}>{cat.name}</option>
                ))}
              </select>

              {/* Add New Studio Image Button */}
              <button
                onClick={handleOpenAddImageModal}
                className="px-4 py-2 bg-[#231B15] text-[#D4AF37] hover:bg-black transition font-serif font-bold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 shadow-xs cursor-pointer border border-[#D4AF37]/30 ml-auto"
              >
                <Plus className="w-4 h-4 text-[#D4AF37]" />
                <span>+ Upload Studio Image</span>
              </button>
            </div>
          </div>

          {/* Admin Images Table / Grid */}
          <div className="bg-white rounded-xl border border-[#E5DFD3] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#231B15] text-[#D4AF37] font-serif font-bold text-xs uppercase tracking-wider">
                    <th className="p-3.5">Order</th>
                    <th className="p-3.5">Image & Title</th>
                    <th className="p-3.5">Assigned Categories</th>
                    <th className="p-3.5">Tags</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DFD3] text-xs font-sans text-[#231B15]">
                  {filteredAdminImages.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500 font-sans">
                        No Studio images match your search or category filter. Click <strong>+ Upload Studio Image</strong> above to add one.
                      </td>
                    </tr>
                  ) : (
                    filteredAdminImages.map((img, idx) => (
                      <tr key={img.id} className="hover:bg-[#FDFBF7] transition">
                        {/* Order & Move buttons */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-1">
                            <span className="font-mono font-bold w-6 text-gray-500">{img.orderIndex || idx + 1}</span>
                            <div className="flex flex-col">
                              <button
                                disabled={idx === 0}
                                onClick={() => handleMoveOrder(idx, 'up')}
                                className="p-0.5 text-gray-400 hover:text-black disabled:opacity-20 cursor-pointer"
                                title="Move Up"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                disabled={idx === filteredAdminImages.length - 1}
                                onClick={() => handleMoveOrder(idx, 'down')}
                                className="p-0.5 text-gray-400 hover:text-black disabled:opacity-20 cursor-pointer"
                                title="Move Down"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Image & Title */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <img
                              src={img.imageUrl}
                              alt={img.title}
                              className="w-12 h-14 object-cover rounded-md border border-[#E5DFD3] bg-gray-100"
                            />
                            <div className="space-y-0.5">
                              <div className="font-serif font-bold text-sm text-[#231B15] line-clamp-1">
                                {img.title}
                              </div>
                              <p className="text-[11px] text-gray-500 line-clamp-1">
                                {img.description || 'No description provided'}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Assigned Categories */}
                        <td className="p-3.5">
                          <div className="flex flex-wrap gap-1">
                            {(img.categories || []).map(catSlug => {
                              const catObj = studioCategories.find(c => c.slug === catSlug || c.name.toLowerCase() === catSlug.toLowerCase());
                              return (
                                <span key={catSlug} className="px-2 py-0.5 bg-[#FDFBF7] border border-[#E5DFD3] text-[10px] font-serif font-bold text-[#8B0000] rounded">
                                  {catObj ? catObj.name : catSlug}
                                </span>
                              );
                            })}
                          </div>
                        </td>

                        {/* Tags */}
                        <td className="p-3.5">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {(img.tags || []).map(t => (
                              <span key={t} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded">
                                #{t}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Status (Featured / Hidden) */}
                        <td className="p-3.5">
                          <div className="flex flex-col gap-1 items-start">
                            {img.isFeatured && (
                              <span className="bg-[#231B15] text-[#D4AF37] border border-[#D4AF37]/30 px-2 py-0.5 rounded text-[10px] font-serif font-bold flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                                Featured
                              </span>
                            )}
                            {img.isHidden ? (
                              <button
                                onClick={() => onEditImage(img.id, { isHidden: false })}
                                className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-[10px] font-sans font-bold flex items-center gap-1 hover:bg-red-200 cursor-pointer"
                                title="Click to Show in Gallery"
                              >
                                <EyeOff className="w-3 h-3 text-red-700" />
                                Hidden (Private)
                              </button>
                            ) : (
                              <button
                                onClick={() => onEditImage(img.id, { isHidden: true })}
                                className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-sans font-bold flex items-center gap-1 hover:bg-emerald-200 cursor-pointer"
                                title="Click to Hide from Gallery"
                              >
                                <Eye className="w-3 h-3 text-emerald-700" />
                                Visible (Public)
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditImageModal(img)}
                              className="p-1.5 bg-gray-100 hover:bg-[#D4AF37] hover:text-[#231B15] text-gray-700 rounded transition cursor-pointer"
                              title="Edit Image"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingImageId(img.id)}
                              className="p-1.5 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 rounded transition cursor-pointer"
                              title="Delete Image"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB 2: STUDIO CATEGORIES MANAGEMENT */}
      {activeSubTab === 'categories' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-[#E5DFD3] shadow-xs">
            <div>
              <h3 className="font-serif font-bold text-sm text-[#231B15]">Custom Studio Category Taxonomy</h3>
              <p className="text-xs text-gray-500 font-sans">
                Manage the categories used to classify showcase items in the Studio Gallery.
              </p>
            </div>

            <button
              onClick={handleOpenAddCategoryModal}
              className="px-4 py-2 bg-[#231B15] text-[#D4AF37] hover:bg-black transition font-serif font-bold text-xs uppercase tracking-wider rounded-lg flex items-center gap-2 shadow-xs cursor-pointer border border-[#D4AF37]/30"
            >
              <Plus className="w-4 h-4 text-[#D4AF37]" />
              <span>+ Create Category</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {studioCategories.map((cat) => {
              const imageCount = studioImages.filter(img => 
                img.categories && img.categories.some(c => c === cat.slug || c === cat.id || c === cat.name.toLowerCase())
              ).length;

              return (
                <div key={cat.id} className="bg-white rounded-xl border border-[#E5DFD3] p-5 space-y-3 shadow-xs relative flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-sm text-[#231B15]">{cat.name}</span>
                      <span className="bg-[#231B15] text-[#D4AF37] text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                        {imageCount} items
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-gray-400">
                      slug: <span className="text-gray-600 font-sans">{cat.slug}</span>
                    </div>

                    {cat.description && (
                      <p className="text-xs text-gray-600 font-sans line-clamp-2">
                        {cat.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[#E5DFD3] flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenEditCategoryModal(cat)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-[#D4AF37] text-gray-700 hover:text-[#231B15] text-xs font-serif font-bold rounded flex items-center gap-1 transition cursor-pointer"
                    >
                      <Edit className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setDeletingCategoryId(cat.id)}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white text-xs font-serif font-bold rounded flex items-center gap-1 transition cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL 1: ADD / EDIT STUDIO IMAGE */}
      {isImageModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-[#FDFBF7] rounded-xl border border-[#D4AF37]/40 max-w-2xl w-full p-6 space-y-6 shadow-2xl relative my-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DFD3]">
              <h3 className="font-serif font-bold text-lg text-[#231B15] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                <span>{editingImageId ? 'Edit Studio Image' : 'Upload New Studio Image'}</span>
              </h3>
              <button onClick={() => setIsImageModalOpen(false)} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveImage} className="space-y-4">
              
              {/* Title Input */}
              <div className="space-y-1">
                <label className="text-xs font-serif font-bold text-[#231B15] uppercase tracking-wider">
                  Image Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Empress Zewditu Royal Wedding Kemis"
                  className="w-full px-3.5 py-2 bg-white border border-[#E5DFD3] rounded-md text-xs font-sans text-[#231B15] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* Description Input */}
              <div className="space-y-1">
                <label className="text-xs font-serif font-bold text-[#231B15] uppercase tracking-wider">
                  Description / Context
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Describe the craft, loom technique, occasion, or master weaver details..."
                  className="w-full px-3.5 py-2 bg-white border border-[#E5DFD3] rounded-md text-xs font-sans text-[#231B15] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* Image URL & Local Upload Option */}
              <div className="space-y-2">
                <label className="text-xs font-serif font-bold text-[#231B15] uppercase tracking-wider">
                  Image URL / File Upload <span className="text-red-500">*</span>
                </label>
                
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-12345... or local path"
                    className="flex-1 px-3.5 py-2 bg-white border border-[#E5DFD3] rounded-md text-xs font-sans text-[#231B15] focus:outline-none focus:border-[#D4AF37]"
                  />
                  <label className="px-3.5 py-2 bg-[#231B15] text-[#D4AF37] hover:bg-black transition text-xs font-serif font-bold rounded-md cursor-pointer shrink-0 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Browse File</span>
                    <input type="file" accept="image/*" onChange={handleImageFileUpload} className="hidden" />
                  </label>
                </div>

                {/* Live Preview */}
                {formImageUrl && (
                  <div className="p-2 bg-white rounded-md border border-[#E5DFD3] flex items-center gap-3">
                    <img src={formImageUrl} alt="Preview" className="w-16 h-16 object-cover rounded border" />
                    <div className="text-xs text-gray-500 font-sans">
                      Image URL Loaded. Verify image renders correctly before saving.
                    </div>
                  </div>
                )}
              </div>

              {/* Assign Categories (Checkboxes) */}
              <div className="space-y-1.5">
                <label className="text-xs font-serif font-bold text-[#231B15] uppercase tracking-wider">
                  Assign Categories <span className="text-red-500">*</span> (Select one or more)
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-2 bg-white rounded-md border border-[#E5DFD3]">
                  {studioCategories.map(cat => {
                    const isChecked = formCategories.includes(cat.slug);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleToggleFormCategory(cat.slug)}
                        className={`px-2.5 py-1.5 rounded text-xs font-serif text-left flex items-center justify-between border cursor-pointer transition ${
                          isChecked
                            ? 'bg-[#231B15] text-[#D4AF37] border-[#231B15] font-bold'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-[#D4AF37]'
                        }`}
                      >
                        <span className="truncate pr-1">{cat.name}</span>
                        {isChecked && <Check className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Link Related Store Products */}
              <div className="space-y-1.5">
                <label className="text-xs font-serif font-bold text-[#231B15] uppercase tracking-wider block">
                  Link Related Garments / Store Products
                </label>
                <div className="text-[10px] text-gray-500 font-sans pb-1">
                  Select purchaseable garments to link with this portfolio masterpiece. (Showing items matching the selected categories)
                </div>

                <div className="max-h-36 overflow-y-auto p-2 bg-white rounded-md border border-[#E5DFD3] space-y-1.5">
                  {products.length === 0 ? (
                    <div className="text-xs text-gray-400 font-sans italic p-2">No store products available to link</div>
                  ) : (
                    (() => {
                      const filtered = products.filter(p => {
                        if (formCategories.length === 0) return true;
                        const pCat = String(p.category).toLowerCase().replace(/['’\s-]/g, '');
                        return formCategories.some(catSlug => {
                          const target = catSlug.toLowerCase().replace(/['’\s-]/g, '');
                          const inCollections = p.collections?.some(c => {
                            const norm = c.toLowerCase().replace(/['’\s-]/g, '');
                            return norm === target || norm.includes(target) || target.includes(norm);
                          });
                          return pCat === target || pCat.includes(target) || target.includes(pCat) || inCollections;
                        });
                      });

                      if (filtered.length === 0) {
                        return (
                          <div className="text-xs text-gray-400 font-sans italic p-2">
                            No store products found in the selected categories. Link tags or categories above first.
                          </div>
                        );
                      }

                      return filtered.map(product => {
                        const isLinked = formProductIds.includes(product.id);
                        return (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => {
                              setFormProductIds(prev =>
                                prev.includes(product.id)
                                  ? prev.filter(id => id !== product.id)
                                  : [...prev, product.id]
                              );
                            }}
                            className={`w-full text-left px-2 py-1.5 rounded text-xs transition border flex items-center justify-between cursor-pointer ${
                              isLinked
                                ? 'bg-amber-50/50 border-[#D4AF37] text-[#231B15]'
                                : 'bg-gray-50 border-gray-100 hover:border-gray-300 text-gray-700'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[10px] ${
                                isLinked ? 'bg-[#231B15] border-[#231B15] text-white' : 'bg-white border-gray-300'
                              }`}>
                                {isLinked && '✓'}
                              </span>
                              <span className="font-medium truncate max-w-[280px]">{product.name}</span>
                              <span className="text-[10px] text-gray-400">({product.category})</span>
                            </div>
                            <span className="font-mono text-xs font-bold shrink-0 text-[#8B0000]">ETB {product.priceUSD.toLocaleString()}</span>
                          </button>
                        );
                      });
                    })()
                  )}
                </div>
              </div>

              {/* Tags Input */}
              <div className="space-y-1">
                <label className="text-xs font-serif font-bold text-[#231B15] uppercase tracking-wider">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  placeholder="e.g. wedding, habesha-kemis, gold-thread, bride, luxury"
                  className="w-full px-3.5 py-2 bg-white border border-[#E5DFD3] rounded-md text-xs font-sans text-[#231B15] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* Options: Featured & Hidden Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer p-2.5 bg-white rounded-md border border-[#E5DFD3]">
                  <input
                    type="checkbox"
                    checked={formIsFeatured}
                    onChange={(e) => setFormIsFeatured(e.target.checked)}
                    className="accent-[#D4AF37] w-4 h-4 cursor-pointer"
                  />
                  <div className="text-xs font-serif font-bold text-[#231B15]">
                    Mark as Featured
                  </div>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-2.5 bg-white rounded-md border border-[#E5DFD3]">
                  <input
                    type="checkbox"
                    checked={formIsHidden}
                    onChange={(e) => setFormIsHidden(e.target.checked)}
                    className="accent-red-600 w-4 h-4 cursor-pointer"
                  />
                  <div className="text-xs font-serif font-bold text-red-700">
                    Hide from Gallery
                  </div>
                </label>

                <div className="p-2.5 bg-white rounded-md border border-[#E5DFD3] flex items-center gap-2">
                  <span className="text-xs font-serif font-bold text-gray-600 shrink-0">Order:</span>
                  <input
                    type="number"
                    min={1}
                    value={formOrderIndex}
                    onChange={(e) => setFormOrderIndex(Number(e.target.value) || 1)}
                    className="w-16 px-2 py-1 bg-gray-50 border rounded text-xs font-mono font-bold"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#E5DFD3] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsImageModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-serif font-bold text-xs uppercase rounded-md hover:bg-gray-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-[#231B15] text-[#D4AF37] hover:bg-black transition font-serif font-bold text-xs uppercase rounded-md flex items-center gap-2 shadow-xs cursor-pointer border border-[#D4AF37]/30"
                >
                  <Save className="w-4 h-4 text-[#D4AF37]" />
                  <span>{isSubmitting ? 'Saving...' : 'Save Studio Image'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL 2: ADD / EDIT CATEGORY */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#FDFBF7] rounded-xl border border-[#D4AF37]/40 max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            
            <div className="flex items-center justify-between pb-2 border-b border-[#E5DFD3]">
              <h3 className="font-serif font-bold text-base text-[#231B15]">
                {editingCategoryId ? 'Edit Studio Category' : 'Create Studio Category'}
              </h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-serif font-bold text-[#231B15] uppercase tracking-wider">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={catFormName}
                  onChange={(e) => setCatFormName(e.target.value)}
                  placeholder="e.g. Cultural Events, Modern Traditional Wear..."
                  className="w-full px-3.5 py-2 bg-white border border-[#E5DFD3] rounded-md text-xs font-sans text-[#231B15] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-serif font-bold text-[#231B15] uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={catFormDesc}
                  onChange={(e) => setCatFormDesc(e.target.value)}
                  placeholder="Brief summary of items in this category..."
                  className="w-full px-3.5 py-2 bg-white border border-[#E5DFD3] rounded-md text-xs font-sans text-[#231B15] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="pt-3 border-t border-[#E5DFD3] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-serif font-bold text-xs uppercase rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#231B15] text-[#D4AF37] font-serif font-bold text-xs uppercase rounded-md shadow-xs hover:bg-black transition"
                >
                  {isSubmitting ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODALS */}
      {deletingImageId && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full space-y-4 text-center border border-red-200 shadow-xl">
            <Trash2 className="w-10 h-10 text-red-600 mx-auto" />
            <h3 className="font-serif font-bold text-base text-[#231B15]">Delete Studio Image?</h3>
            <p className="text-xs text-gray-600 font-sans">
              This action will permanently remove this image from the Studio Gallery showcase.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingImageId(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-serif font-bold text-xs rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const success = await onDeleteImage(deletingImageId);
                  if (success) addToast('Image Deleted', 'Studio image removed.');
                  setDeletingImageId(null);
                }}
                className="px-4 py-2 bg-red-600 text-white font-serif font-bold text-xs rounded-md hover:bg-red-700 transition"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {deletingCategoryId && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full space-y-4 text-center border border-red-200 shadow-xl">
            <Trash2 className="w-10 h-10 text-red-600 mx-auto" />
            <h3 className="font-serif font-bold text-base text-[#231B15]">Delete Studio Category?</h3>
            <p className="text-xs text-gray-600 font-sans">
              Deleting this category will remove it from the filter lists. Images assigned to it will revert to general categories.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingCategoryId(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-serif font-bold text-xs rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const success = await onDeleteCategory(deletingCategoryId);
                  if (success) addToast('Category Deleted', 'Studio category deleted.');
                  setDeletingCategoryId(null);
                }}
                className="px-4 py-2 bg-red-600 text-white font-serif font-bold text-xs rounded-md hover:bg-red-700 transition"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
