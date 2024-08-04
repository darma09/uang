document.getElementById('menu-toggle').addEventListener('click', function() {
    const menu = document.getElementById('menu');
    menu.classList.toggle('show');
});

document.getElementById('type').addEventListener('change', function() {
    const actualContainer = document.getElementById('actual-container');
    if (this.value === 'expense') {
        actualContainer.style.display = 'block';
    } else {
        actualContainer.style.display = 'none';
    }
});

document.getElementById('transaction-form').addEventListener('submit', function(event) {
    event.preventDefault();

    // Get form values
    const user = document.getElementById('user').value;
    const type = document.getElementById('type').value;
    const description = document.getElementById('description').value;
    const category = document.getElementById('category').value;
    const budget = parseFloat(document.getElementById('budget').value.replace(/\./g, ''));
    const actual = type === 'expense' ? parseFloat(document.getElementById('actual').value.replace(/\./g, '')) : 0;

    // Use current date and time
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0].substring(0, 8);

    // Create transaction object
    const transaction = {
        user,
        type,
        description,
        category,
        budget,
        actual,
        date,
        time
    };

    // Add transaction to list
    addTransaction(transaction);

    // Reset form
    document.getElementById('transaction-form').reset();
    document.getElementById('actual-container').style.display = 'none';
});

let transactionsMas = [];
let transactionsAdek = [];

// Save transactions to localStorage
function saveTransactionsToLocalStorage() {
    localStorage.setItem('transactionsMas', JSON.stringify(transactionsMas));
    localStorage.setItem('transactionsAdek', JSON.stringify(transactionsAdek));
}

// Load transactions from localStorage
function loadTransactionsFromLocalStorage() {
    const savedTransactionsMas = localStorage.getItem('transactionsMas');
    const savedTransactionsAdek = localStorage.getItem('transactionsAdek');
    
    if (savedTransactionsMas) {
        transactionsMas = JSON.parse(savedTransactionsMas);
    }

    if (savedTransactionsAdek) {
        transactionsAdek = JSON.parse(savedTransactionsAdek);
    }

    updateUI();
}

// Add transaction and save to localStorage
function addTransaction(transaction) {
    if (transaction.user === 'Mas') {
        transactionsMas.push(transaction);
    } else {
        transactionsAdek.push(transaction);
    }
    saveTransactionsToLocalStorage();
    updateUI();
}

function updateUITable(user, transactions, listId, totalIncomeId, totalBudgetId, totalActualId, totalDifferenceId, totalPercentageId, netBalanceId) {
    const transactionList = document.getElementById(listId);
    transactionList.innerHTML = '';

    let totalIncome = 0;
    let totalBudget = 0;
    let totalActual = 0;

    transactions.forEach(transaction => {
        const row = document.createElement('tr');
        row.classList.add('fade-in');
        const difference = transaction.budget - transaction.actual;
        const percentage = transaction.budget !== 0 ? ((difference / transaction.budget) * 100).toFixed(2) : '0.00';

        row.innerHTML = `
            <td>${transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</td>
            <td>${transaction.description}</td>
            <td>${transaction.category}</td>
            <td>${formatCurrencyValue(transaction.budget)}</td>
            <td>${transaction.type === 'expense' ? formatCurrencyValue(transaction.actual) : '-'}</td>
            <td>${transaction.type === 'expense' ? formatCurrencyValue(difference) : '-'}</td>
            <td>${transaction.type === 'expense' ? percentage + '%' : '-'}</td>
            <td>${transaction.date}</td>
            <td>${transaction.time}</td>
        `;

        if (transaction.type === 'income') {
            totalIncome += transaction.budget;
        } else {
            totalBudget += transaction.budget;
            totalActual += transaction.actual;
        }

        transactionList.appendChild(row);
    });

    const totalDifference = totalBudget - totalActual;
    const totalPercentage = totalBudget !== 0 ? ((totalDifference / totalBudget) * 100).toFixed(2) : '0.00';

    document.getElementById(totalIncomeId).textContent = formatCurrencyValue(totalIncome);
    document.getElementById(totalBudgetId).textContent = formatCurrencyValue(totalBudget);
    document.getElementById(totalActualId).textContent = formatCurrencyValue(totalActual);
    document.getElementById(totalDifferenceId).textContent = formatCurrencyValue(totalDifference);
    document.getElementById(totalPercentageId).textContent = `${totalPercentage}%`;
    document.getElementById(netBalanceId).textContent = formatCurrencyValue(totalIncome - totalActual);
}

function updateUI() {
    updateUITable('Mas', transactionsMas, 'transaction-list-mas', 'total-income-mas', 'total-budget-mas', 'total-actual-mas', 'total-difference-mas', 'total-percentage-mas', 'net-balance-mas');
    updateUITable('Adek', transactionsAdek, 'transaction-list-adek', 'total-income-adek', 'total-budget-adek', 'total-actual-adek', 'total-difference-adek', 'total-percentage-adek', 'net-balance-adek');
}

document.getElementById('main-page-link').addEventListener('click', function() {
    document.getElementById('main-page').style.display = 'block';
    document.getElementById('report-page').style.display = 'none';
    document.getElementById('main-page').classList.add('fade-in');
});

document.getElementById('report-page-link').addEventListener('click', function() {
    document.getElementById('main-page').style.display = 'none';
    document.getElementById('report-page').style.display = 'block';
    document.getElementById('report-page').classList.add('fade-in');
    generateMonthlyReport();
});

function formatCurrency(input) {
    let value = input.value.replace(/\D/g, '');
    input.value = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function formatCurrencyValue(value) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function saveToCSV(transactions) {
    let csvContent = "data:text/csv;charset=utf-8,User,Type,Description,Category,Budget,Actual,Date,Time\n";
    transactions.forEach(transaction => {
        csvContent += `${transaction.user},${transaction.type},${transaction.description},${transaction.category},${transaction.budget},${transaction.actual},${transaction.date},${transaction.time}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'transactions.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

document.getElementById('backup_button').addEventListener('click', function() {
    const allTransactions = [...transactionsMas, ...transactionsAdek];
    saveToCSV(allTransactions);
});

function updateClock() {
    const now = new Date();
    const dateString = now.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const timeString = now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    document.getElementById('clock').textContent = `${dateString}, ${timeString}`;
}

// Set the date and time when the page loads and update the clock every second
window.onload = function() {
    loadTransactionsFromLocalStorage();
    updateClock();
    setInterval(updateClock, 1000);
};
