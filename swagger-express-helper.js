class HelperSwaggerExpress {
    static createJson(_text) {
        var fs = require('fs');
        fs.writeFile(__dirname + "\\swagger.json", _text, function (err) { });
    }
    static instanceClass(_class) {
        return new _class();
    }
    static defaultConsumes() {
        return [
            "application/json-patch+json",
            "application/json",
            "text/json",
            "application/*+json"
        ];
    }
    static defaultProduces() {
        return [
            "application/json",
            "application/xml"
        ];
    }

    static createDefault(_name, _obj, _a) {
        if (_obj.paths[_name] == null)
            _obj.paths[_name] = {};

        if (_obj.paths[_name][_a.method] == null)
            _obj.paths[_name][_a.method] = {}

        if (_obj.paths[_name][_a.method].tags == null)
            _obj.paths[_name][_a.method].tags = [];

        let tag_split = _a.controller.split('/');
        let tag = tag_split[tag_split.length - 1];
        _obj.paths[_name][_a.method].tags.push(tag);

        _obj.paths[_name][_a.method].operationId = _name.split('/').join('') + _a.method;
        _obj.paths[_name][_a.method].parameters = [];
        _obj.paths[_name][_a.method].responses = {};

        return _name;
    }
    static createPOSTDoc(_obj, _a) {
        let _name = _a.controller + _a.action;
        this.createDefault(_name, _obj, _a);

        _obj.paths[_name][_a.method].consumes = this.defaultConsumes();

        this.parameters_default(_name, _obj, _a);
        this.response_default(_name, _obj, _a);
    }

    static createGETDoc(_obj, _a) {
        let path = _a.action;

        if (path.toString().indexOf(':') >= 0) {
            let path_string = path.toString().substring(0, path.toString().indexOf(':') - 1);
            let params_string = path.toString().substring(path.toString().indexOf(':'));
            path = path_string == '/' ? "" : path_string;
        }
        path = path == '/' ? "" : path;

        let _name = _a.controller + path;
        this.createDefault(_name, _obj, _a);

        _obj.paths[_name][_a.method].produces = this.defaultProduces();

        _a.request.split('/').map(r => {
            if (r.toString().trim() != '') {
                let parameter = {};
                parameter.name = r.replace(':', '');
                parameter.in = "path"

                _obj.paths[_name][_a.method].parameters.push(parameter);
            }
        });

        this.response_default(_name, _obj, _a);
    }

    static response_default(_name, _obj, _a) {
        if (_a.response != '') {
            let response = {}
            response.description = "";
            response.name = _a.response;
            response.in = "body";
            response.required = false;
            response.schema = {};
            response.schema["$ref"] = "#/definitions/" + _a.response;

            _obj.paths[_name][_a.method].responses["200"] = response;
        }
    }

    static parameters_default(_name, _obj, _a) {
        if (_a.response != '') {
            let parameter = {}
            parameter.name = _a.request;
            parameter.in = "body";
            parameter.required = false;
            parameter.schema = {};
            parameter.schema["$ref"] = "#/definitions/" + _a.request;
            _obj.paths[_name][_a.method].parameters.push(parameter);
        }
    }

}

module.exports = HelperSwaggerExpress;