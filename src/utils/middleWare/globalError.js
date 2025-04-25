export const globalError = (err, req, res, next) => {
  if (process.env.MODE == "dev") {
    res.status(400).json({ err: err.message, stack: err.stack });
  } else {
    res.status(400).json({ err: err.message });
  }
};
