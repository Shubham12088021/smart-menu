import { useState, useEffect } from 'react';
import { Plus, FolderOpen, ChevronDown, ChevronRight } from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { menuService } from '../services/menu';
import MenuItemCard from '../components/MenuItemCard';
import MenuItemForm from '../components/MenuItemForm';
import CategoryForm from '../components/CategoryForm';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function MenuManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCats, setExpandedCats] = useState({});

  // Modals
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, type: '', id: null });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const loadData = async () => {
    try {
      const cats = await menuService.getCategories();
      setCategories(cats);
      // Expand all by default
      const expanded = {};
      cats.forEach(c => expanded[c.id] = true);
      setExpandedCats(prev => ({ ...expanded, ...prev }));
    } catch {
      toast.error('Failed to load menu');
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const toggleCategory = (catId) => {
    setExpandedCats(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  // ── Category handlers ──────────────────────────────────
  const handleAddCategory = async (data) => {
    try {
      await menuService.createCategory(data);
      toast.success('Category added!');
      setShowCategoryForm(false);
      loadData();
    } catch { toast.error('Failed to add category'); }
  };

  const handleEditCategory = async (data) => {
    try {
      await menuService.updateCategory(editingCategory.id, data);
      toast.success('Category updated!');
      setShowCategoryForm(false);
      setEditingCategory(null);
      loadData();
    } catch { toast.error('Failed to update category'); }
  };

  const handleDeleteCategory = async () => {
    try {
      await menuService.deleteCategory(deleteConfirm.id);
      toast.success('Category deleted');
      setDeleteConfirm({ show: false, type: '', id: null });
      loadData();
    } catch { toast.error('Failed to delete category'); }
  };

  // ── Item handlers ──────────────────────────────────────
  const handleAddItem = async (data, imageFile) => {
    try {
      const item = await menuService.createItem(data);
      if (imageFile) {
        try {
          await menuService.uploadItemImage(item.id, imageFile);
        } catch (imgErr) {
          toast.error(imgErr.response?.data?.detail || 'Item created, but image upload failed');
        }
      }
      toast.success('Item added successfully!');
      setShowItemForm(false);
      loadData();
    } catch (err) {
      console.error('Failed to add item:', err);
      toast.error(err.response?.data?.detail || 'Failed to add item');
    }
  };

  const handleUpdateItem = async (data, imageFile) => {
    try {
      await menuService.updateItem(editingItem.id, data);
      if (imageFile) {
        try {
          await menuService.uploadItemImage(editingItem.id, imageFile);
        } catch (imgErr) {
          toast.error(imgErr.response?.data?.detail || 'Item updated, but image upload failed');
        }
      }
      toast.success('Item updated successfully!');
      setShowItemForm(false);
      setEditingItem(null);
      loadData();
    } catch (err) {
      console.error('Failed to update item:', err);
      toast.error(err.response?.data?.detail || 'Failed to update item');
    }
  };

  const handleDeleteItem = async () => {
    try {
      await menuService.deleteItem(deleteConfirm.id);
      toast.success('Item deleted');
      setDeleteConfirm({ show: false, type: '', id: null });
      loadData();
    } catch { toast.error('Failed to delete item'); }
  };

  const handleDuplicateItem = async (id) => {
    try {
      await menuService.duplicateItem(id);
      toast.success('Item duplicated!');
      loadData();
    } catch { toast.error('Failed to duplicate'); }
  };

  // ── Drag & Drop ────────────────────────────────────────
  const handleDragEnd = async (event, catId) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const category = categories.find(c => c.id === catId);
    if (!category) return;

    const items = [...category.menu_items];
    const oldIndex = items.findIndex(i => i.id === active.id);
    const newIndex = items.findIndex(i => i.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(items, oldIndex, newIndex);
    // Optimistic update
    setCategories(prev => prev.map(c =>
      c.id === catId ? { ...c, menu_items: reordered } : c
    ));

    try {
      await menuService.reorderItems(reordered.map(i => i.id));
    } catch {
      loadData(); // Revert on error
    }
  };

  if (loading) return <LoadingSpinner text="Loading menu..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Menu Manager</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your categories and menu items</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setEditingCategory(null); setShowCategoryForm(true); }} className="btn-secondary">
            <FolderOpen className="w-4 h-4" /> Add Category
          </button>
          <button onClick={() => { setEditingItem(null); setShowItemForm(true); }} className="btn-primary">
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>
      </div>

      {/* Categories & Items */}
      {categories.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No categories yet"
          description="Create your first category to start building your menu."
          action={
            <button onClick={() => setShowCategoryForm(true)} className="btn-primary">
              <Plus className="w-4 h-4" /> Add Category
            </button>
          }
        />
      ) : (
        <div className="space-y-4">
          {categories.map((cat) => (
            <div key={cat.id} className="glass-card overflow-hidden">
              {/* Category Header */}
              <div
                className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                onClick={() => toggleCategory(cat.id)}
              >
                <div className="flex items-center gap-3">
                  {expandedCats[cat.id] ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{cat.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {cat.menu_items?.length || 0} items
                      {cat.description && ` • ${cat.description}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => { setEditingCategory(cat); setShowCategoryForm(true); }}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm({ show: true, type: 'category', id: cat.id })}
                    className="text-xs text-red-500 hover:text-red-600 font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Items */}
              {expandedCats[cat.id] && (
                <div className="px-5 pb-4 space-y-2">
                  {cat.menu_items?.length > 0 ? (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={(e) => handleDragEnd(e, cat.id)}
                    >
                      <SortableContext
                        items={cat.menu_items.map(i => i.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {cat.menu_items.map((item) => (
                          <MenuItemCard
                            key={item.id}
                            item={item}
                            onEdit={(item) => { setEditingItem(item); setShowItemForm(true); }}
                            onDelete={(id) => setDeleteConfirm({ show: true, type: 'item', id })}
                            onDuplicate={handleDuplicateItem}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-4">
                      No items in this category yet
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <MenuItemForm
        isOpen={showItemForm}
        onClose={() => { setShowItemForm(false); setEditingItem(null); }}
        onSubmit={editingItem ? handleUpdateItem : handleAddItem}
        item={editingItem}
        categories={categories}
      />

      <CategoryForm
        isOpen={showCategoryForm}
        onClose={() => { setShowCategoryForm(false); setEditingCategory(null); }}
        onSubmit={editingCategory ? handleEditCategory : handleAddCategory}
        category={editingCategory}
      />

      <ConfirmDialog
        isOpen={deleteConfirm.show}
        title={deleteConfirm.type === 'category' ? 'Delete Category?' : 'Delete Item?'}
        message={deleteConfirm.type === 'category'
          ? 'This will delete the category and all its menu items. This cannot be undone.'
          : 'This item will be permanently deleted.'}
        onConfirm={deleteConfirm.type === 'category' ? handleDeleteCategory : handleDeleteItem}
        onCancel={() => setDeleteConfirm({ show: false, type: '', id: null })}
        danger
      />
    </div>
  );
}
