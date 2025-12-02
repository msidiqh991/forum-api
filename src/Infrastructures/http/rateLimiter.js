class RateLimiter {
  constructor() {
    this.requests = new Map();
    this.limit = 90; 
    this.windowMs = 60000; 
    this.minInterval = Math.floor(this.windowMs / this.limit); 
    this.enabled = process.env.NODE_ENV !== 'test'; 
  }

  middleware() {
    return (request, h) => {
      if (!this.enabled) {
        return h.continue;
      }

      const ip = request.info.remoteAddress;
      const now = Date.now();
      
      if (!request.path.startsWith('/threads')) {
        return h.continue;
      }

      if (!this.requests.has(ip)) {
        this.requests.set(ip, []);
      }

      const requestTimes = this.requests.get(ip);
      
      const validRequests = requestTimes.filter(time => now - time < this.windowMs);
      
      if (validRequests.length >= this.limit) {
        const response = h.response({
          status: 'fail',
          message: 'Too many requests, please try again later.',
        });
        response.code(429);
        return response.takeover();
      }

      if (validRequests.length > 0) {
        const lastRequestTime = validRequests[validRequests.length - 1];
        const timeSinceLastRequest = now - lastRequestTime;
        
        if (timeSinceLastRequest < this.minInterval) {
          const response = h.response({
            status: 'fail',
            message: 'Too many requests, please try again later.',
          });
          response.code(429);
          return response.takeover();
        }
      }

      validRequests.push(now);
      this.requests.set(ip, validRequests);

      return h.continue;
    };
  }

  cleanup() {
    const now = Date.now();
    for (const [ip, times] of this.requests.entries()) {
      const validRequests = times.filter(time => now - time < this.windowMs);
      if (validRequests.length === 0) {
        this.requests.delete(ip);
      } else {
        this.requests.set(ip, validRequests);
      }
    }
  }
}

module.exports = RateLimiter;