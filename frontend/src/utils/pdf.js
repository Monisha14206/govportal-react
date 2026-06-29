import { jsPDF } from 'jspdf';

function drawHeader(doc, title) {
  doc.setFillColor(11, 61, 98);
  doc.rect(0, 0, 210, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Sachivalayam Portal', 14, 13);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Government Services & Grievance Redressal', 14, 19);
  doc.setFontSize(13);
  doc.text(title, 14, 24);
  doc.setTextColor(20, 20, 20);
}

function drawFooter(doc) {
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text('This is a system-generated document and does not require a physical signature.', 14, 285);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 290);
}

export function downloadApplicationReceipt(application) {
  const doc = new jsPDF();
  drawHeader(doc, 'Application Receipt');

  let y = 40;
  doc.setFontSize(11);

  const rows = [
    ['Application Number', application.application_number],
    ['Service', application.service_name],
    ['Status', application.status],
    ['Submitted On', application.created_at],
  ];

  rows.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(String(value || '-'), 70, y);
    y += 9;
  });

  if (application.remarks) {
    doc.setFont('helvetica', 'bold');
    doc.text('Remarks:', 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(String(application.remarks), 70, y, { maxWidth: 120 });
    y += 12;
  }

  y += 6;
  doc.setDrawColor(200, 200, 200);
  doc.line(14, y, 196, y);
  y += 8;
  doc.setFontSize(10);
  doc.text('Please retain this receipt for your reference. Use the Application Number above', 14, y);
  y += 5;
  doc.text('to track the status of your application on the Sachivalayam Portal.', 14, y);

  drawFooter(doc);
  doc.save(`Receipt_${application.application_number}.pdf`);
}

export function downloadComplaintReceipt(complaint) {
  const doc = new jsPDF();
  drawHeader(doc, 'Complaint Receipt');

  let y = 40;
  doc.setFontSize(11);

  const rows = [
    ['Complaint Number', complaint.complaint_number],
    ['Category', complaint.category],
    ['Subject', complaint.subject],
    ['Status', complaint.status],
    ['Filed On', complaint.created_at],
  ];

  rows.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(String(value || '-'), 70, y, { maxWidth: 120 });
    y += 9;
  });

  drawFooter(doc);
  doc.save(`Complaint_${complaint.complaint_number}.pdf`);
}

export function downloadMockCertificate(application) {
  const doc = new jsPDF();
  drawHeader(doc, 'Certificate (Mock / Sample)');

  doc.setDrawColor(11, 61, 98);
  doc.setLineWidth(1);
  doc.rect(8, 32, 194, 240);

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(application.service_name, 105, 55, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('This is to certify that the application referenced below has been', 105, 70, { align: 'center' });
  doc.text('APPROVED by the competent authority of the Sachivalayam Portal.', 105, 77, { align: 'center' });

  let y = 95;
  const rows = [
    ['Application Number', application.application_number],
    ['Status', application.status],
    ['Issued On', new Date().toLocaleDateString()],
  ];
  rows.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, 40, y);
    doc.setFont('helvetica', 'normal');
    doc.text(String(value || '-'), 110, y);
    y += 10;
  });

  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text('Sample / Mock certificate generated for demonstration purposes only.', 105, 260, { align: 'center' });
  doc.text('Not valid for official or legal use.', 105, 266, { align: 'center' });

  drawFooter(doc);
  doc.save(`Certificate_${application.application_number}.pdf`);
}
