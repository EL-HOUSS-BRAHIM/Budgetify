// src/utils/pdfGenerator.js
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generatePDF = (reportData) => {
    const doc = new jsPDF();

    // Add title to PDF
    doc.setFontSize(20);
    doc.text('Financial Report', 20, 20);

    // Add a table for the report data
    doc.autoTable({
        startY: 30,
        head: [['Category', 'Amount']],
        body: reportData.expenses.map(expense => [expense.category, `$${expense.amount.toFixed(2)}`]),
    });

    // Add total expenses, income, and net savings
    doc.text(`Total Expenses: $${reportData.totalExpenses.toFixed(2)}`, 20, doc.lastAutoTable.finalY + 10);
    doc.text(`Total Income: $${reportData.totalIncome.toFixed(2)}`, 20, doc.lastAutoTable.finalY + 20);
    doc.text(`Net Savings: $${reportData.netSavings.toFixed(2)}`, 20, doc.lastAutoTable.finalY + 30);

    // Save the PDF
    doc.save('Financial_Report.pdf');
};
