class TodoApp {
    constructor() {
        this.todos = [];
        this.filter = 'all';
        this.apiUrl = 'http://localhost:3000/api/todos';
        
        // DOM Elements
        this.todoInput = document.getElementById('todoInput');
        this.addTodoBtn = document.getElementById('addTodo');
        this.todoList = document.getElementById('todoList');
        this.itemsLeft = document.getElementById('itemsLeft');
        this.clearCompletedBtn = document.getElementById('clearCompleted');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.themeToggle = document.querySelector('.theme-toggle');
        
        // Event Listeners
        this.addTodoBtn.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => this.setFilter(btn.dataset.filter));
        });
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Initialize
        this.loadTodos();
    }
    
    async loadTodos() {
        try {
            console.log('Loading todos...');
            const response = await fetch(this.apiUrl);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.details || 'Failed to load todos');
            }
            this.todos = await response.json();
            console.log(`Loaded ${this.todos.length} todos`);
            this.renderTodos();
        } catch (error) {
            console.error('Error loading todos:', error);
            this.showNotification(`Error loading todos: ${error.message}`, 'error');
        }
    }
    
    isDuplicate(text) {
        return this.todos.some(todo => 
            todo.text.toLowerCase().trim() === text.toLowerCase().trim()
        );
    }
    
    async addTodo() {
        const text = this.todoInput.value.trim();
        if (!text) {
            this.showNotification('Please enter a todo item', 'warning');
            return;
        }
        
        if (this.isDuplicate(text)) {
            this.showNotification('This todo item already exists', 'warning');
            return;
        }
        
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text }),
            });
            
            if (!response.ok) throw new Error('Failed to add todo');
            
            const newTodo = await response.json();
            this.todos.push(newTodo);
            this.todoInput.value = '';
            this.renderTodos();
            this.showNotification('Todo added successfully', 'success');
        } catch (error) {
            console.error('Error adding todo:', error);
            this.showNotification('Error adding todo', 'error');
        }
    }
    
    async toggleTodo(id) {
        try {
            const todo = this.todos.find(t => t.id === id);
            if (!todo) throw new Error('Todo not found');
            
            const response = await fetch(`${this.apiUrl}/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ completed: !todo.completed }),
            });
            
            if (!response.ok) throw new Error('Failed to update todo');
            
            const updatedTodo = await response.json();
            this.todos = this.todos.map(t => t.id === id ? updatedTodo : t);
            this.renderTodos();
        } catch (error) {
            console.error('Error toggling todo:', error);
            this.showNotification('Error updating todo', 'error');
        }
    }
    
    async deleteTodo(id) {
        try {
            const response = await fetch(`${this.apiUrl}/${id}`, {
                method: 'DELETE',
            });
            
            if (!response.ok) throw new Error('Failed to delete todo');
            
            this.todos = this.todos.filter(t => t.id !== id);
            this.renderTodos();
            this.showNotification('Todo deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting todo:', error);
            this.showNotification('Error deleting todo', 'error');
        }
    }
    
    async clearCompleted() {
        try {
            console.log('Clearing completed todos...');
            const response = await fetch(`${this.apiUrl}/clear-completed`, {
                method: 'DELETE',
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.details || 'Failed to clear completed todos');
            }
            
            console.log(`Cleared ${result.deletedCount} completed todos`);
            
            // Update the todos array by removing completed items
            this.todos = this.todos.filter(todo => !todo.completed);
            this.renderTodos();
            this.showNotification(`Cleared ${result.deletedCount} completed todos`, 'success');
        } catch (error) {
            console.error('Error clearing completed todos:', error);
            this.showNotification(`Error clearing completed todos: ${error.message}`, 'error');
        }
    }
    
    setFilter(filter) {
        this.filter = filter;
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        this.renderTodos();
    }
    
    renderTodos() {
        const filteredTodos = this.todos.filter(todo => {
            if (this.filter === 'active') return !todo.completed;
            if (this.filter === 'completed') return todo.completed;
            return true;
        });
        
        this.todoList.innerHTML = filteredTodos.map(todo => `
            <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                <span class="todo-text">${todo.text}</span>
                <button class="delete-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </li>
        `).join('');
        
        this.itemsLeft.textContent = `${this.todos.filter(t => !t.completed).length} items left`;
        
        // Add event listeners to new elements
        this.todoList.querySelectorAll('.todo-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const todoId = parseInt(e.target.closest('.todo-item').dataset.id);
                this.toggleTodo(todoId);
            });
        });
        
        this.todoList.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const todoId = parseInt(e.target.closest('.todo-item').dataset.id);
                this.deleteTodo(todoId);
            });
        });
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    toggleTheme() {
        document.body.classList.toggle('dark-theme');
        const icon = this.themeToggle.querySelector('i');
        icon.classList.toggle('fa-moon');
        icon.classList.toggle('fa-sun');
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
}); 
