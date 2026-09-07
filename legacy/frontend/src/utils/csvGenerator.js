// src/utils/csvGenerator.js

export const generateCSV = (reportData) => {
    const headers = ['Category', 'Amount'];
    const rows = reportData.expenses.map(expense => [expense.category, expense.amount.toFixed(2)]);

    let csvContent = "data:text/csv;charset=utf-8,"
        + headers.join(",") + "\n"
        + rows.map(row => row.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Financial_Report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
