/**
 * PhaseRenderer - Renders phase sections
 */
class PhaseRenderer {
  constructor(dataManager, dragDropManager, subcategoryRenderer, callbacks) {
    this.dataManager = dataManager;
    this.dragDropManager = dragDropManager;
    this.subcategoryRenderer = subcategoryRenderer;
    this.callbacks = callbacks; // { onToggle, onEdit, onDelete, onTogglePhase, onAddCategory, etc. }
  }

  /**
   * Create a phase element
   */
  createPhaseElement(phaseName, phase, categoryIndex, phaseIndex, isFirstPhase = true) {
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'space-y-4 draggable-phase';
    categoryDiv.dataset.categoryIndex = categoryIndex;
    categoryDiv.dataset.phaseIndex = phaseIndex;
    categoryDiv.draggable = true;

    // Create swipe container for phase header
    const phaseHeaderSwipeContainer = document.createElement('div');
    phaseHeaderSwipeContainer.className = 'swipe-container';

    // Category header
    const headerDiv = document.createElement('div');
    headerDiv.className = 'swipe-content flex justify-between items-center cursor-pointer';
    headerDiv.setAttribute('data-category-index', categoryIndex);
    headerDiv.setAttribute('data-phase-index', phaseIndex);
    
    // Drag handle
    const dragHandle = document.createElement('span');
    dragHandle.className = 'material-symbols-outlined drag-handle text-slate-400 hover:text-slate-600 cursor-move mr-2';
    dragHandle.textContent = 'drag_indicator';
    dragHandle.title = 'Drag to reorder';
    
    // Left side with checkbox and title
    const leftHeaderDiv = document.createElement('div');
    leftHeaderDiv.className = 'flex items-center space-x-3 flex-1';
    leftHeaderDiv.onclick = (e) => {
      if (e.target.type !== 'checkbox' && e.target !== leftHeaderDiv.querySelector('input[type="checkbox"]')) {
        this.toggleCategory(categoryDiv);
      }
    };

    // Phase checkbox
    const phaseCheckbox = document.createElement('input');
    phaseCheckbox.type = 'checkbox';
    phaseCheckbox.className = 'h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary dark:bg-slate-900 dark:border-slate-600';
    phaseCheckbox.onclick = (e) => {
      e.stopPropagation();
      if (this.callbacks.onTogglePhase) {
        this.callbacks.onTogglePhase(categoryIndex, phaseIndex, phaseCheckbox.checked);
      }
    };

    const titleDiv = document.createElement('div');
    const titleH3 = document.createElement('h3');
    titleH3.className = 'text-xl font-bold text-slate-900 dark:text-white editable-title';
    titleH3.textContent = phaseName;
    titleH3.contentEditable = false;
    titleH3.setAttribute('data-category-index', categoryIndex);
    titleH3.setAttribute('data-phase-index', phaseIndex);
    
    // Make title editable on double-click (to avoid interfering with phase expand/collapse)
    if (this.callbacks.onEditPhase) {
      titleH3.ondblclick = (e) => {
        e.stopPropagation();
        if (!titleH3.contentEditable || titleH3.contentEditable === 'false') {
          titleH3.contentEditable = true;
          titleH3.focus();
          const range = document.createRange();
          range.selectNodeContents(titleH3);
          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
        }
      };
      
      titleH3.onblur = () => {
        if (titleH3.contentEditable === 'true' || titleH3.contentEditable === true) {
          titleH3.contentEditable = false;
          const newTitle = titleH3.textContent.trim();
          if (newTitle && newTitle !== phaseName) {
            this.callbacks.onEditPhase(categoryIndex, phaseIndex, newTitle, phaseName);
          } else if (!newTitle) {
            titleH3.textContent = phaseName;
          }
        }
      };
      
      titleH3.onkeydown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          titleH3.blur();
        }
        if (e.key === 'Escape') {
          titleH3.textContent = phaseName;
          titleH3.contentEditable = false;
          titleH3.blur();
        }
      };
    }

    titleDiv.appendChild(titleH3);
    leftHeaderDiv.appendChild(dragHandle);
    leftHeaderDiv.appendChild(phaseCheckbox);
    leftHeaderDiv.appendChild(titleDiv);

    const progressDiv = document.createElement('div');
    progressDiv.className = 'flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400';
    progressDiv.innerHTML = `
      <span class="category-progress-text">0% Complete</span>
      <span class="material-symbols-outlined text-base category-caret">${isFirstPhase ? 'expand_more' : 'chevron_right'}</span>
    `;
    progressDiv.onclick = (e) => {
      e.stopPropagation();
      this.toggleCategory(categoryDiv);
    };

    headerDiv.appendChild(leftHeaderDiv);
    headerDiv.appendChild(progressDiv);

    // Create delete button for phase
    const phaseDeleteButton = document.createElement('div');
    phaseDeleteButton.className = 'swipe-delete';
    phaseDeleteButton.innerHTML = '<span class="material-symbols-outlined">delete</span>';
    phaseDeleteButton.onclick = (e) => {
      e.stopPropagation();
      if (this.callbacks.onDeletePhase) {
        this.callbacks.onDeletePhase(categoryIndex, phaseIndex, categoryDiv);
      }
    };

    phaseHeaderSwipeContainer.appendChild(headerDiv);
    phaseHeaderSwipeContainer.appendChild(phaseDeleteButton);

    // Add swipe functionality to phase header
    if (this.callbacks.addSwipeHandlers) {
      this.callbacks.addSwipeHandlers(headerDiv, phaseHeaderSwipeContainer);
    }
    
    // Add drag and drop handlers
    this.dragDropManager.setupPhaseDragAndDrop(categoryDiv, categoryIndex, phaseIndex);

    // Progress bar
    const progressBarDiv = document.createElement('div');
    progressBarDiv.className = 'w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2';
    progressBarDiv.innerHTML = '<div class="category-progress-bar bg-primary h-2 rounded-full transition-all duration-300" style="width: 0%"></div>';

    // Content container (collapsible)
    const contentDiv = document.createElement('div');
    contentDiv.className = 'category-content space-y-6';
    contentDiv.style.display = isFirstPhase ? 'block' : 'none'; // First phase expanded, others collapsed

    // Render sub-sections
    if (Array.isArray(phase)) {
      phase.forEach((subcategoryObj, subcategoryIndex) => {
        const subcategoryName = Object.keys(subcategoryObj)[0];
        const subcategory = subcategoryObj[subcategoryName];
        // Only render if it's a container (array), not a task object
        if (Array.isArray(subcategory)) {
          const subSectionElement = this.subcategoryRenderer.createSubcategoryElement(
            subcategoryName, 
            subcategory, 
            categoryIndex, 
            phaseIndex, 
            subcategoryIndex
          );
          contentDiv.appendChild(subSectionElement);
        }
      });
    }

    // Add "+ Category" button as last item in phase
    if (this.callbacks.onAddCategory) {
      const addCategoryButton = document.createElement('button');
      addCategoryButton.className = 'add-button w-full';
      addCategoryButton.innerHTML = '<span class="material-symbols-outlined">add</span><span>New Category</span>';
      addCategoryButton.onclick = () => {
        this.callbacks.onAddCategory(categoryIndex, phaseIndex, contentDiv);
      };
      contentDiv.appendChild(addCategoryButton);
    }

    categoryDiv.appendChild(phaseHeaderSwipeContainer);
    categoryDiv.appendChild(progressBarDiv);
    categoryDiv.appendChild(contentDiv);

    // Update category progress and checkbox state after rendering
    setTimeout(() => {
      if (this.callbacks.updateCategoryProgress) {
        this.callbacks.updateCategoryProgress(categoryIndex, phaseIndex);
      }
      if (this.callbacks.updatePhaseCheckbox) {
        this.callbacks.updatePhaseCheckbox(categoryIndex, phaseIndex, phaseCheckbox);
      }
    }, 0);

    return categoryDiv;
  }

  /**
   * Toggle category expand/collapse
   */
  toggleCategory(categoryDiv) {
    const content = categoryDiv.querySelector('.category-content');
    const caret = categoryDiv.querySelector('.category-caret');
    if (!content || !caret) return;
    
    const isExpanded = content.style.display !== 'none';

    if (isExpanded) {
      content.style.display = 'none';
      caret.textContent = 'chevron_right';
      caret.style.transform = 'rotate(0deg)';
    } else {
      content.style.display = 'block';
      caret.textContent = 'expand_more';
    }
  }
}

