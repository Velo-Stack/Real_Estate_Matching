import { useState, useEffect } from 'react';
import api from '../utils/api';
import Table from '../components/Table'; // Might need custom card view later, using Table for now

const Matches = () => {
  const [matches, setMatches] = useState([]);

  const fetchMatches = async () => {
    try {
      const { data } = await api.get('/matches');
      setMatches(data);
    } catch (error) {
      console.error("Failed to fetch matches", error);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      await api.patch(`/matches/${id}`, { status: newStatus });
      fetchMatches();
    } catch (error) {
      alert("Error updating status");
    }
  };

  const renderStatus = (status) => {
    const colors = {
      NEW: '#dbeafe', // Blue
      CONTACTED: '#fef3c7', // Yellow
      NEGOTIATION: '#fee2e2', // Red/Orange
      CLOSED: '#d1fae5', // Green
      REJECTED: '#f3f4f6' // Gray
    };
    const labels = {
      NEW: 'جديد',
      CONTACTED: 'تم التواصل',
      NEGOTIATION: 'تفاوض',
      CLOSED: 'تم الإغلاق',
      REJECTED: 'مرفوض'
    };
    
    return (
      <span style={{ 
        backgroundColor: colors[status] || '#eee', 
        padding: '0.25rem 0.75rem', 
        borderRadius: '1rem', 
        fontSize: '0.8rem',
        color: '#1f2937',
        fontWeight: '600'
      }}>
        {labels[status]}
      </span>
    );
  };

  const columns = [
    { header: 'العرض (الوحدة)', render: (row) => `${row.offer?.title} (${parseFloat(row.offer?.price).toLocaleString()})` },
    { header: 'الطلب (العميل)', render: (row) => `${row.request?.clientName} (${parseFloat(row.request?.minPrice).toLocaleString()} - ${parseFloat(row.request?.maxPrice).toLocaleString()})` },
    { header: 'نسبة التوافق', render: (row) => `%${row.score}` },
    { header: 'الحالة', render: (row) => renderStatus(row.status) },
  ];

  const actions = (row) => (
    <select 
      value={row.status} 
      onChange={(e) => updateStatus(row.id, e.target.value)}
      style={{ padding: '0.25rem', borderRadius: '0.5rem', border: '1px solid #ddd' }}
    >
      <option value="NEW">جديد</option>
      <option value="CONTACTED">تم التواصل</option>
      <option value="CLOSED">إغلاق صفقة</option>
      <option value="REJECTED">رفض</option>
    </select>
  );

  return (
    <div>
      <Table columns={columns} data={matches} actions={actions} />
    </div>
  );
};

export default Matches;
