class SwaggerJsonClass {
    constructor(_version, _title) {
        this.swagger = "2.0";

        this.info = {};
        this.info.version = _version;
        this.info.title = _title;
    }
}


module.exports.SwaggerJsonClass = SwaggerJsonClass;