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
// const db = mysql.createConnection({
//     host: process.env.DB_HOST || '',
//     user: process.env.DB_USER || '',
//     password: process.env.DB_PASSWORD || '!',
//     database: process.env.DB_NAME || ''
// });



// Connect to database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to MySQL database');
    
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
    });
});

// Routes
app.get('/api/todos', (req, res) => {
    db.query('SELECT * FROM todos ORDER BY created_at DESC', (err, results) => {
        if (err) {
            console.error('Error fetching todos:', err);
            res.status(500).json({ error: 'Error fetching todos' });
            return;
        }
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
            res.status(500).json({ error: 'Error creating todo' });
            return;
        }
        
        const newTodo = {
            id: result.insertId,
            text,
            completed: false,
            created_at: new Date()
        };
        
        res.status(201).json(newTodo);
    });
});

app.patch('/api/todos/:id', (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;
    
    db.query('UPDATE todos SET completed = ? WHERE id = ?', [completed, id], (err, result) => {
        if (err) {
            console.error('Error updating todo:', err);
            res.status(500).json({ error: 'Error updating todo' });
            return;
        }
        
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Todo not found' });
            return;
        }
        
        db.query('SELECT * FROM todos WHERE id = ?', [id], (err, results) => {
            if (err) {
                console.error('Error fetching updated todo:', err);
                res.status(500).json({ error: 'Error fetching updated todo' });
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
            res.status(500).json({ error: 'Error deleting todo' });
            return;
        }
        
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Todo not found' });
            return;
        }
        
        res.status(204).send();
    });
});

app.delete('/api/todos/clear-completed', (req, res) => {
    db.query('DELETE FROM todos WHERE completed = TRUE', (err, result) => {
        if (err) {
            console.error('Error clearing completed todos:', err);
            res.status(500).json({ error: 'Error clearing completed todos' });
            return;
        }
        
        res.status(204).send();
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 