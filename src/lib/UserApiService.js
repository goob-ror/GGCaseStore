class UserApiService {
  constructor() {
    this.baseURL = 'http://localhost:3000/api';
    // Use current origin for static files (proxied through webpack dev server)
    this.staticURL = window.location.origin;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Get full URL for static files (images, etc.)
   */
  getStaticURL(path) {
    if (!path) return '';
    if (path.startsWith('http')) return path; // Already full URL
    return `${this.staticURL}${path.startsWith('/') ? path : '/' + path}`;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: { ...this.defaultHeaders, ...options.headers },
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      // Handle different content types
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        // If it's JSON error response, use the error message from the response
        if (typeof data === 'object' && (data.message || data.error)) {
          throw new Error(data.message || data.error);
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }

      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, {
      method: 'GET'
    });
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }

  async uploadFile(endpoint, formData) {
    return this.request(endpoint, {
      method: 'POST',
      body: formData,
      headers: {} // Let browser set Content-Type for FormData
    });
  }

  // Utility methods for common API patterns
  async getAll(resource) {
    return this.get(`/${resource}`);
  }

  async getById(resource, id) {
    return this.get(`/${resource}/${id}`);
  }

  async create(resource, data) {
    return this.post(`/${resource}`, data);
  }

  async update(resource, id, data) {
    return this.put(`/${resource}/${id}`, data);
  }

  async remove(resource, id) {
    return this.delete(`/${resource}/${id}`);
  }
}

export { UserApiService };
