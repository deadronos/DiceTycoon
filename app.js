// DiceTycoon Task Manager Application

// Storage configuration
const STORAGE_KEY = 'dicetycoon.tasks.v1';
const THEME_KEY = 'dicetycoon.theme.v1';

// Safe localStorage wrapper
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

// Application state
let tasks = [];
let currentFilter = 'all';
let nextId = 1;

// DOM elements
let taskForm;
let taskInput;
let tasksList;
let taskCount;
let emptyNote;
let announcer;
let filterButtons;
let themeToggle;

// Initialize application
function init() {
  // Get DOM elements
  taskForm = document.getElementById('task-form');
  taskInput = document.getElementById('task-input');
  tasksList = document.getElementById('tasks');
  taskCount = document.getElementById('task-count');
  emptyNote = document.getElementById('empty-note');
  announcer = document.getElementById('announcer');
  filterButtons = document.querySelectorAll('.filter-btn');
  themeToggle = document.getElementById('theme-toggle');

  // Load saved data
  loadTasks();
  loadTheme();

  // Set up event listeners
  setupEventListeners();

  // Initial render
  render();
}

function setupEventListeners() {
  // Task form submission
  taskForm.addEventListener('submit', handleAddTask);

  // Filter buttons
  filterButtons.forEach(btn => {
    btn.addEventListener('click', handleFilterChange);
  });

  // Theme toggle
  themeToggle.addEventListener('click', handleThemeToggle);

  // Task list delegation for task actions
  tasksList.addEventListener('click', handleTaskAction);
}

function handleAddTask(e) {
  e.preventDefault();

  const text = taskInput.value.trim();
  if (!text) return;

  const newTask = {
    id: nextId++,
    text: text,
    completed: false,
    createdAt: new Date().toISOString()
  };

  tasks.push(newTask);
  taskInput.value = '';

  saveTasks();
  render();

  announce(`Task "${text}" added`);
}

function handleFilterChange(e) {
  const filter = e.target.dataset.filter;
  if (!filter) return;

  currentFilter = filter;

  // Update active filter button
  filterButtons.forEach(btn => btn.classList.remove('active'));
  e.target.classList.add('active');

  render();
  announce(`Showing ${filter} tasks`);
}

function handleThemeToggle() {
  const currentTheme = document.documentElement.dataset.theme;
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  setTheme(newTheme);
  announce(`Switched to ${newTheme} theme`);
}

function handleTaskAction(e) {
  const taskId = parseInt(e.target.dataset.taskId);
  if (!taskId) return;

  if (e.target.classList.contains('task-checkbox')) {
    toggleTask(taskId);
  } else if (e.target.classList.contains('btn-delete')) {
    deleteTask(taskId);
  }
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  task.completed = !task.completed;
  saveTasks();
  render();

  const status = task.completed ? 'completed' : 'uncompleted';
  announce(`Task "${task.text}" marked as ${status}`);
}

function deleteTask(id) {
  const taskIndex = tasks.findIndex(t => t.id === id);
  if (taskIndex === -1) return;

  const task = tasks[taskIndex];
  tasks.splice(taskIndex, 1);

  saveTasks();
  render();

  announce(`Task "${task.text}" deleted`);
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

function render() {
  const filteredTasks = getFilteredTasks();

  // Update task count
  const activeCount = tasks.filter(t => !t.completed).length;
  const totalCount = tasks.length;
  taskCount.textContent = `${activeCount} of ${totalCount} tasks remaining`;

  // Clear and render tasks
  tasksList.innerHTML = '';

  if (filteredTasks.length === 0) {
    emptyNote.style.display = 'block';
    tasksList.style.display = 'none';
  } else {
    emptyNote.style.display = 'none';
    tasksList.style.display = 'flex';

    filteredTasks.forEach(task => {
      const taskElement = createTaskElement(task);
      tasksList.appendChild(taskElement);
    });
  }
}

function createTaskElement(task) {
  const taskItem = document.createElement('div');
  taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;

  taskItem.innerHTML = `
    <div class="task-checkbox ${task.completed ? 'checked' : ''}" data-task-id="${task.id}" aria-label="Toggle task completion"></div>
    <span class="task-text">${escapeHtml(task.text)}</span>
    <div class="task-actions">
      <button class="btn-delete" data-task-id="${task.id}" aria-label="Delete task">Delete</button>
    </div>
  `;

  return taskItem;
}

function loadTasks() {
  const savedTasks = safeLoad(STORAGE_KEY, []);
  if (Array.isArray(savedTasks)) {
    tasks = savedTasks;
    // Update nextId to avoid conflicts
    nextId = Math.max(...tasks.map(t => t.id || 0), 0) + 1;
  }
}

function saveTasks() {
  safeSave(STORAGE_KEY, tasks);
}

function loadTheme() {
  const savedTheme = safeLoad(THEME_KEY, 'light');
  setTheme(savedTheme);
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  safeSave(THEME_KEY, theme);
}

function announce(message) {
  announcer.textContent = message;
  // Clear after announcement is read
  setTimeout(() => {
    announcer.textContent = '';
  }, 1000);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Export for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    safeLoad,
    safeSave,
    escapeHtml
  };
}
