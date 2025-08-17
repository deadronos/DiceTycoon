// DiceTycoon Task Manager - Main Application Logic

// Storage constants
const STORAGE_KEY = 'dicetycoon.tasks.v1';
const THEME_KEY = 'dicetycoon.theme.v1';

// Application state
let tasks = [];
let currentFilter = 'all';

// Safe localStorage helpers
function safeLoad(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.error('Load failed', key, err);
    return fallback;
  }
}

function safeSave(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('Save failed', key, err);
  }
}

// Task management functions
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function addTask(text) {
  const task = {
    id: generateId(),
    text: text.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
  };

  tasks.unshift(task);
  saveTasks();
  render();
  announce(`Task "${task.text}" added`);
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    render();
    announce(
      `Task "${task.text}" marked as ${task.completed ? 'completed' : 'active'}`
    );
  }
}

function deleteTask(id) {
  const taskIndex = tasks.findIndex(t => t.id === id);
  if (taskIndex !== -1) {
    const task = tasks[taskIndex];
    tasks.splice(taskIndex, 1);
    saveTasks();
    render();
    announce(`Task "${task.text}" deleted`);
  }
}

function getFilteredTasks() {
  switch (currentFilter) {
    case 'active':
      return tasks.filter(task => !task.completed);
    case 'completed':
      return tasks.filter(task => task.completed);
    default:
      return tasks;
  }
}

function saveTasks() {
  safeSave(STORAGE_KEY, tasks);
}

function loadTasks() {
  tasks = safeLoad(STORAGE_KEY, []);
}

// Theme management
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  document.documentElement.setAttribute('data-theme', newTheme);
  safeSave(THEME_KEY, newTheme);

  // Update theme toggle button
  const themeToggle = document.getElementById('theme-toggle');
  themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';

  announce(`Theme switched to ${newTheme} mode`);
}

function loadTheme() {
  const savedTheme = safeLoad(THEME_KEY, 'light');
  document.documentElement.setAttribute('data-theme', savedTheme);

  const themeToggle = document.getElementById('theme-toggle');
  themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
}

// Accessibility announcements
function announce(message) {
  const announcer = document.getElementById('announcer');
  announcer.textContent = message;

  // Clear after a delay to allow re-announcement of the same message
  setTimeout(() => {
    announcer.textContent = '';
  }, 1000);
}

// Rendering functions
function render() {
  renderTasks();
  renderTaskCount();
  renderEmptyState();
  renderFilterButtons();
}

function renderTasks() {
  const tasksContainer = document.getElementById('tasks');
  const filteredTasks = getFilteredTasks();

  tasksContainer.innerHTML = '';

  filteredTasks.forEach(task => {
    const taskElement = createTaskElement(task);
    tasksContainer.appendChild(taskElement);
  });
}

function createTaskElement(task) {
  const li = document.createElement('li');
  li.className = `task-item ${task.completed ? 'completed' : ''}`;
  li.setAttribute('role', 'listitem');

  li.innerHTML = `
    <input 
      type="checkbox" 
      class="task-checkbox" 
      ${task.completed ? 'checked' : ''}
      aria-label="Mark task as ${task.completed ? 'incomplete' : 'complete'}"
    >
    <span class="task-text">${escapeHtml(task.text)}</span>
    <button class="task-delete" aria-label="Delete task '${escapeHtml(task.text)}'">×</button>
  `;

  // Add event listeners
  const checkbox = li.querySelector('.task-checkbox');
  const deleteBtn = li.querySelector('.task-delete');

  checkbox.addEventListener('change', () => toggleTask(task.id));
  deleteBtn.addEventListener('click', () => deleteTask(task.id));

  return li;
}

function renderTaskCount() {
  const countElement = document.getElementById('task-count');
  const activeTasks = tasks.filter(task => !task.completed);
  const count = activeTasks.length;

  countElement.textContent = `${count} ${count === 1 ? 'task' : 'tasks'}`;
}

function renderEmptyState() {
  const emptyNote = document.getElementById('empty-note');
  const filteredTasks = getFilteredTasks();

  if (filteredTasks.length === 0) {
    emptyNote.classList.remove('hidden');
    emptyNote.textContent =
      tasks.length === 0
        ? 'No tasks yet. Add one above to get started!'
        : `No ${currentFilter} tasks found.`;
  } else {
    emptyNote.classList.add('hidden');
  }
}

function renderFilterButtons() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === currentFilter);
  });
}

// Utility functions
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Event listeners
function setupEventListeners() {
  // Task form submission
  const taskForm = document.getElementById('task-form');
  const taskInput = document.getElementById('task-input');

  taskForm.addEventListener('submit', e => {
    e.preventDefault();
    const text = taskInput.value.trim();

    if (text) {
      addTask(text);
      taskInput.value = '';
      taskInput.focus();
    }
  });

  // Filter buttons
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.filter;
      render();
      announce(`Showing ${currentFilter} tasks`);
    });
  });

  // Theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  themeToggle.addEventListener('click', toggleTheme);

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    // Alt + N: Focus on new task input
    if (e.altKey && e.key === 'n') {
      e.preventDefault();
      taskInput.focus();
    }

    // Alt + T: Toggle theme
    if (e.altKey && e.key === 't') {
      e.preventDefault();
      toggleTheme();
    }
  });
}

// Application initialization
function init() {
  try {
    loadTheme();
    loadTasks();
    setupEventListeners();
    render();

    // Focus on input for better UX
    const taskInput = document.getElementById('task-input');
    taskInput.focus();

    console.log('DiceTycoon Task Manager initialized successfully');
    console.log(`Loaded ${tasks.length} tasks from storage`);
  } catch (error) {
    console.error('Failed to initialize application:', error);
    announce('Application failed to load properly');
  }
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Export for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    addTask,
    toggleTask,
    deleteTask,
    safeLoad,
    safeSave,
    STORAGE_KEY,
    THEME_KEY,
  };
}
