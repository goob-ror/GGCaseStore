class ApiService {
  constructor() {
    const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
    this.baseURL = isLocalhost
      ? 'http://localhost:3000/api'
      : 'https://api-store.ggcasegroup.id/api';

    // Origins used for building full URLs
    this.apiOrigin = new URL(this.baseURL).origin; // e.g., https://api-store.ggcasegroup.id
    this.staticURL = window.location.origin; // current site origin for frontend assets

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
    // If it's an upload path served by the API, use API origin
    if (path.startsWith('/uploads')) {
      return `${this.apiOrigin}${path}`;
    }
    // Otherwise, use current site origin
    return `${this.staticURL}${path.startsWith('/') ? path : '/' + path}`;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const config = {
      headers: { ...this.defaultHeaders, ...options.headers },
      credentials: 'include', // Include cookies for session management
      ...options
    };

    try {
      const response = await fetch(url, config);

      // Handle different content types
      const contentType = response.headers.get('content-type');
      let data;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
        // Convert any relative /uploads URLs to absolute API URLs
        data = this._makeUploadsAbsolute(data);
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

  // Recursively walk response data and prefix /uploads with API origin
  _makeUploadsAbsolute(payload) {
    if (payload == null) return payload;

    const fix = (val) => {
      if (typeof val === 'string' && val.startsWith('/uploads')) {
        return `${this.apiOrigin}${val}`;
      }
      return val;
    };

    if (Array.isArray(payload)) {
      return payload.map(item => this._makeUploadsAbsolute(item));
    } else if (typeof payload === 'object') {
      const out = {};
      for (const [k, v] of Object.entries(payload)) {
        if (v && typeof v === 'object') {
          out[k] = this._makeUploadsAbsolute(v);
        } else {
          out[k] = fix(v);
        }
      }
      return out;
    }

    return fix(payload);
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

export { ApiService };
