const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '!Q2w3e4r5t^Y',
    database: process.env.DB_NAME || 'todo_db'
});

// Connect to database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Successfully connected to MySQL database');
    
    // Create todos table if it doesn't exist
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS todos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            text VARCHAR(255) NOT NULL,
            completed BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    
    db.query(createTableQuery, (err) => {
        if (err) {
            console.error('Error creating todos table:', err);
            return;
        }
        console.log('Todos table ready');
        
        // Check if table is empty and add a test todo
        db.query('SELECT COUNT(*) as count FROM todos', (err, results) => {
            if (err) {
                console.error('Error checking todos count:', err);
                return;
            }
            
            if (results[0].count === 0) {
                db.query('INSERT INTO todos (text) VALUES (?)', ['Welcome to Todo App!'], (err) => {
                    if (err) {
                        console.error('Error adding test todo:', err);
                        return;
                    }
                    console.log('Added test todo item');
                });
            }
        });
    });
});

// Handle database connection errors
db.on('error', (err) => {
    console.error('Database error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('Attempting to reconnect to database...');
        db.connect();
    } else {
        throw err;
    }
});

// Routes
app.get('/api/todos', (req, res) => {
    console.log('Fetching todos...');
    db.query('SELECT * FROM todos ORDER BY created_at DESC', (err, results) => {
        if (err) {
            console.error('Error fetching todos:', err);
            res.status(500).json({ 
                error: 'Error fetching todos', 
                details: err.message,
                code: err.code 
            });
            return;
        }
        console.log(`Successfully fetched ${results.length} todos`);
        res.json(results);
    });
});

app.post('/api/todos', (req, res) => {
    const { text } = req.body;
    if (!text) {
        res.status(400).json({ error: 'Text is required' });
        return;
    }
    
    db.query('INSERT INTO todos (text) VALUES (?)', [text], (err, result) => {
        if (err) {
            console.error('Error creating todo:', err);
            res.status(500).json({ 
                error: 'Error creating todo',
                details: err.message,
                code: err.code
            });
            return;
        }
        
        // Fetch the newly created todo
        db.query('SELECT * FROM todos WHERE id = ?', [result.insertId], (err, results) => {
            if (err) {
                console.error('Error fetching new todo:', err);
                res.status(500).json({ 
                    error: 'Error fetching new todo',
                    details: err.message,
                    code: err.code
                });
                return;
            }
            
            res.status(201).json(results[0]);
        });
    });
});

// Move clear-completed route before the :id routes
app.delete('/api/todos/clear-completed', (req, res) => {
    console.log('Clearing completed todos...');
    db.query('DELETE FROM todos WHERE completed = 1', (err, result) => {
        if (err) {
            console.error('Error clearing completed todos:', err);
            res.status(500).json({ 
                error: 'Error clearing completed todos',
                details: err.message,
                code: err.code
            });
            return;
        }
        
        console.log(`Cleared ${result.affectedRows} completed todos`);
        // Return the number of deleted items
        res.json({ deletedCount: result.affectedRows });
    });
});

app.patch('/api/todos/:id', (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;
    
    db.query('UPDATE todos SET completed = ? WHERE id = ?', [completed, id], (err, result) => {
        if (err) {
            console.error('Error updating todo:', err);
            res.status(500).json({ 
                error: 'Error updating todo',
                details: err.message,
                code: err.code
            });
            return;
        }
        
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Todo not found' });
            return;
        }
        
        // Fetch the updated todo
        db.query('SELECT * FROM todos WHERE id = ?', [id], (err, results) => {
            if (err) {
                console.error('Error fetching updated todo:', err);
                res.status(500).json({ 
                    error: 'Error fetching updated todo',
                    details: err.message,
                    code: err.code
                });
                return;
            }
            
            res.json(results[0]);
        });
    });
});

app.delete('/api/todos/:id', (req, res) => {
    const { id } = req.params;
    
    db.query('DELETE FROM todos WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.error('Error deleting todo:', err);
            res.status(500).json({ 
                error: 'Error deleting todo',
                details: err.message,
                code: err.code
            });
            return;
        }
        
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Todo not found' });
            return;
        }
        
        res.status(204).send();
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        details: err.message
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 
