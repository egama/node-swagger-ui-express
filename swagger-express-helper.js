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
        let action = _a.action;
        let _in = 'query';
        if (action.toString().indexOf('{') >= 0) {
            _in = "path";
        }
        else if (action.toString().indexOf('?') >= 0) {
            _in = "query";
        }
        action = action == '/' ? "" : action;

        let _name = _a.controller + action;
        this.createDefault(_name, _obj, _a);

        _obj.paths[_name][_a.method].produces = this.defaultProduces();

        if (_a.request != null) {
            _a.request.split('/').map(r => {
                if (r.toString().trim() != '') {
                    let parameter = {};
                    parameter.name = r.replace(':', '');
                    parameter.in = _in;

                    _obj.paths[_name][_a.method].parameters.push(parameter);
                }
            });
        }

        this.response_default(_name, _obj, _a);
    }

    static createDELETEDoc(_obj, _a) {
        this.createGETDoc(_obj, _a);
    }
    static createPUTDoc(_obj, _a) {
        this.createPOSTDoc(_obj, _a);
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


    static receiveParams(_param, _routI, _arrayOfModels) {
        if (_param == null)
            _param = '';

        if (typeof _param == "function") {
            let instance_param = this.instanceClass(_param);
            let itemModelResp = _arrayOfModels.find(x => { return x.name == _param.name });
            if (itemModelResp == null || itemModelResp == 0)
                _arrayOfModels.push({ name: _param.name, instance: instance_param });

            return _param.name;
        } else if (typeof _param == "string") {
            let path = _routI.path;
            if (path.toString().indexOf(':') >= 0) {
                let path_string = path.toString().substring(0, path.toString().indexOf(':') - 1);
                let params_string = path.toString().substring(path.toString().indexOf(':'));

                return params_string;
            }
        }
    }
}

module.exports = HelperSwaggerExpress;