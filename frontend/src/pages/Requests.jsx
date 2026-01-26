import { useState, useEffect } from 'react';
import api from '../utils/api';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { Plus } from 'phosphor-react';
import '../styles/Login.css';

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    minPrice: '',
    maxPrice: '',
    minArea: '',
    maxArea: '',
    location: '',
    type: 'SALE',
    propertyType: 'APARTMENT'
  });

  const fetchRequests = async () => {
    try {
      const { data } = await api.get('/requests');
      setRequests(data);
    } catch (error) {
      console.error("Failed to fetch requests", error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/requests', {
        ...formData,
        minPrice: parseFloat(formData.minPrice),
        maxPrice: parseFloat(formData.maxPrice),
        minArea: parseFloat(formData.minArea),
        maxArea: parseFloat(formData.maxArea),
      });
      setIsModalOpen(false);
      setFormData({
        clientName: '', minPrice: '', maxPrice: '', minArea: '', maxArea: '', location: '', type: 'SALE', propertyType: 'APARTMENT'
      });
      fetchRequests();
    } catch (error) {
      alert("Error creating request");
    }
  };

  const columns = [
    { header: 'اسم العميل', accessor: 'clientName' },
    { header: 'نطاق السعر', render: (row) => `${parseFloat(row.minPrice).toLocaleString()} - ${parseFloat(row.maxPrice).toLocaleString()}` },
    { header: 'المساحة المطلوبة', render: (row) => `${row.minArea} - ${row.maxArea} م²` },
    { header: 'المنطقة المفضلة', accessor: 'location' },
    { header: 'النوع', render: (row) => row.type === 'SALE' ? 'شراء' : 'إيجار' },
    { header: 'نوع العقار', accessor: 'propertyType' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)} style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={20} />
          إضافة طلب جديد
        </button>
      </div>

      <Table columns={columns} data={requests} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="إضافة طلب عميل جديد">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">اسم العميل</label>
            <input name="clientName" className="form-input" value={formData.clientName} onChange={handleChange} required />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">أقل سعر</label>
              <input name="minPrice" type="number" className="form-input" value={formData.minPrice} onChange={handleChange} required />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">أعلى سعر</label>
              <input name="maxPrice" type="number" className="form-input" value={formData.maxPrice} onChange={handleChange} required />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">أقل مساحة (م²)</label>
              <input name="minArea" type="number" className="form-input" value={formData.minArea} onChange={handleChange} required />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">أعلى مساحة (م²)</label>
              <input name="maxArea" type="number" className="form-input" value={formData.maxArea} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">المنطقة المفضلة</label>
            <input name="location" className="form-input" value={formData.location} onChange={handleChange} required />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">نوع الطلب</label>
              <select name="type" className="form-input" value={formData.type} onChange={handleChange}>
                <option value="SALE">شراء</option>
                <option value="RENT">إيجار</option>
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">نوع العقار</label>
              <select name="propertyType" className="form-input" value={formData.propertyType} onChange={handleChange}>
                <option value="APARTMENT">شقة</option>
                <option value="VILLA">فيلا</option>
                <option value="OFFICE">مكتب إداري</option>
                <option value="SHOP">محل تجاري</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>حفظ الطلب</button>
        </form>
      </Modal>
    </div>
  );
};

export default Requests;
