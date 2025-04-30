
const errorHandler = async (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Internal Server Error',
        error: err.message,
    });
    next(err); // Call the next middleware in the stack
}

module.exports = errorHandler;