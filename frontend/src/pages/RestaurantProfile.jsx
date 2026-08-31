import { useState, useEffect } from 'react';
import { Save, Upload, Loader2, Store } from 'lucide-react';
import { restaurantService } from '../services/restaurant';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function RestaurantProfile() {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    restaurantService.get()
      .then(setForm)
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSocialChange = (key, value) => {
    setForm(prev => ({
      ...prev,
      social_media: { ...prev.social_media, [key]: value },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await restaurantService.update(form);
      setForm(updated);
      toast.success('Profile saved!');
    } catch {
      toast.error('Failed to save');
    }
    setSaving(false);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const updated = await restaurantService.uploadLogo(file);
      setForm(updated);
      toast.success('Logo uploaded!');
    } catch {
      toast.error('Failed to upload logo');
    }
  };

  if (loading) return <LoadingSpinner text="Loading profile..." />;
  if (!form) return null;

  return (
    <div className="max-w-3xl space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Restaurant Profile</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your restaurant information</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      {/* Logo */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Logo</h2>
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
            {form.logo ? (
              <img src={form.logo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Store className="w-10 h-10 text-gray-400" />
            )}
          </div>
          <label className="btn-secondary cursor-pointer">
            <Upload className="w-4 h-4" />
            Upload Logo
            <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Basic Info */}
      <div className="glass-card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="input-label">Restaurant Name</label>
            <input name="name" value={form.name} onChange={handleChange} className="input-field" />
          </div>
          <div className="md:col-span-2">
            <label className="input-label">Tagline</label>
            <input name="tagline" value={form.tagline} onChange={handleChange} className="input-field" placeholder="Traditional Flavours, Modern Taste" />
          </div>
          <div className="md:col-span-2">
            <label className="input-label">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} className="input-field resize-none" rows={3} />
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="glass-card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Contact Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="input-label">Address</label>
            <textarea name="address" value={form.address} onChange={handleChange} className="input-field resize-none" rows={2} />
          </div>
          <div>
            <label className="input-label">Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="input-label">Email</label>
            <input name="email" value={form.email} onChange={handleChange} className="input-field" />
          </div>
          <div className="md:col-span-2">
            <label className="input-label">Opening Hours</label>
            <input name="opening_hours" value={form.opening_hours} onChange={handleChange} className="input-field" placeholder="Mon-Sun: 11:00 AM - 11:00 PM" />
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div className="glass-card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Social Media</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="input-label">Instagram</label>
            <input value={form.social_media?.instagram || ''} onChange={(e) => handleSocialChange('instagram', e.target.value)} className="input-field" placeholder="@yourhandle" />
          </div>
          <div>
            <label className="input-label">Facebook</label>
            <input value={form.social_media?.facebook || ''} onChange={(e) => handleSocialChange('facebook', e.target.value)} className="input-field" placeholder="yourpage" />
          </div>
        </div>
      </div>
    </div>
  );
}
