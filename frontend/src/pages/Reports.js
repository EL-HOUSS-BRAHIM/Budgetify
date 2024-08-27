import React, { useState, useEffect, useCallback, useRef } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { fetchBudgetData, fetchExpenses } from '../utils/api';
import { calculateRemainingBudget, calculateExpenseCategoryTotals } from '../utils/helpers';
import Header from '../components/Header';
import Footer from '../components/Footer';
import setActivePage from '../components/setActive';
import ReportControls from '../components/Reports/ReportControls';
import SummaryCards from '../components/Reports/SummaryCards';
import ExpenseChart from '../components/Reports/ExpenseChart';
import TrendChart from '../components/Reports/TrendChart';
import Loader from '../components/Loader';
import '../css/Reports/Reports.css';

const Reports = () => {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedTimeRange, setSelectedTimeRange] = useState('months');

    const expenseChartRef = useRef(null);
    const trendChartRef = useRef(null);

    useEffect(() => {
        document.body.classList.add('reports-page');
        setActivePage('Reports_Page');

        return () => {
            document.body.classList.remove('reports-page');
        };
    }, []);

    const filterDataByDateRange = (data, startDate, endDate) => {
        return data.filter(item => {
            const itemDate = new Date(item.date || item.start_date);
            return itemDate >= new Date(startDate) && itemDate <= new Date(endDate);
        });
    };

    const calculateTotalForPeriod = (data) => {
        return data.reduce((total, item) => total + parseFloat(item.amount), 0);
    };

    const generateReport = useCallback(async (startDate, endDate) => {
        setLoading(true);
        try {
            const [budgets, expenses] = await Promise.all([fetchBudgetData(), fetchExpenses()]);

            console.log('Budgets:', budgets);
            console.log('Expenses:', expenses);

            const filteredBudgets = filterDataByDateRange(budgets, startDate, endDate);
            const filteredExpenses = filterDataByDateRange(expenses, startDate, endDate);

            console.log('Filtered Budgets:', filteredBudgets);
            console.log('Filtered Expenses:', filteredExpenses);

            const totalBudget = calculateTotalForPeriod(filteredBudgets);
            const totalExpenses = calculateTotalForPeriod(filteredExpenses);
            const netSavings = calculateRemainingBudget(totalBudget, totalExpenses);

            console.log('Total Budget:', totalBudget);
            console.log('Total Expenses:', totalExpenses);
            console.log('Net Savings:', netSavings);

            setReportData({
                budgets: filteredBudgets,
                expenses: filteredExpenses,
                totalIncome: totalBudget,
                totalExpenses,
                netSavings,
                startDate,
                endDate
            });
        } catch (error) {
            console.error("Error generating report:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const exportAsPDF = () => {
        if (!reportData) {
            console.error("No report data available");
            return;
        }

        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text("Financial Report", 14, 22);

        doc.setFontSize(12);
        doc.text(`Date Range: ${reportData.startDate} to ${reportData.endDate}`, 14, 32);

        doc.setFontSize(14);
        doc.text("Summary", 14, 45);
        doc.setFontSize(12);
        doc.text(`Total Income (Budget): $${reportData.totalIncome.toFixed(2)}`, 14, 55);
        doc.text(`Total Expenses: $${reportData.totalExpenses.toFixed(2)}`, 14, 65);
        doc.text(`Net Savings: $${reportData.netSavings.toFixed(2)}`, 14, 75);

        const expenseData = calculateExpenseCategoryTotals(reportData.expenses);
        const tableData = Object.entries(expenseData).map(([category, amount]) => [category, `$${amount.toFixed(2)}`]);

        doc.autoTable({
            startY: 85,
            head: [['Category', 'Amount']],
            body: tableData,
        });

        if (expenseChartRef.current && trendChartRef.current) {
            const expenseChartImg = expenseChartRef.current.toDataURL('image/png');
            const trendChartImg = trendChartRef.current.toDataURL('image/png');

            doc.addPage();
            doc.text("Expense Breakdown", 14, 22);
            doc.addImage(expenseChartImg, 'PNG', 10, 30, 190, 100);

            doc.addPage();
            doc.text("Income (Budget) vs Expenses Trend", 14, 22);
            doc.addImage(trendChartImg, 'PNG', 10, 30, 190, 100);
        } else {
            console.warn("Chart references are not available");
        }

        doc.save("financial_report.pdf");
    };

    const exportAsCSV = () => {
        if (!reportData) return;

        const headers = ['Date', 'Type', 'Category', 'Amount'];
        const csvContent = [
            headers.join(','),
            ...reportData.budgets.map(budget =>
                `${budget.date},Income (Budget),${budget.category},${budget.amount}`
            ),
            ...reportData.expenses.map(expense =>
                `${expense.date},Expense,${expense.category},${expense.amount}`
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'financial_report.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <>
            <Header />
            <main className="reports-container">
                <h1>Financial Report Generator</h1>
                <ReportControls
                    generateReport={generateReport}
                    setSelectedTimeRange={setSelectedTimeRange}
                />
                {loading ? (
                    <Loader />
                ) : reportData ? (
                    <div id="reportContent">
                        <SummaryCards
                            totalExpenses={reportData.totalExpenses}
                            totalIncome={reportData.totalIncome}
                            netSavings={reportData.netSavings}
                        />
                        <ExpenseChart
                            ref={expenseChartRef}
                            expenses={reportData.expenses}
                        />
                        <TrendChart
                            ref={trendChartRef}
                            budgets={reportData.budgets}
                            expenses={reportData.expenses}
                            timeRange={selectedTimeRange}
                        />
                        <div className="export-buttons">
                            <button onClick={exportAsPDF}>Export as PDF</button>
                            <button onClick={exportAsCSV}>Export as CSV</button>
                        </div>
                    </div>
                ) : null}
            </main>
            <Footer />
        </>
    );
};

export default Reports;
