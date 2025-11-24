/**
 * SubcategoryRenderer - Renders subcategory sections
 */
class SubcategoryRenderer {
  constructor(dataManager, dragDropManager, taskRenderer, callbacks) {
    this.dataManager = dataManager;
    this.dragDropManager = dragDropManager;
    this.taskRenderer = taskRenderer;
    this.callbacks = callbacks; // { onToggle, onEdit, onDelete, onToggleSubcategory, etc. }
  }

  /**
   * Create a subcategory element
   */
  createSubcategoryElement(subcategoryKey, subcategory, categoryIndex, phaseIndex, subcategoryIndex) {
    const subSectionDiv = document.createElement('div');
    subSectionDiv.className = 'space-y-4 draggable-subcategory';
    subSectionDiv.dataset.categoryIndex = categoryIndex;
    subSectionDiv.dataset.phaseIndex = phaseIndex;
    subSectionDiv.dataset.subcategoryIndex = subcategoryIndex;
    subSectionDiv.draggable = true;

    // Create swipe container for sub-section header
    const subSectionSwipeContainer = document.createElement('div');
    subSectionSwipeContainer.className = 'swipe-container';

    // Create subcategory header with checkbox
    const subcategoryHeader = document.createElement('div');
    subcategoryHeader.className = 'flex items-center space-x-3 mb-2';
    
    // Drag handle for subcategory (left-most item)
    const dragHandle = document.createElement('span');
    dragHandle.className = 'material-symbols-outlined drag-handle text-slate-400 hover:text-slate-600 cursor-move mr-2';
    dragHandle.textContent = 'drag_indicator';
    dragHandle.title = 'Drag to reorder';
    
    // Subcategory checkbox
    const subcategoryCheckbox = document.createElement('input');
    subcategoryCheckbox.type = 'checkbox';
    subcategoryCheckbox.className = 'h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary dark:bg-slate-900 dark:border-slate-600';
    subcategoryCheckbox.onclick = (e) => {
      e.stopPropagation();
      if (this.callbacks.onToggleSubcategory) {
        this.callbacks.onToggleSubcategory(categoryIndex, phaseIndex, subcategoryIndex, subcategoryCheckbox.checked);
      }
    };
    
    const subSectionTitle = document.createElement('h4');
    subSectionTitle.className = 'swipe-content text-lg font-semibold text-slate-800 dark:text-slate-200 py-2 cursor-pointer editable-title flex items-center flex-1';
    subSectionTitle.contentEditable = false;
    subSectionTitle.setAttribute('data-category-index', categoryIndex);
    subSectionTitle.setAttribute('data-phase-index', phaseIndex);
    subSectionTitle.setAttribute('data-subcategory-index', subcategoryIndex);
    
    // Create title wrapper with title text and disclosure caret
    const titleWrapper = document.createElement('div');
    titleWrapper.className = 'flex items-center flex-1';
    
    // Disclosure caret for expand/collapse
    const subcategoryCaret = document.createElement('span');
    subcategoryCaret.className = 'material-symbols-outlined text-base subcategory-caret mr-2';
    subcategoryCaret.textContent = 'expand_more';
    subcategoryCaret.style.cursor = 'pointer';
    subcategoryCaret.onclick = (e) => {
      e.stopPropagation();
      this.toggleSubcategory(subSectionDiv);
    };
    
    const titleText = document.createElement('span');
    titleText.textContent = subcategoryKey;
    titleText.contentEditable = true;
    titleWrapper.appendChild(subcategoryCaret);
    titleWrapper.appendChild(titleText);
    subSectionTitle.appendChild(titleWrapper);
    
    subcategoryHeader.appendChild(dragHandle);
    subcategoryHeader.appendChild(subcategoryCheckbox);
    subcategoryHeader.appendChild(subSectionTitle);
    
    // Make title editable
    if (this.callbacks.onEditSubcategory) {
      subSectionTitle.onclick = (e) => {
        e.stopPropagation();
        if (!subSectionTitle.classList.contains('swiped') && (!subSectionTitle.contentEditable || subSectionTitle.contentEditable === 'false')) {
          subSectionTitle.contentEditable = true;
          subSectionTitle.focus();
          const range = document.createRange();
          range.selectNodeContents(subSectionTitle);
          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
        }
      };
      
      subSectionTitle.onblur = () => {
        if (subSectionTitle.contentEditable === 'true' || subSectionTitle.contentEditable === true) {
          subSectionTitle.contentEditable = false;
          const newTitle = subSectionTitle.textContent.trim();
          if (newTitle && newTitle !== subcategoryKey) {
            this.callbacks.onEditSubcategory(categoryIndex, phaseIndex, subcategoryIndex, newTitle, subcategoryKey);
          } else if (!newTitle) {
            subSectionTitle.textContent = subcategoryKey;
          }
        }
      };
      
      subSectionTitle.onkeydown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          subSectionTitle.blur();
        }
        if (e.key === 'Escape') {
          subSectionTitle.textContent = subcategoryKey;
          subSectionTitle.contentEditable = false;
          subSectionTitle.blur();
        }
      };
    }

    // Create delete button for sub-section
    const subSectionDeleteButton = document.createElement('div');
    subSectionDeleteButton.className = 'swipe-delete';
    subSectionDeleteButton.innerHTML = '<span class="material-symbols-outlined">delete</span>';
    subSectionDeleteButton.onclick = (e) => {
      e.stopPropagation();
      if (this.callbacks.onDeleteSubcategory) {
        this.callbacks.onDeleteSubcategory(categoryIndex, phaseIndex, subcategoryIndex, subSectionDiv);
      }
    };

    subSectionSwipeContainer.appendChild(subcategoryHeader);
    subSectionSwipeContainer.appendChild(subSectionDeleteButton);

    // Add swipe functionality to sub-section header
    if (this.callbacks.addSwipeHandlers) {
      this.callbacks.addSwipeHandlers(subSectionTitle, subSectionSwipeContainer);
    }

    subSectionDiv.appendChild(subSectionSwipeContainer);

    // Tasks container (collapsible)
    const tasksContainer = document.createElement('div');
    tasksContainer.className = 'subcategory-content divide-y divide-slate-200 dark:divide-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800';
    tasksContainer.style.display = 'block'; // Default to expanded

    // Render tasks
    if (subcategory && Array.isArray(subcategory)) {
      let taskIndex = 0;
      subcategory.forEach((item) => {
        if (this.dataManager.isTaskObject(item)) {
          // It's a task object
          const taskRow = this.taskRenderer.createTaskRow(item, categoryIndex, phaseIndex, subcategoryIndex, taskIndex);
          tasksContainer.appendChild(taskRow);
          
          // Check for nested tasks (subtasks)
          Object.entries(item).forEach(([key, value]) => {
            if (key === 'links' || key === 'tags' || key === 'subtasks') {
              if (key === 'subtasks' && Array.isArray(value)) {
                value.forEach((subItem, subtaskIndex) => {
                  if (this.dataManager.isTaskObject(subItem)) {
                    const subtaskRow = this.taskRenderer.createTaskRow(subItem, categoryIndex, phaseIndex, subcategoryIndex, taskIndex, subtaskIndex, true);
                    tasksContainer.appendChild(subtaskRow);
                  }
                });
              }
              return;
            }
            if (Array.isArray(value)) {
              value.forEach((subItem, subtaskIndex) => {
                if (this.dataManager.isTaskObject(subItem)) {
                  const subtaskRow = this.taskRenderer.createTaskRow(subItem, categoryIndex, phaseIndex, subcategoryIndex, taskIndex, subtaskIndex, true);
                  tasksContainer.appendChild(subtaskRow);
                }
              });
            }
          });
          
          taskIndex++;
        } else if (typeof item === 'object' && item !== null) {
          // It's a nested container - recursively render it
          const containerName = Object.keys(item)[0];
          const containerItems = item[containerName];
          if (Array.isArray(containerItems)) {
            // Create a nested subcategory element
            const nestedSubSectionElement = this.createSubcategoryElement(
              containerName, 
              containerItems, 
              categoryIndex, 
              phaseIndex, 
              subcategoryIndex
            );
            tasksContainer.appendChild(nestedSubSectionElement);
          }
        }
      });
    }
    
    // Add "+ Task" button as last item in tasks container
    if (this.callbacks.onAddTask) {
      const addTaskButton = document.createElement('button');
      addTaskButton.className = 'add-button w-full';
      addTaskButton.innerHTML = '<span class="material-symbols-outlined">add</span><span>New Task</span>';
      addTaskButton.onclick = () => {
        this.callbacks.onAddTask(categoryIndex, phaseIndex, subcategoryIndex, tasksContainer, subSectionDiv);
      };
      tasksContainer.appendChild(addTaskButton);
    }
    
    // Setup drag and drop handlers for tasks container
    this.dragDropManager.setupTaskContainerDragAndDrop(tasksContainer, categoryIndex, phaseIndex, subcategoryIndex);
    
    // Setup drag and drop for subcategory
    this.dragDropManager.setupSubcategoryDragAndDrop(subSectionDiv, categoryIndex, phaseIndex, subcategoryIndex);

    subSectionDiv.appendChild(tasksContainer);

    // Update subcategory checkbox state after tasks are rendered
    setTimeout(() => {
      if (this.callbacks.updateSubcategoryCheckbox) {
        this.callbacks.updateSubcategoryCheckbox(categoryIndex, phaseIndex, subcategoryIndex, subcategoryCheckbox);
      }
    }, 0);

    return subSectionDiv;
  }

  /**
   * Toggle subcategory expand/collapse
   */
  toggleSubcategory(subcategoryDiv) {
    const content = subcategoryDiv.querySelector('.subcategory-content');
    const caret = subcategoryDiv.querySelector('.subcategory-caret');
    if (!content || !caret) return;
    
    const isExpanded = content.style.display !== 'none';

    if (isExpanded) {
      content.style.display = 'none';
      caret.textContent = 'chevron_right';
    } else {
      content.style.display = 'block';
      caret.textContent = 'expand_more';
    }
  }
}

