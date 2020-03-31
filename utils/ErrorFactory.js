class ErrorFactory {
    constructor() {

    }

    buildError(res, code, error) {
        let timestamp = new Date().toISOString();

        return res.status(code).json({
            code,
            error,
            timestamp
        });
        
    }
}

module.exports = new ErrorFactory(); //insures it's a singleton