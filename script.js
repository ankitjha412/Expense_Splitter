let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let people = JSON.parse(localStorage.getItem('people')) || [];

document.addEventListener('DOMContentLoaded', () => {
    loadPeople();
    loadExpenses();
});

function loadPeople() {
    updatePeopleOptions();
}

function addPerson() {
    const personName = document.getElementById('personName').value.trim(); // Use input field instead of prompt
    if (personName) {
        const newPerson = { name: personName, image: 'default.jpg' };
        people.push(newPerson);
        savePeople();
        updatePeopleOptions();
        document.getElementById('personName').value = ''; // Clear the input field after adding
    }
}

function removePerson(index) {
    people.splice(index, 1);
    savePeople();
    updatePeopleOptions();
}

function updatePeopleOptions() {
    const payerSelect = document.getElementById('payer');
    const peopleSelect = document.getElementById('people');
    const peopleList = document.getElementById('peopleList');
    
    payerSelect.innerHTML = '';
    peopleSelect.innerHTML = '';
    peopleList.innerHTML = '';

    people.forEach((person, index) => {
        // Update select options for payer
        const option = document.createElement('option');
        option.value = person.name;
        option.textContent = person.name;
        payerSelect.appendChild(option);

        const multiOption = option.cloneNode(true);
        peopleSelect.appendChild(multiOption);

        // Add person to the list with a remove button
        const li = document.createElement('li');
        li.textContent = person.name;

        const removeButton = document.createElement('button1');
        removeButton.textContent = 'X';
        removeButton.onclick = () => removePerson(index); // Attach click handler to remove person
        
        li.appendChild(removeButton);
        peopleList.appendChild(li);
    });
}

function addExpense() {
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const payer = document.getElementById('payer').value;
    const selectedPeople = Array.from(document.getElementById('people').selectedOptions).map(option => option.value);

    const expense = {
        description,
        amount,
        payer,
        people: selectedPeople
    };

    expenses.push(expense);
    saveExpenses();
    displayExpenses();
    document.getElementById('expenseForm').reset();
}

function displayExpenses() {
    const expenseList = document.getElementById('expenses');
    expenseList.innerHTML = '';

    expenses.forEach(expense => {
        const li = document.createElement('li');
        li.textContent = `${expense.description}: $${expense.amount.toFixed(2)} paid by ${expense.payer} and split between ${expense.people.join(', ')}`;
        expenseList.appendChild(li);
    });
}

function saveExpenses() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

function savePeople() {
    localStorage.setItem('people', JSON.stringify(people));
}

function loadExpenses() {
    const storedExpenses = JSON.parse(localStorage.getItem('expenses')) || [];
    storedExpenses.forEach(expense => expenses.push(expense));
    displayExpenses();
}

function calculateSplit() {
    const totals = {};
    const transactions = [];

    // Initialize totals for each person
    people.forEach(person => {
        totals[person.name] = 0;
    });

    // Calculate how much each person owes or should receive
    expenses.forEach(expense => {
        const splitAmount = expense.amount / expense.people.length;

        expense.people.forEach(person => {
            totals[person] -= splitAmount;
        });

        totals[expense.payer] += expense.amount;
    });

    // Create transactions to settle debts
    for (let payer in totals) {
        if (totals[payer] > 0) {
            for (let payee in totals) {
                if (totals[payee] < 0) {
                    const amount = Math.min(totals[payer], -totals[payee]);
                    if (amount > 0) {
                        transactions.push({ payer, payee, amount });
                        totals[payer] -= amount;
                        totals[payee] += amount;
                    }
                }
            }
        }
    }

    displayResults(transactions);
}

function displayResults(transactions) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    if (transactions.length === 0) {
        resultsDiv.textContent = 'All expenses are settled!';
    } else {
        transactions.forEach(transaction => {
            const result = document.createElement('p');
            result.textContent = `${transaction.payee} owes ${transaction.payer} $${transaction.amount.toFixed(2)}`;
            resultsDiv.appendChild(result);
        });
    }
}

function resetExpenses() {
    localStorage.removeItem('expenses');
    expenses = [];
    displayExpenses();
    document.getElementById('results').innerHTML = '';
    document.getElementById('expenseForm').reset();
}
