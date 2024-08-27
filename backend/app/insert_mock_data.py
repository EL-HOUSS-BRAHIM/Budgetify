import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv
import os
import random
from datetime import datetime, timedelta

# Load environment variables from .env file
load_dotenv()

# Database configuration using environment variables
DB_CONFIG = {
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASS'),
    'host': os.getenv('DB_HOST'),
    'database': os.getenv('DB_NAME'),
    'raise_on_warnings': True,
    'port': os.getenv('PORT')
}

# Establish a connection to the MySQL database
def create_connection():
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        if connection.is_connected():
            return connection
    except Error as e:
        print(f"Error: {e}")
        return None

# Generate random dates within the last 3 years
def generate_random_date(start_date, end_date):
    delta = end_date - start_date
    random_days = random.randint(0, delta.days)
    return start_date + timedelta(days=random_days)

# Generate mock expenses data
def generate_mock_expenses(num_expenses):
    categories = ['Food', 'Travel', 'Rent', 'Utilities', 'Entertainment', 'Health', 'Education']
    expenses = []
    start_date = datetime.now() - timedelta(days=3*365)
    end_date = datetime.now()

    for i in range(num_expenses):
        expense = {
            'amount': round(random.uniform(5.0, 500.0), 2),
            'category': random.choice(categories),
            'description': f"Expense {i + 1}",
            'date': generate_random_date(start_date, end_date).strftime('%Y-%m-%d')
        }
        expenses.append(expense)
        if (i + 1) % 100 == 0:
            print(f"Generated {i + 1} expenses")

    return expenses

# Generate mock budgets data
def generate_mock_budgets(num_budgets):
    categories = ['Food', 'Travel', 'Rent', 'Utilities', 'Entertainment', 'Health', 'Education']
    budgets = []
    start_date = datetime.now() - timedelta(days=3*365)
    end_date = datetime.now()

    for i in range(num_budgets):
        budget = {
            'category': random.choice(categories),
            'amount': round(random.uniform(500.0, 5000.0), 2),
            'start_date': generate_random_date(start_date, end_date).strftime('%Y-%m-%d'),
            'end_date': generate_random_date(start_date, end_date).strftime('%Y-%m-%d')
        }
        budgets.append(budget)
        if (i + 1) % 100 == 0:
            print(f"Generated {i + 1} budgets")

    return budgets

# Insert data into the expenses table
def insert_expenses(connection, expenses):
    cursor = connection.cursor()
    insert_expense_query = """
    INSERT INTO expense (amount, category, description, date, user_id)
    VALUES (%s, %s, %s, %s, '1')
    """
    for i, expense in enumerate(expenses):
        cursor.execute(insert_expense_query, (
            expense['amount'],
            expense['category'],
            expense['description'],
            expense['date']
        ))
        if (i + 1) % 100 == 0:
            print(f"Inserted {i + 1} expenses")
    connection.commit()
    cursor.close()

# Insert data into the budgets table
def insert_budgets(connection, budgets):
    cursor = connection.cursor()
    insert_budget_query = """
    INSERT INTO budget (category, amount, start_date, end_date, user_id)
    VALUES (%s, %s, %s, %s, '1')
    """
    for i, budget in enumerate(budgets):
        cursor.execute(insert_budget_query, (
            budget['category'],
            budget['amount'],
            budget['start_date'],
            budget['end_date']
        ))
        if (i + 1) % 100 == 0:
            print(f"Inserted {i + 1} budgets")
    connection.commit()
    cursor.close()

# Assert that the data was inserted correctly
def assert_data_insertion(connection, table_name, expected_count):
    cursor = connection.cursor()
    query = f"SELECT COUNT(*) FROM {table_name}"
    cursor.execute(query)
    count = cursor.fetchone()[0]
    cursor.close()
    assert count >= expected_count, f"Expected at least {expected_count} records in {table_name}, found {count}."

# Main function to generate, insert, and verify data
def main():
    connection = create_connection()
    if connection is None:
        return

    num_expenses = 3000
    num_budgets = 1500

    # Generate mock data
    print("Generating mock expenses...")
    mock_expenses = generate_mock_expenses(num_expenses)
    print("Generating mock budgets...")
    mock_budgets = generate_mock_budgets(num_budgets)

    # Insert data into the database
    print("Inserting expenses into the database...")
    insert_expenses(connection, mock_expenses)
    print("Inserting budgets into the database...")
    insert_budgets(connection, mock_budgets)

    # Assert data insertion
    print("Verifying data insertion...")
    assert_data_insertion(connection, 'expense', num_expenses)
    assert_data_insertion(connection, 'budget', num_budgets)

    connection.close()
    print("Mock data generated, inserted, and verified successfully.")

if __name__ == "__main__":
    main()