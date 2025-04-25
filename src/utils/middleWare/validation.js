export const validation = (schema) => {
  return (req, res, next) => {
    let inputs ={...req.body,...req.params,...req.query}
    const { error } = schema.validate(inputs, { abortEarly: false });
    if (error) {
        let errors = error.details.map((err) => err.message);
        res.status(400).json({message : "Validation error",err:errors})
    }
    next();
  };
};
