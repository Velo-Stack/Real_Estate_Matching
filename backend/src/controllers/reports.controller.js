const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
let arabicReshaper;
let bidiJs;
try { arabicReshaper = require('arabic-reshaper'); } catch (e) { arabicReshaper = null; }
try { bidiJs = require('bidi-js'); } catch (e) { bidiJs = null; }
const prisma = require('../utils/prisma');

// --- Shared helpers for Excel + PDF (Arabic shaping, bidi, numbers, dates) ---
const LRM = '\u200E'; // Left-to-right mark
const RLM = '\u200F'; // Right-to-left mark
const LRI = '\u2066'; // Left-to-right isolate
const PDI = '\u2069'; // Pop directional isolate
const wrapLRI = (s) => `${LRI}${s}${PDI}`;

const hasArabic = (str) => /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(str || '');
const formatNumber = (n) => { if (n === null || n === undefined) return ''; return Number(n).toLocaleString('en-US'); };
const formatRange = (a, b) => `${formatNumber(a)} - ${formatNumber(b)}`;

const shapeArabic = (text) => {
  if (!text) return '';
  const arabicRegex = /([\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]+)/g;
  let out = text.replace(arabicRegex, (m) => {
    let shaped = m;
    if (arabicReshaper) {
      try {
        if (typeof arabicReshaper === 'function') shaped = arabicReshaper(shaped);
        else if (typeof arabicReshaper.reshape === 'function') shaped = arabicReshaper.reshape(shaped);
      } catch (e) { /* ignore */ }
    }
    return shaped;
  });

  if (bidiJs && typeof bidiJs.getEmbeddingLevels === 'function' && typeof bidiJs.reorderVisual === 'function') {
    try {
      const levels = bidiJs.getEmbeddingLevels(out);
      const visual = bidiJs.reorderVisual(out, levels);
      return visual;
    } catch (e) { /* ignore */ }
  }
  return out;
};

const shapeAndReorder = (text) => {
  if (!text) return '';
  const shaped = shapeArabic(text);
  return shaped.replace(/([\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]+)/g, (m) => RLM + m + RLM);
};

const exportExcel = async (req, res) => {
  try {
    const { type } = req.query;
    
    // Validate type parameter
    if (!type || !['offers', 'requests', 'matches'].includes(type)) {
      return res.status(400).json({ message: 'Invalid or missing type parameter. Use: offers, requests, or matches' });
    }
    
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
        const useArabic = hasArabic(offer.city) || hasArabic(offer.district) || hasArabic(offer.createdBy?.name);
        const row = worksheet.addRow({
          id: offer.id,
          type: shapeAndReorder(offer.type),
          usage: shapeAndReorder(offer.usage),
          city: shapeAndReorder(offer.city),
          district: shapeAndReorder(offer.district),
          priceFrom: Number(offer.priceFrom),
          priceTo: Number(offer.priceTo),
          areaFrom: offer.areaFrom ? Number(offer.areaFrom) : null,
          areaTo: offer.areaTo ? Number(offer.areaTo) : null,
          broker: shapeAndReorder(offer.createdBy?.name || ''),
          createdAt: offer.createdAt.toLocaleDateString('en-GB')
        });

        // force right alignment for all rows and shape text cells
        row.eachCell((cell) => {
          if (typeof cell.value === 'string') cell.value = shapeAndReorder(cell.value);
          cell.alignment = { horizontal: 'right' };
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
        const useArabic = hasArabic(req.city) || hasArabic(req.createdBy?.name);
        const row = worksheet.addRow({
          id: req.id,
          type: shapeAndReorder(req.type),
          usage: shapeAndReorder(req.usage),
          city: shapeAndReorder(req.city),
          budgetFrom: Number(req.budgetFrom),
          budgetTo: Number(req.budgetTo),
          priority: shapeAndReorder(req.priority),
          broker: shapeAndReorder(req.createdBy?.name || '')
        });

        // force right alignment for all rows and shape text cells
        row.eachCell((cell) => {
          if (typeof cell.value === 'string') cell.value = shapeAndReorder(cell.value);
          cell.alignment = { horizontal: 'right' };
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
        const useArabic = hasArabic(match.offer.city) || hasArabic(match.request.city);
        const row = worksheet.addRow({
          id: match.id,
          offerId: match.offerId,
          requestId: match.requestId,
          score: match.score,
          status: shapeAndReorder(match.status),
          createdAt: match.createdAt.toLocaleDateString('en-GB')
        });

        row.eachCell((cell) => {
          if (typeof cell.value === 'string') cell.value = shapeAndReorder(cell.value);
          cell.alignment = { horizontal: 'right' };
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
    
    // Validate type parameter
    if (!type || !['offers', 'requests', 'matches'].includes(type)) {
      return res.status(400).json({ message: 'Invalid or missing type parameter. Use: offers, requests, or matches' });
    }

    // helper: detect Arabic chars
    const hasArabic = (str) => /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(str || '');

    // helpers: bidi marks and number formatting (Western numerals per preference)
    const LRM = '\u200E'; // Left-to-right mark
    const RLM = '\u200F'; // Right-to-left mark
    const LRI = '\u2066'; // Left-to-right isolate
    const PDI = '\u2069'; // Pop directional isolate
    const wrapLRM = (s) => `${LRM}${s}${LRM}`;
    const wrapLRI = (s) => `${LRI}${s}${PDI}`;

    const formatNumber = (n) => {
      if (n === null || n === undefined) return '';
      return Number(n).toLocaleString('en-US');
    };
    const formatRange = (a, b) => `${formatNumber(a)} - ${formatNumber(b)}`;

    // Shape Arabic text and reorder entire line using bidi-js when available
    const shapeArabic = (text) => {
      if (!text) return '';
      const arabicRegex = /([\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]+)/g;
      let out = text.replace(arabicRegex, (m) => {
        let shaped = m;
        if (arabicReshaper) {
          try {
            if (typeof arabicReshaper === 'function') shaped = arabicReshaper(shaped);
            else if (typeof arabicReshaper.reshape === 'function') shaped = arabicReshaper.reshape(shaped);
          } catch (e) { /* ignore */ }
        }
        return shaped;
      });

      if (bidiJs && typeof bidiJs.getEmbeddingLevels === 'function' && typeof bidiJs.reorderVisual === 'function') {
        try {
          const levels = bidiJs.getEmbeddingLevels(out);
          const visual = bidiJs.reorderVisual(out, levels);
          return visual;
        } catch (e) { /* ignore */ }
      }

      return out;
    };

    // convenience: shape and then wrap Arabic runs with RLM to keep their visual block
    const shapeAndReorder = (text) => {
      if (!text) return '';
      const shaped = shapeArabic(text);
      // wrap any Arabic runs with RLM for safer display
      return shaped.replace(/([\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]+)/g, (m) => RLM + m + RLM);
    };

    // try common system fonts that support Arabic (fallback to default)
    const candidateFonts = [
      'C:\\Windows\\Fonts\\Tahoma.ttf',
      'C:\\Windows\\Fonts\\Arial.ttf',
      'C:\\Windows\\Fonts\\arialuni.ttf',
      'C:\\Windows\\Fonts\\Times.ttf',
      path.join(__dirname, '../../fonts/NotoNaskhArabic-Regular.ttf')
    ];
    const arabicFont = candidateFonts.find(f => fs.existsSync(f));

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=report-${type}-${Date.now()}.pdf`);
    
    doc.pipe(res);

    // use Arabic-capable font when available
    if (arabicFont) {
      try { doc.font(arabicFont); } catch (e) { /* ignore and continue */ }
    }

    // Titles: show Arabic title if type is requests/offers and Arabic font present
    const titles = { offers: 'تقرير العروض', requests: 'تقرير الطلبات', matches: 'تقرير نتائج المطابقة' };
    const titleText = arabicFont ? titles[type] : `${type.toUpperCase()} REPORT`;

    // Use Western numerals for dates (day/month/year). Wrap with LRI when shown in Arabic title.
    const dateStrRaw = new Date().toLocaleDateString('en-GB');
    const dateLabel = hasArabic(titleText) ? ' الإنشاء تاريخ : ' + wrapLRI(dateStrRaw) : 'Generated on: ' + dateStrRaw;

    // Center title
    doc.fontSize(20).text(titleText, { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(dateLabel, { align: 'center' });
    doc.moveDown(2);
    
    if (type === 'offers') {
      const offers = await prisma.offer.findMany({
        include: { createdBy: { select: { name: true } } }
      });
      
      offers.forEach((offer, index) => {
        const indexStr = wrapLRI(String(index + 1));
        const line1 = shapeAndReorder(`${indexStr}. ${offer.type} - ${offer.city}، ${offer.district}`);

        const priceStr = formatRange(offer.priceFrom, offer.priceTo);
        const priceSeg = wrapLRI(`${priceStr} SAR`);
        const areaSeg = wrapLRI(`${formatNumber(offer.areaFrom)} - ${formatNumber(offer.areaTo)} m²`);

        const labelUsage = 'الهدف';
        const labelLand = 'حالة الأرض';
        const labelPrice = 'السعر';
        const labelArea = 'المساحة';
        const labelBroker = 'الوسيط';

        // always align right as requested
        doc.fontSize(12).text(line1, { align: 'right' });
        doc.fontSize(10).text(shapeAndReorder(`   ${labelUsage}: ${offer.usage} | ${labelLand}: ${offer.landStatus}`), { align: 'right' });
        doc.fontSize(10).text(`   ${labelPrice}: ${priceSeg}`, { align: 'right' });
        doc.fontSize(10).text(`   ${labelArea}: ${areaSeg}`, { align: 'right' });
        doc.fontSize(10).text(`   ${labelBroker}: ${shapeAndReorder(offer.createdBy?.name || '')}`, { align: 'right' });
        doc.moveDown();
      });
    } else if (type === 'requests') {
      const requests = await prisma.request.findMany({
        include: { createdBy: { select: { name: true } } }
      });
      
      requests.forEach((reqData, index) => {
        const indexStr = wrapLRI(String(index + 1));
        const line1 = shapeAndReorder(`${indexStr}. ${reqData.type} - ${reqData.city}`);

        const budgetStr = formatRange(reqData.budgetFrom, reqData.budgetTo);
        const budgetSeg = wrapLRI(`${budgetStr} SAR`);
        const prioritySeg = shapeAndReorder(reqData.priority || '');
        const brokerSeg = shapeAndReorder(reqData.createdBy?.name || '');

        // always align right
        doc.fontSize(12).text(line1, { align: 'right' });
        doc.fontSize(10).text(`   الميزانية: ${budgetSeg}`, { align: 'right' });
        doc.fontSize(10).text(`   الأهمية: ${prioritySeg}`, { align: 'right' });
        doc.fontSize(10).text(`   الوسيط: ${brokerSeg}`, { align: 'right' });
        doc.moveDown();
      });
    } else if (type === 'matches') {
      const matches = await prisma.match.findMany({
        include: {
          offer: { select: { type: true, city: true } },
          request: { select: { type: true, city: true } }
        }
      });
      
      matches.forEach((match, index) => {
        const indexStr = wrapLRI(String(index + 1));
        const line1 = shapeAndReorder(`${indexStr}. Offer: ${match.offer.type} (${match.offer.city}) <-> Request: ${match.request.type} (${match.request.city})`);

        doc.fontSize(12).text(line1, { align: 'right' });
        doc.fontSize(10).text(shapeAndReorder(`   Score: ${wrapLRI(match.score)} | Status: ${wrapLRI(match.status)}`), { align: 'right' });
        doc.moveDown();
      });
    }
    
    doc.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { exportExcel, exportPDF };
