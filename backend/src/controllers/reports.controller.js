const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const prisma = require('../utils/prisma');

const exportExcel = async (req, res) => {
  try {
    const { type } = req.query;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Report');
    
    if (type === 'offers') {
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Type', key: 'type', width: 15 },
        { header: 'Usage', key: 'usage', width: 15 },
        { header: 'City', key: 'city', width: 20 },
        { header: 'District', key: 'district', width: 20 },
        { header: 'Price From', key: 'priceFrom', width: 15 },
        { header: 'Price To', key: 'priceTo', width: 15 },
        { header: 'Area From', key: 'areaFrom', width: 12 },
        { header: 'Area To', key: 'areaTo', width: 12 },
        { header: 'Broker', key: 'broker', width: 20 },
        { header: 'Created At', key: 'createdAt', width: 20 }
      ];
      
      const offers = await prisma.offer.findMany({
        include: { createdBy: { select: { name: true } } }
      });
      
      offers.forEach(offer => {
        worksheet.addRow({
          id: offer.id,
          type: offer.type,
          usage: offer.usage,
          city: offer.city,
          district: offer.district,
          priceFrom: Number(offer.priceFrom),
          priceTo: Number(offer.priceTo),
          areaFrom: offer.areaFrom,
          areaTo: offer.areaTo,
          broker: offer.createdBy.name,
          createdAt: offer.createdAt.toISOString().split('T')[0]
        });
      });
    } else if (type === 'requests') {
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Type', key: 'type', width: 15 },
        { header: 'Usage', key: 'usage', width: 15 },
        { header: 'City', key: 'city', width: 20 },
        { header: 'Budget From', key: 'budgetFrom', width: 15 },
        { header: 'Budget To', key: 'budgetTo', width: 15 },
        { header: 'Priority', key: 'priority', width: 12 },
        { header: 'Broker', key: 'broker', width: 20 }
      ];
      
      const requests = await prisma.request.findMany({
        include: { createdBy: { select: { name: true } } }
      });
      
      requests.forEach(req => {
        worksheet.addRow({
          id: req.id,
          type: req.type,
          usage: req.usage,
          city: req.city,
          budgetFrom: Number(req.budgetFrom),
          budgetTo: Number(req.budgetTo),
          priority: req.priority,
          broker: req.createdBy.name
        });
      });
    } else if (type === 'matches') {
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Offer ID', key: 'offerId', width: 12 },
        { header: 'Request ID', key: 'requestId', width: 12 },
        { header: 'Score', key: 'score', width: 10 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Created At', key: 'createdAt', width: 20 }
      ];
      
      const matches = await prisma.match.findMany();
      
      matches.forEach(match => {
        worksheet.addRow({
          id: match.id,
          offerId: match.offerId,
          requestId: match.requestId,
          score: match.score,
          status: match.status,
          createdAt: match.createdAt.toISOString().split('T')[0]
        });
      });
    }
    
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename=report-${type}-${Date.now()}.xlsx`);
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const exportPDF = async (req, res) => {
  try {
    const { type } = req.query;
    const doc = new PDFDocument();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=report-${type}-${Date.now()}.pdf`);
    
    doc.pipe(res);
    
    doc.fontSize(20).text(`${type.toUpperCase()} REPORT`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(2);
    
    if (type === 'offers') {
      const offers = await prisma.offer.findMany({
        include: { createdBy: { select: { name: true } } }
      });
      
      offers.forEach((offer, index) => {
        doc.fontSize(12).text(`${index + 1}. ${offer.type} - ${offer.city}, ${offer.district}`);
        doc.fontSize(10).text(`   Usage: ${offer.usage} | Land Status: ${offer.landStatus}`);
        doc.fontSize(10).text(`   Price: ${offer.priceFrom} - ${offer.priceTo} EGP`);
        doc.fontSize(10).text(`   Area: ${offer.areaFrom} - ${offer.areaTo} m²`);
        doc.fontSize(10).text(`   Broker: ${offer.createdBy.name}`);
        doc.moveDown();
      });
    } else if (type === 'requests') {
      const requests = await prisma.request.findMany({
        include: { createdBy: { select: { name: true } } }
      });
      
      requests.forEach((req, index) => {
        doc.fontSize(12).text(`${index + 1}. ${req.type} - ${req.city}`);
        doc.fontSize(10).text(`   Budget: ${req.budgetFrom} - ${req.budgetTo} EGP`);
        doc.fontSize(10).text(`   Priority: ${req.priority}`);
        doc.fontSize(10).text(`   Broker: ${req.createdBy.name}`);
        doc.moveDown();
      });
    }
    
    doc.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { exportExcel, exportPDF };
