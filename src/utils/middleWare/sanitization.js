import xss from "xss";

// Middleware to sanitize request inputs
const xssSanitizer = (req, res, next) => {
  // Sanitize request body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  // Sanitize URL params
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

// Helper function to sanitize all fields in an object
function sanitizeObject(obj) {
  if (typeof obj === "object" && obj !== null) {
    for (const key in obj) {
      if (typeof obj[key] === "string") {
        obj[key] = xss(obj[key]);
      } else if (typeof obj[key] === "object") {
        obj[key] = sanitizeObject(obj[key]); // Recursively sanitize nested objects
      }
    }
  }
  return obj;
}

export default xssSanitizer;
