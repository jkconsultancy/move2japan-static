/**
 * TaskRenderer - Renders task rows
 */
class TaskRenderer {
  constructor(dataManager, dragDropManager, callbacks) {
    this.dataManager = dataManager;
    this.dragDropManager = dragDropManager;
    this.callbacks = callbacks; // { onToggle, onEdit, onDelete, onShowLinks, etc. }
  }

  /**
   * Create a task row element
   */
  createTaskRow(task, categoryIndex, phaseIndex, subcategoryIndex, taskIndex, subtaskIndex = null, isSubtask = false) {
    const swipeContainer = document.createElement('div');
    swipeContainer.className = 'swipe-container';

    const row = document.createElement('div');
    row.className = `swipe-content flex items-center justify-between p-4 transition-colors duration-150 draggable-task ${task.links && task.links.length > 0 ? 'hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer' : ''}`;
    row.setAttribute('data-category-index', categoryIndex);
    row.setAttribute('data-phase-index', phaseIndex);
    row.setAttribute('data-subcategory-index', subcategoryIndex);
    row.setAttribute('data-task-index', taskIndex);
    row.setAttribute('data-task-name', task.name);
    row.draggable = true;
    if (subtaskIndex !== null) {
      row.setAttribute('data-subtask-index', subtaskIndex);
    }

    const hasLinks = task.links && task.links.length > 0;
    const isCompleted = task.completed === true;

    const leftDiv = document.createElement('div');
    leftDiv.className = 'flex items-center space-x-4 flex-1';
    
    // Drag handle for task (left-most item)
    const dragHandle = document.createElement('span');
    dragHandle.className = 'material-symbols-outlined drag-handle text-slate-400 hover:text-slate-600 cursor-move mr-2';
    dragHandle.textContent = 'drag_indicator';
    dragHandle.title = 'Drag to reorder';
    dragHandle.style.pointerEvents = 'auto';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary dark:bg-slate-900 dark:border-slate-600';
    checkbox.checked = isCompleted;
    checkbox.onclick = (e) => {
      e.stopPropagation();
      if (this.callbacks.onToggle) {
        this.callbacks.onToggle(categoryIndex, phaseIndex, subcategoryIndex, taskIndex, subtaskIndex);
      }
      this.updateTaskRow(row, task);
    };

    const label = document.createElement('span');
    label.className = `text-slate-700 dark:text-slate-300 ${isCompleted ? 'strikethrough' : ''} ${hasLinks ? 'cursor-pointer' : 'cursor-text'}`;
    label.textContent = task.name;
    label.contentEditable = false;
    label.setAttribute('data-task-name', task.name);
    
    // Make label editable on double-click
    if (this.callbacks.onEdit) {
      label.ondblclick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (!label.contentEditable || label.contentEditable === 'false') {
          label.contentEditable = true;
          label.focus();
          const range = document.createRange();
          range.selectNodeContents(label);
          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
        }
      };
      
      label.onblur = () => {
        if (label.contentEditable === 'true' || label.contentEditable === true) {
          label.contentEditable = false;
          const newText = label.textContent.trim();
          const taskObj = this.dataManager.getTaskObject(categoryIndex, phaseIndex, subcategoryIndex, taskIndex, subtaskIndex);
          const currentTaskName = taskObj ? taskObj.name : task.name;
          
          if (newText && newText !== currentTaskName && taskObj) {
            taskObj.name = newText;
            if (this.callbacks.onSave) {
              this.callbacks.onSave();
            }
          } else if (!newText) {
            label.textContent = currentTaskName;
          }
        }
      };
      
      label.onkeydown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          label.blur();
        }
        if (e.key === 'Escape') {
          const taskObj = this.dataManager.getTaskObject(categoryIndex, phaseIndex, subcategoryIndex, taskIndex, subtaskIndex);
          const currentTaskName = taskObj ? taskObj.name : task.name;
          label.textContent = currentTaskName;
          label.contentEditable = false;
          label.blur();
        }
      };
    }

    leftDiv.appendChild(dragHandle);
    leftDiv.appendChild(checkbox);
    leftDiv.appendChild(label);

    const rightIcon = document.createElement('span');
    rightIcon.className = 'material-symbols-outlined text-slate-400 dark:text-slate-500';
    rightIcon.textContent = hasLinks ? 'chevron_right' : '';
    rightIcon.style.pointerEvents = 'none';

    row.appendChild(leftDiv);
    row.appendChild(rightIcon);

    // Make entire row clickable (except checkbox, drag handle) to show links
    if (hasLinks && this.callbacks.onShowLinks) {
      row.onclick = (e) => {
        if (e.target.type === 'checkbox' || 
            e.target.classList.contains('drag-handle') || 
            e.target.closest('.drag-handle') ||
            e.target.contentEditable === 'true' || 
            row.classList.contains('swiped')) {
          return;
        }
        this.callbacks.onShowLinks(task.links, task.name, row);
      };
    }

    // Create delete button
    const deleteButton = document.createElement('div');
    deleteButton.className = 'swipe-delete';
    deleteButton.innerHTML = '<span class="material-symbols-outlined">delete</span>';
    deleteButton.onclick = (e) => {
      e.stopPropagation();
      if (this.callbacks.onDelete) {
        this.callbacks.onDelete(categoryIndex, phaseIndex, subcategoryIndex, taskIndex, subtaskIndex, swipeContainer);
      }
    };

    swipeContainer.appendChild(row);
    swipeContainer.appendChild(deleteButton);

    // Add swipe functionality
    if (this.callbacks.addSwipeHandlers) {
      this.callbacks.addSwipeHandlers(row, swipeContainer);
    }
    
    // Setup drag and drop for task
    this.dragDropManager.setupTaskDragAndDrop(row, categoryIndex, phaseIndex, subcategoryIndex, taskIndex);

    return swipeContainer;
  }

  /**
   * Update task row appearance
   */
  updateTaskRow(row, task) {
    const checkbox = row.querySelector('input[type="checkbox"]');
    const label = row.querySelector('span[data-task-name]');
    
    if (checkbox) {
      checkbox.checked = task.completed === true;
    }
    
    if (label) {
      if (task.completed === true) {
        label.classList.add('strikethrough');
      } else {
        label.classList.remove('strikethrough');
      }
    }
  }
}

