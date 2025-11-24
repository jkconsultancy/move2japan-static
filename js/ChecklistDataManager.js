/**
 * ChecklistDataManager - Centralized data access layer
 * Handles all operations on checklist data structure
 */
class ChecklistDataManager {
  constructor(stateManager) {
    this.stateManager = stateManager;
  }

  /**
   * Get checklist data from state
   */
  getChecklistData() {
    return this.stateManager.get('checklistData');
  }

  /**
   * Set checklist data in state
   */
  setChecklistData(data) {
    this.stateManager.setState({ checklistData: data });
  }

  /**
   * Get category data by index
   */
  getCategoryData(categoryIndex) {
    const checklistData = this.getChecklistData();
    if (!checklistData || !Array.isArray(checklistData) || categoryIndex >= checklistData.length) {
      return null;
    }
    
    const categoryObj = checklistData[categoryIndex];
    const categoryName = Object.keys(categoryObj)[0];
    const category = categoryObj[categoryName];
    
    if (!Array.isArray(category)) {
      return null;
    }
    
    const phases = category;
    
    return {
      name: categoryName,
      phases: phases
    };
  }

  /**
   * Get phase data by indices
   */
  getPhaseData(categoryIndex, phaseIndex) {
    const category = this.getCategoryData(categoryIndex);
    if (!category || !category.phases || phaseIndex >= category.phases.length) {
      return null;
    }
    
    const phaseObj = category.phases[phaseIndex];
    const phaseName = Object.keys(phaseObj)[0];
    const phase = phaseObj[phaseName];
    
    if (!Array.isArray(phase)) {
      return null;
    }
    
    const subcategories = phase;
    
    return {
      name: phaseName,
      subcategories: subcategories
    };
  }

  /**
   * Get subcategory data by indices
   */
  getSubcategoryData(categoryIndex, phaseIndex, subcategoryIndex) {
    const phase = this.getPhaseData(categoryIndex, phaseIndex);
    if (!phase || !phase.subcategories || subcategoryIndex >= phase.subcategories.length) {
      return null;
    }
    
    const subcategoryObj = phase.subcategories[subcategoryIndex];
    const subcategoryName = Object.keys(subcategoryObj)[0];
    const subcategory = subcategoryObj[subcategoryName];
    
    if (!Array.isArray(subcategory)) {
      return null;
    }
    
    const items = subcategory;
    
    return {
      name: subcategoryName,
      items: items
    };
  }

  /**
   * Get task object by indices
   */
  getTaskObject(categoryIndex, phaseIndex, subcategoryIndex, taskIndex, subtaskIndex = null) {
    const { items } = this.getSubcategoryData(categoryIndex, phaseIndex, subcategoryIndex);
    if (!items || !Array.isArray(items)) return null;
    
    let currentTaskIndex = 0;
    
    for (const item of items) {
      if (this.isTaskObject(item)) {
        if (currentTaskIndex === taskIndex) {
          // Found the task
          if (subtaskIndex !== null) {
            // Look for subtask in nested arrays
            for (const [key, value] of Object.entries(item)) {
              if (key === 'links' || key === 'tags') continue;
              if (Array.isArray(value)) {
                let currentSubtaskIndex = 0;
                for (const subItem of value) {
                  if (this.isTaskObject(subItem)) {
                    if (currentSubtaskIndex === subtaskIndex) {
                      return subItem;
                    }
                    currentSubtaskIndex++;
                  }
                }
              }
            }
            return null; // Subtask not found
          }
          return item;
        }
        currentTaskIndex++;
      }
    }
    
    return null; // Task not found
  }

  /**
   * Check if an object is a task object
   */
  isTaskObject(item) {
    return item && 
           typeof item === 'object' && 
           item !== null && 
           'name' in item && 
           typeof item.name === 'string' &&
           !Array.isArray(item.name);
  }

  /**
   * Reorder phase in data structure
   */
  reorderPhase(categoryIndex, fromIndex, toIndex) {
    const category = this.getCategoryData(categoryIndex);
    if (!category || !category.phases || fromIndex === toIndex || fromIndex < 0 || toIndex < 0) {
      return false;
    }
    
    if (fromIndex >= category.phases.length || toIndex >= category.phases.length) {
      console.error('Invalid phase indices:', { fromIndex, toIndex, phasesLength: category.phases.length });
      return false;
    }
    
    const [movedPhase] = category.phases.splice(fromIndex, 1);
    category.phases.splice(toIndex, 0, movedPhase);
    
    return true;
  }

  /**
   * Reorder subcategory in data structure
   */
  reorderSubcategory(categoryIndex, phaseIndex, fromIndex, toIndex) {
    const phase = this.getPhaseData(categoryIndex, phaseIndex);
    if (!phase || !phase.subcategories || fromIndex === toIndex || fromIndex < 0 || toIndex < 0) {
      return false;
    }
    
    if (fromIndex >= phase.subcategories.length || toIndex >= phase.subcategories.length) {
      console.error('Invalid subcategory indices:', { fromIndex, toIndex, subcategoriesLength: phase.subcategories.length });
      return false;
    }
    
    const [movedSubcategory] = phase.subcategories.splice(fromIndex, 1);
    phase.subcategories.splice(toIndex, 0, movedSubcategory);
    
    return true;
  }

  /**
   * Reorder task in data structure
   */
  reorderTask(categoryIndex, phaseIndex, subcategoryIndex, fromIndex, toIndex) {
    const { items } = this.getSubcategoryData(categoryIndex, phaseIndex, subcategoryIndex);
    if (!items || !Array.isArray(items) || fromIndex === toIndex) {
      return false;
    }
    
    // Filter to only tasks (not nested containers) for reordering
    const taskItems = items.filter(item => this.isTaskObject(item));
    if (fromIndex < 0 || toIndex < 0 || fromIndex >= taskItems.length || toIndex > taskItems.length) {
      console.error('Invalid task indices:', { fromIndex, toIndex, taskItemsLength: taskItems.length });
      return false;
    }
    
    // Find the actual indices in the items array
    let actualFromIndex = -1;
    let actualToIndex = -1;
    let taskCount = 0;
    
    for (let i = 0; i < items.length; i++) {
      if (this.isTaskObject(items[i])) {
        if (taskCount === fromIndex) actualFromIndex = i;
        if (taskCount === toIndex) actualToIndex = i;
        taskCount++;
      }
    }
    
    // Handle case where toIndex is after the last task (append to end)
    if (toIndex === taskItems.length && actualFromIndex !== -1) {
      const [movedTask] = items.splice(actualFromIndex, 1);
      items.push(movedTask);
      return true;
    }
    
    if (actualFromIndex === -1 || actualToIndex === -1) {
      console.error('Could not find task indices:', { actualFromIndex, actualToIndex, fromIndex, toIndex });
      return false;
    }
    
    const [movedTask] = items.splice(actualFromIndex, 1);
    items.splice(actualToIndex, 0, movedTask);
    
    return true;
  }

  /**
   * Toggle task completion
   */
  toggleTask(categoryIndex, phaseIndex, subcategoryIndex, taskIndex, subtaskIndex = null) {
    const task = this.getTaskObject(categoryIndex, phaseIndex, subcategoryIndex, taskIndex, subtaskIndex);
    if (!task) return false;
    
    task.completed = !task.completed;
    return true;
  }

  /**
   * Set task completion state
   */
  setTaskCompleted(categoryIndex, phaseIndex, subcategoryIndex, taskIndex, completed, subtaskIndex = null) {
    const task = this.getTaskObject(categoryIndex, phaseIndex, subcategoryIndex, taskIndex, subtaskIndex);
    if (!task) return false;
    
    task.completed = completed;
    return true;
  }

  /**
   * Recursively set all tasks in a phase to completed state
   */
  setPhaseTasksCompleted(categoryIndex, phaseIndex, completed) {
    const phase = this.getPhaseData(categoryIndex, phaseIndex);
    if (!phase || !phase.subcategories) return false;
    
    const taskObjects = [];
    this.collectTasksFromArray(phase.subcategories, taskObjects);
    
    taskObjects.forEach(task => {
      task.completed = completed;
    });
    
    return true;
  }

  /**
   * Recursively set all tasks in a subcategory to completed state
   */
  setSubcategoryTasksCompleted(categoryIndex, phaseIndex, subcategoryIndex, completed) {
    const { items } = this.getSubcategoryData(categoryIndex, phaseIndex, subcategoryIndex);
    if (!items || !Array.isArray(items)) return false;
    
    const taskObjects = [];
    this.collectTasksFromArray(items, taskObjects);
    
    taskObjects.forEach(task => {
      task.completed = completed;
    });
    
    return true;
  }

  /**
   * Recursively collect all task objects from an array
   */
  collectTasksFromArray(arr, taskObjects) {
    if (!Array.isArray(arr)) return;
    
    arr.forEach((item) => {
      if (this.isTaskObject(item)) {
        taskObjects.push(item);
        
        // Check for nested tasks in arrays (but skip known non-task arrays)
        Object.entries(item).forEach(([key, value]) => {
          // Skip known non-task properties
          if (key === 'links' || key === 'tags') return;
          
          if (Array.isArray(value)) {
            value.forEach((subItem) => {
              if (this.isTaskObject(subItem)) {
                taskObjects.push(subItem);
              } else if (typeof subItem === 'object' && subItem !== null) {
                // Nested container - recursively process
                Object.values(subItem).forEach(nestedValue => {
                  if (Array.isArray(nestedValue)) {
                    this.collectTasksFromArray(nestedValue, taskObjects);
                  }
                });
              }
            });
          }
        });
      } else if (typeof item === 'object' && item !== null) {
        // Nested container - recursively process all its children
        Object.values(item).forEach(value => {
          if (Array.isArray(value)) {
            this.collectTasksFromArray(value, taskObjects);
          }
        });
      }
    });
  }

  /**
   * Count completed and total tasks in a phase
   */
  countPhaseTasks(categoryIndex, phaseIndex) {
    const phase = this.getPhaseData(categoryIndex, phaseIndex);
    if (!phase || !phase.subcategories) return { completed: 0, total: 0 };
    
    const taskObjects = [];
    this.collectTasksFromArray(phase.subcategories, taskObjects);
    
    const completed = taskObjects.filter(task => task.completed === true).length;
    return { completed, total: taskObjects.length };
  }

  /**
   * Count completed and total tasks in a subcategory
   */
  countSubcategoryTasks(categoryIndex, phaseIndex, subcategoryIndex) {
    const { items } = this.getSubcategoryData(categoryIndex, phaseIndex, subcategoryIndex);
    if (!items || !Array.isArray(items)) return { completed: 0, total: 0 };
    
    const taskObjects = [];
    this.collectTasksFromArray(items, taskObjects);
    
    const completed = taskObjects.filter(task => task.completed === true).length;
    return { completed, total: taskObjects.length };
  }
}

