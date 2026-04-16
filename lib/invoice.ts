import jsPDF from 'jspdf';

interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
  color?: string;
}

interface InvoiceOrder {
  _id: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  items: InvoiceItem[];
  totalAmount: number;
  status?: string;
  address?: string;
  paymentMethod?: string;
  createdAt?: string;
}

export function generateAndShareInvoice(order: InvoiceOrder, shareWhatsApp: boolean) {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(200, 169, 110);
  doc.rect(0, 0, pageW, 40, 'F');
  doc.setTextColor(13, 13, 13);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('JSB Sons', 20, 22);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Premium Clothing Store', 20, 32);
  doc.setTextColor(255, 255, 255);
  doc.text(`Invoice #${order._id.slice(-6).toUpperCase()}`, pageW - 20, 22, { align: 'right' });
  doc.text(order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN'), pageW - 20, 32, { align: 'right' });

  // Customer section
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', 20, 58);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(order.customerName, 20, 66);
  if (order.customerEmail) doc.text(order.customerEmail, 20, 73);
  if (order.customerPhone) doc.text(order.customerPhone, 20, 80);
  if (order.address) {
    const addrLines = doc.splitTextToSize(order.address, 80);
    doc.text(addrLines, 20, 87);
  }

  // Payment info
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Method:', pageW - 100, 66);
  doc.setFont('helvetica', 'normal');
  doc.text(order.paymentMethod || 'COD', pageW - 100, 73);
  if (order.status) {
    doc.setFont('helvetica', 'bold');
    doc.text('Status:', pageW - 100, 80);
    doc.setFont('helvetica', 'normal');
    doc.text(order.status.toUpperCase(), pageW - 100, 87);
  }

  // Items table
  let y = 110;
  doc.setFillColor(240, 240, 240);
  doc.rect(15, y - 6, pageW - 30, 10, 'F');
  doc.setTextColor(50, 50, 50);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('ITEM', 20, y);
  doc.text('COLOR', 90, y);
  doc.text('QTY', 125, y, { align: 'center' });
  doc.text('UNIT PRICE', 155, y, { align: 'right' });
  doc.text('TOTAL', pageW - 20, y, { align: 'right' });
  y += 8;

  doc.setFont('helvetica', 'normal');
  order.items.forEach((item) => {
    if (y > 250) { doc.addPage(); y = 20; }
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.text(item.name, 20, y);
    doc.text(item.color || '-', 90, y);
    doc.text(String(item.quantity), 125, y, { align: 'center' });
    doc.text(`Rs. ${item.price.toLocaleString('en-IN')}`, 155, y, { align: 'right' });
    doc.text(`Rs. ${(item.price * item.quantity).toLocaleString('en-IN')}`, pageW - 20, y, { align: 'right' });
    y += 9;

    // separator
    doc.setDrawColor(230, 230, 230);
    doc.line(15, y - 3, pageW - 15, y - 3);
  });

  // Total
  y += 5;
  doc.setFillColor(200, 169, 110);
  doc.rect(pageW - 100, y, 85, 12, 'F');
  doc.setTextColor(13, 13, 13);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('TOTAL:', pageW - 95, y + 8);
  doc.text(`Rs. ${order.totalAmount.toLocaleString('en-IN')}`, pageW - 20, y + 8, { align: 'right' });

  // Footer
  doc.setTextColor(150, 150, 150);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Thank you for shopping at JSB Sons!', pageW / 2, 285, { align: 'center' });
  doc.text('For queries: support@jsbsons.com | +91 98765 43210', pageW / 2, 290, { align: 'center' });

  // Download
  doc.save(`JSBSons_Invoice_${order._id.slice(-6).toUpperCase()}.pdf`);

  // WhatsApp share
  if (shareWhatsApp && order.customerPhone) {
    const phone = order.customerPhone.replace(/[^0-9]/g, '');
    const invoiceNum = order._id.slice(-6).toUpperCase();
    const items = order.items.map(i => `  • ${i.name} × ${i.quantity} = ₹${(i.price * i.quantity).toLocaleString('en-IN')}`).join('\n');
    const msg = encodeURIComponent(
      `🧾 *JSB Sons — Invoice #${invoiceNum}*\n\nDear ${order.customerName},\n\nThank you for shopping with us! Here's your order summary:\n\n${items}\n\n*Total: ₹${order.totalAmount.toLocaleString('en-IN')}*\n\n📦 Status: ${(order.status || 'confirmed').toUpperCase()}\n💳 Payment: ${order.paymentMethod || 'COD'}\n\nFor any queries, reply to this message.\n\n— JSB Sons Team 👔`
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  }
}
