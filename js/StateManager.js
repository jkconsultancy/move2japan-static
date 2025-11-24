/**
 * StateManager - Manages application state
 * Provides a simple state management pattern for the checklist application
 */
class StateManager {
  constructor() {
    this.state = {
      checklistData: null,
      authToken: null,
      currentUser: null,
      anonymousUserId: null,
      emailGateSuppressed: false,
      isLoading: false,
      error: null
    };
    this.listeners = [];
  }

  /**
   * Get current state
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Get a specific state property
   */
  get(property) {
    return this.state[property];
  }

  /**
   * Set state and notify listeners
   */
  setState(updates) {
    const prevState = { ...this.state };
    this.state = { ...this.state, ...updates };
    this.notifyListeners(prevState, this.state);
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all listeners of state changes
   */
  notifyListeners(prevState, newState) {
    this.listeners.forEach(listener => {
      try {
        listener(prevState, newState);
      } catch (error) {
        console.error('Error in state listener:', error);
      }
    });
  }

  /**
   * Reset state to initial values
   */
  reset() {
    this.setState({
      checklistData: null,
      authToken: null,
      currentUser: null,
      anonymousUserId: null,
      emailGateSuppressed: false,
      isLoading: false,
      error: null
    });
  }
}

// Export singleton instance
const stateManager = new StateManager();

