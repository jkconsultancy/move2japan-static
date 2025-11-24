/**
 * DragDropManager - Centralized drag and drop functionality
 * Handles all drag and drop operations for phases, subcategories, and tasks
 */
class DragDropManager {
  constructor(dataManager, onReorder) {
    this.dataManager = dataManager;
    this.onReorder = onReorder; // Callback when reordering happens
  }

  /**
   * Setup drag and drop for a phase
   */
  setupPhaseDragAndDrop(element, categoryIndex, phaseIndex) {
    element.addEventListener('dragstart', (e) => {
      if (e.target.classList.contains('drag-handle') || e.target.closest('.drag-handle')) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', JSON.stringify({ 
          type: 'phase',
          categoryIndex, 
          phaseIndex 
        }));
        element.classList.add('dragging');
      } else {
        e.preventDefault();
      }
    });
    
    element.addEventListener('dragend', (e) => {
      element.classList.remove('dragging');
      document.querySelectorAll('.draggable-phase').forEach(el => {
        el.classList.remove('drag-over');
      });
    });
    
    element.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (!element.classList.contains('dragging')) {
        element.classList.add('drag-over');
      }
    });
    
    element.addEventListener('dragleave', (e) => {
      element.classList.remove('drag-over');
    });
    
    element.addEventListener('drop', (e) => {
      e.preventDefault();
      element.classList.remove('drag-over');
      
      try {
        const data = JSON.parse(e.dataTransfer.getData('text/plain'));
        if (data.type !== 'phase') return;
        
        const sourceCategoryIndex = data.categoryIndex;
        const sourcePhaseIndex = data.phaseIndex;
        const targetCategoryIndex = parseInt(element.dataset.categoryIndex);
        const targetPhaseIndex = parseInt(element.dataset.phaseIndex);
        
        if (sourceCategoryIndex === targetCategoryIndex && sourcePhaseIndex !== targetPhaseIndex) {
          // Find the new index based on DOM position
          const container = element.parentElement;
          const draggedElement = document.querySelector('.dragging');
          const targetIndex = Array.from(container.children).indexOf(element);
          const sourceIndex = Array.from(container.children).indexOf(draggedElement);
          
          // Update DOM first for visual feedback
          if (targetIndex < sourceIndex) {
            container.insertBefore(draggedElement, element);
          } else {
            container.insertBefore(draggedElement, element.nextSibling);
          }
          
          // Then update data structure
          if (this.dataManager.reorderPhase(targetCategoryIndex, sourcePhaseIndex, targetPhaseIndex)) {
            this.onReorder('phase', targetCategoryIndex, sourcePhaseIndex, targetPhaseIndex);
          }
        }
      } catch (error) {
        console.error('Error parsing drag data:', error);
      }
    });
  }

  /**
   * Setup drag and drop for a subcategory
   */
  setupSubcategoryDragAndDrop(element, categoryIndex, phaseIndex, subcategoryIndex) {
    element.addEventListener('dragstart', (e) => {
      if (e.target.classList.contains('drag-handle') || e.target.closest('.drag-handle')) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', JSON.stringify({ 
          type: 'subcategory',
          categoryIndex, 
          phaseIndex, 
          subcategoryIndex 
        }));
        element.classList.add('dragging');
      } else {
        e.preventDefault();
      }
    });
    
    element.addEventListener('dragend', (e) => {
      element.classList.remove('dragging');
      document.querySelectorAll('.draggable-subcategory').forEach(el => {
        el.classList.remove('drag-over');
      });
    });
    
    element.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (!element.classList.contains('dragging')) {
        element.classList.add('drag-over');
      }
    });
    
    element.addEventListener('dragleave', (e) => {
      element.classList.remove('drag-over');
    });
    
    element.addEventListener('drop', (e) => {
      e.preventDefault();
      element.classList.remove('drag-over');
      
      try {
        const data = JSON.parse(e.dataTransfer.getData('text/plain'));
        if (data.type !== 'subcategory') return;
        
        const sourceCategoryIndex = data.categoryIndex;
        const sourcePhaseIndex = data.phaseIndex;
        const sourceSubcategoryIndex = data.subcategoryIndex;
        const targetCategoryIndex = parseInt(element.dataset.categoryIndex);
        const targetPhaseIndex = parseInt(element.dataset.phaseIndex);
        const targetSubcategoryIndex = parseInt(element.dataset.subcategoryIndex);
        
        if (sourceCategoryIndex === targetCategoryIndex && 
            sourcePhaseIndex === targetPhaseIndex && 
            sourceSubcategoryIndex !== targetSubcategoryIndex) {
          if (this.dataManager.reorderSubcategory(categoryIndex, phaseIndex, sourceSubcategoryIndex, targetSubcategoryIndex)) {
            this.onReorder('subcategory', categoryIndex, phaseIndex, sourceSubcategoryIndex, targetSubcategoryIndex);
          }
        }
      } catch (error) {
        console.error('Error parsing drag data:', error);
      }
    });
  }

  /**
   * Setup drag and drop for tasks container (handles drops on empty space)
   */
  setupTaskContainerDragAndDrop(container, categoryIndex, phaseIndex, subcategoryIndex) {
    container.addEventListener('dragover', (e) => {
      try {
        const dragData = e.dataTransfer.getData('text/plain');
        if (!dragData) {
          const items = e.dataTransfer.items;
          if (items && items.length > 0) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
          }
          return;
        }
        
        const data = JSON.parse(dragData);
        if (data.type === 'task' &&
            data.categoryIndex === categoryIndex && 
            data.phaseIndex === phaseIndex && 
            data.subcategoryIndex === subcategoryIndex) {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
        }
      } catch (error) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      }
    });
    
    container.addEventListener('drop', (e) => {
      e.preventDefault();
      
      try {
        const data = JSON.parse(e.dataTransfer.getData('text/plain'));
        if (data.type !== 'task') return;
        
        const sourceCategoryIndex = data.categoryIndex;
        const sourcePhaseIndex = data.phaseIndex;
        const sourceSubcategoryIndex = data.subcategoryIndex;
        const sourceTaskIndex = data.taskIndex;
        
        // Find the task row that was dropped on (or the last task if dropped on empty space)
        const taskRows = Array.from(container.querySelectorAll('.draggable-task'));
        let targetTaskIndex = taskRows.length; // Default to last position (after all tasks)
        
        // Try to find which task row was dropped on based on Y position
        for (let i = 0; i < taskRows.length; i++) {
          const rect = taskRows[i].getBoundingClientRect();
          const midPoint = rect.top + (rect.height / 2);
          if (e.clientY <= midPoint) {
            targetTaskIndex = parseInt(taskRows[i].dataset.taskIndex);
            break;
          }
          if (i === taskRows.length - 1) {
            // Dropped after last task
            targetTaskIndex = parseInt(taskRows[i].dataset.taskIndex) + 1;
          }
        }
        
        if (sourceCategoryIndex === categoryIndex && 
            sourcePhaseIndex === phaseIndex && 
            sourceSubcategoryIndex === subcategoryIndex && 
            sourceTaskIndex !== targetTaskIndex) {
          if (this.dataManager.reorderTask(categoryIndex, phaseIndex, subcategoryIndex, sourceTaskIndex, targetTaskIndex)) {
            this.onReorder('task', categoryIndex, phaseIndex, subcategoryIndex, sourceTaskIndex, targetTaskIndex);
          }
        }
      } catch (error) {
        console.error('Error handling container drop:', error);
      }
    });
  }

  /**
   * Setup drag and drop for a task
   */
  setupTaskDragAndDrop(element, categoryIndex, phaseIndex, subcategoryIndex, taskIndex) {
    element.addEventListener('dragstart', (e) => {
      if (e.target.classList.contains('drag-handle') || e.target.closest('.drag-handle')) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', JSON.stringify({ 
          type: 'task',
          categoryIndex, 
          phaseIndex, 
          subcategoryIndex, 
          taskIndex 
        }));
        element.classList.add('dragging');
      } else {
        e.preventDefault();
      }
    });
    
    element.addEventListener('dragend', (e) => {
      element.classList.remove('dragging');
      document.querySelectorAll('.draggable-task').forEach(el => {
        el.classList.remove('drag-over');
      });
    });
    
    element.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (!element.classList.contains('dragging')) {
        element.classList.add('drag-over');
      }
    });
    
    element.addEventListener('dragleave', (e) => {
      element.classList.remove('drag-over');
    });
    
    element.addEventListener('drop', (e) => {
      e.preventDefault();
      element.classList.remove('drag-over');
      
      try {
        const data = JSON.parse(e.dataTransfer.getData('text/plain'));
        if (data.type !== 'task') return;
        
        const sourceCategoryIndex = data.categoryIndex;
        const sourcePhaseIndex = data.phaseIndex;
        const sourceSubcategoryIndex = data.subcategoryIndex;
        const sourceTaskIndex = data.taskIndex;
        const targetCategoryIndex = parseInt(element.dataset.categoryIndex);
        const targetPhaseIndex = parseInt(element.dataset.phaseIndex);
        const targetSubcategoryIndex = parseInt(element.dataset.subcategoryIndex);
        const targetTaskIndex = parseInt(element.dataset.taskIndex);
        
        if (sourceCategoryIndex === targetCategoryIndex && 
            sourcePhaseIndex === targetPhaseIndex && 
            sourceSubcategoryIndex === targetSubcategoryIndex && 
            sourceTaskIndex !== targetTaskIndex) {
          if (this.dataManager.reorderTask(categoryIndex, phaseIndex, subcategoryIndex, sourceTaskIndex, targetTaskIndex)) {
            this.onReorder('task', categoryIndex, phaseIndex, subcategoryIndex, sourceTaskIndex, targetTaskIndex);
          }
        }
      } catch (error) {
        console.error('Error parsing drag data:', error);
      }
    });
  }
}

