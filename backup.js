// Function to convert transactions to CSV format
function transactionsToCSV(transactions) {
    const headers = ["User", "Type", "Description", "Category", "Budget", "Actual", "Date"];
    const rows = transactions.map(transaction => [
        transaction.user,
        transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
        transaction.description,
        transaction.category,
        formatCurrencyValue(transaction.budget),
        transaction.actual !== undefined ? formatCurrencyValue(transaction.actual) : '',
        transaction.date.toISOString()
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    return csvContent;
}

// Function to download the CSV file
function downloadCSV(content, fileName) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Function to backup data to CSV
function backupData() {
    const transactions = [...transactionsMas, ...transactionsAdek]; // Combine both user's transactions
    const csvContent = transactionsToCSV(transactions);
    downloadCSV(csvContent, 'backup_transactions.csv');
}

// Add event listener to backup button
document.getElementById('backup_button').addEventListener('click', backupData);
