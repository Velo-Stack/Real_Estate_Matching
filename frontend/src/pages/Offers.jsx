import { useState, useEffect } from 'react';
import api from '../utils/api';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { Plus } from 'phosphor-react';
import '../styles/Login.css'; // Reusing form styles

const Offers = () => {
  const [offers, setOffers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    area: '',
    location: '',
    type: 'SALE', // SALE, RENT
    propertyType: 'APARTMENT'
  });

  const fetchOffers = async () => {
    try {
      const { data } = await api.get('/offers');
      setOffers(data);
    } catch (error) {
      console.error("Failed to fetch offers", error);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/offers', {
        ...formData,
        price: parseFloat(formData.price),
        area: parseFloat(formData.area),
      });
      setIsModalOpen(false);
      setFormData({ title: '', price: '', area: '', location: '', type: 'SALE', propertyType: 'APARTMENT' });
      fetchOffers(); // Refresh list
    } catch (error) {
      alert("Error creating offer");
    }
  };

  const columns = [
    { header: 'العنوان', accessor: 'title' },
    { header: 'السعر', accessor: 'price', render: (row) => `${parseFloat(row.price).toLocaleString()} ج.م` },
    { header: 'المساحة', accessor: 'area', render: (row) => `${row.area} م²` },
    { header: 'المنطقة', accessor: 'location' },
    { header: 'النوع', render: (row) => row.type === 'SALE' ? 'بيع' : 'إيجار' },
    { header: 'نوع العقار', accessor: 'propertyType' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)} style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={20} />
          إضافة عرض جديد
        </button>
      </div>

      <Table columns={columns} data={offers} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="إضافة عرض عقاري جديد">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">عنوان العرض</label>
            <input name="title" className="form-input" value={formData.title} onChange={handleChange} required />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">السعر (ج.م)</label>
              <input name="price" type="number" className="form-input" value={formData.price} onChange={handleChange} required />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">المساحة (م²)</label>
              <input name="area" type="number" className="form-input" value={formData.area} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">المنطقة</label>
            <input name="location" className="form-input" value={formData.location} onChange={handleChange} required />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">نوع العرض</label>
              <select name="type" className="form-input" value={formData.type} onChange={handleChange}>
                <option value="SALE">بيع</option>
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

          <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>حفظ العرض</button>
        </form>
      </Modal>
    </div>
  );
};

export default Offers;
