import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { Expense } from '../hooks/useExpenses';

export const exportToCSV = (expenses: Expense[], filename: string = 'expenses.csv') => {
  const headers = ['Date', 'Title', 'Category', 'Amount'];
  const csvContent = [
    headers.join(','),
    ...expenses.map(expense => [
      format(new Date(expense.date), 'yyyy-MM-dd'),
      `"${expense.title}"`,
      expense.category,
      expense.amount.toFixed(2)
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = (expenses: Expense[], filename: string = 'expenses.pdf') => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text('Expense Report', 20, 20);
  
  // Add date range
  doc.setFontSize(12);
  doc.text(`Generated on: ${format(new Date(), 'PPP')}`, 20, 35);
  
  // Prepare data for table
  const tableData = expenses.map(expense => [
    format(new Date(expense.date), 'yyyy-MM-dd'),
    expense.title,
    expense.category,
    `₹${expense.amount.toFixed(2)}`
  ]);

  // Add table
  (doc as any).autoTable({
    head: [['Date', 'Title', 'Category', 'Amount']],
    body: tableData,
    startY: 50,
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [99, 102, 241],
      textColor: 255,
    },
    columnStyles: {
      3: { halign: 'right' }
    }
  });

  // Add total
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const finalY = (doc as any).lastAutoTable.finalY || 50;
  doc.setFontSize(14);
  doc.text(`Total: ₹${total.toFixed(2)}`, 20, finalY + 20);

  doc.save(filename);
};