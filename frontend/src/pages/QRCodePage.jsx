import { useState, useEffect } from 'react';
import { QrCode, Download, Printer, Copy, ExternalLink, Loader2 } from 'lucide-react';
import { restaurantService } from '../services/restaurant';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function QRCodePage() {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    restaurantService.get()
      .then(setRestaurant)
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading..." />;
  if (!restaurant) return null;

  const apiBase = import.meta.env.VITE_API_URL || '';
  const currentOrigin = window.location.origin;
  const menuUrl = `${currentOrigin}/menu/${restaurant.slug}`;
  const qrImageUrl = `${apiBase}/api/qr/image/${restaurant.slug}?frontend_url=${encodeURIComponent(currentOrigin)}`;
  const qrDownloadUrl = `${apiBase}/api/qr/download/${restaurant.slug}?frontend_url=${encodeURIComponent(currentOrigin)}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(menuUrl);
    toast.success('URL copied!');
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head><title>QR Code — ${restaurant.name}</title></head>
        <body style="display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100vh; font-family:sans-serif;">
          <h1 style="margin-bottom:8px;">${restaurant.name}</h1>
          <p style="color:#666; margin-bottom:24px;">Scan to view our digital menu</p>
          <img src="${qrImageUrl}" style="width:300px; height:300px;" />
          <p style="color:#999; margin-top:16px; font-size:12px;">${menuUrl}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.onload = () => { printWindow.print(); };
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">QR Code</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Generate a QR code for your digital menu
        </p>
      </div>

      {/* QR Display */}
      <div className="glass-card p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {restaurant.name}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Scan to view our digital menu
        </p>

        {/* QR Code Image */}
        <div className="inline-block p-6 bg-white rounded-3xl shadow-xl mb-6">
          <img
            src={qrImageUrl}
            alt="QR Code"
            className="w-64 h-64"
          />
        </div>

        {/* Menu URL */}
        <div className="flex items-center gap-2 justify-center mb-6">
          <div className="flex-1 max-w-md px-4 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm text-gray-600 dark:text-gray-400 truncate">
            {menuUrl}
          </div>
          <button onClick={copyUrl} className="btn-ghost" title="Copy URL">
            <Copy className="w-4 h-4" />
          </button>
          <a href={menuUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost" title="Open menu">
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          <a href={qrDownloadUrl} download className="btn-primary">
            <Download className="w-4 h-4" /> Download QR
          </a>
          <button onClick={handlePrint} className="btn-secondary">
            <Printer className="w-4 h-4" /> Print QR
          </button>
        </div>
      </div>

      {/* Tips */}
      <div className="glass-card p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">📌 Tips</h3>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li>• Print the QR code and place it on each table in your restaurant</li>
          <li>• Customers scan the QR code with their phone camera</li>
          <li>• The digital menu opens instantly — no app download needed</li>
          <li>• Customers can browse, search, and place orders directly</li>
        </ul>
      </div>
    </div>
  );
}
