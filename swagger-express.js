const path = require('path');
const { SwaggerJsonClass } = require('./swagger-class');
const helper = require('./swagger-express-helper');

class ItemOfRoutes {
    constructor() {
        this.action = "";
        this.controller = "";
        this.method = "";
        this.request = "";
        this.response = "";
    }
}
let _arrayOfModels = [], _arrayList = [];
let _express;
class ExpressSwagger {
    /**
     * Method to start controller
     * @param {string} _controllerName  name of controller ex. '/api/account'
     * @param {express} _express import of express ex. require('express')
     * @param {express.router} _router instance of router ex. express.Router();
     */
    static initController(_controllerName, _express, _router) {
        this._express = _express;

        if (!_router) {
            _router = this._express.Router();
        }

        _router.toSwagger = this.toSwagger;
        _router.swaggerController = this.swaggerController;
        _router.controller = _controllerName;

        return _router;
    }

    /**
     * Method to include action to swagger
     * Ex. .toSwagger(ClassResponse, ClassRequest)
     * @param {object} _resp Type of response
     * @param {object} _req Type of request
     */
    static toSwagger(_resp, _req) {
        var _routI = this.stack[this.stack.length - 1].route;
        var itemOfRoutes = new ItemOfRoutes();
        itemOfRoutes.method = _routI.stack[0].method;
        itemOfRoutes.controller = this.controller;

        if (itemOfRoutes.method.toLowerCase() == "post" || itemOfRoutes.method.toLowerCase() == "put") {

            //Request
            itemOfRoutes.request = helper.receiveParams(_req, _routI, _arrayOfModels, itemOfRoutes);

            //Response
            itemOfRoutes.response = helper.receiveParams(_resp, _routI, _arrayOfModels, itemOfRoutes);

            itemOfRoutes.action = _routI.path;
        } else if (itemOfRoutes.method.toLowerCase() == "get" || itemOfRoutes.method.toLowerCase() == "delete") {

            //Request
            itemOfRoutes.request = helper.receiveParams(_req, _routI, _arrayOfModels, itemOfRoutes);

            //Request
            itemOfRoutes.response = helper.receiveParams(_req, _routI, _arrayOfModels, itemOfRoutes);

            let path = _routI.path;
            if (path.toString().indexOf(':') >= 0) {
                let path_string = path.toString().substring(0, path.toString().indexOf(':') - 1);
                let params_string = path.toString().substring(path.toString().indexOf('/:'));

                path = path_string;
                params_string.split('/:').map(m => {
                    if (m != '')
                        path += "/{" + m + "}";
                });
            }
            itemOfRoutes.action = path;
        }
        _arrayList.push(itemOfRoutes);

        return this;
    }

    /**
     * Method to start swagger
     * @param {express()} _app Router app
     * @param {string} _version 
     * @param {string} _title 
     */
    static swaggerInit(_app, _version, _title) {
        let appConf = require('../../package.json')

        var obj = new SwaggerJsonClass(_version || appConf.version, _title || appConf.description);

        //Carregar as APIs
        obj.paths = {}
        _arrayList.forEach(_a => {
            if (_a.method == 'post') {
                helper.createPOSTDoc(obj, _a);
            } else if (_a.method == 'put') {
                helper.createPUTDoc(obj, _a);
            } else if (_a.method == 'get') {
                helper.createGETDoc(obj, _a);
            } else if (_a.method == 'delete') {
                helper.createDELETEDoc(obj, _a);
            }
        });

        //Carregar as models
        obj.definitions = {};
        _arrayOfModels.map(_a => {
            this.createDefinition(_a.name, _a.instance, obj.definitions);
        });

        helper.createJson(JSON.stringify(obj));

        _app.use('/swagger-ui', this._express.static(path.join(__dirname, '../node-swagger-ui-express')));
        _app.use('/swagger.json', function (req, res) {
            res.json(require('./swagger.json'));
        });
        _app.use('/swagger', function (req, res) {
            res.redirect('/swagger-ui?url=./swagger.json');
        });

        return _app;
    }

    static createDefinition(_name, _instance, _definitionAll) {
        let _definitions = undefined;
        if (_definitionAll != null)
            _definitions = _definitionAll;

        if (_definitions[_name] == null) {
            _definitions[_name] = {}
            _definitions[_name].type = "object";
            _definitions[_name].properties = {};

            Object.getOwnPropertyNames(_instance).map(_n => {
                _definitions[_name].properties[_n] = {};
                this.prepareObjDefinitions(_definitions[_name].properties[_n], _instance, _n, _definitions);
            });
        }

        return _definitions;
    }
    static prepareObjDefinitions(_definition, _instance, _n, _definitionAll) {
        let desc = Object.getOwnPropertyDescriptor(_instance, _n);
        if (typeof desc.value != "object") {
            _definition.type = typeof desc.value;
        } else {
            if (JSON.stringify(Object.getPrototypeOf(_instance[_n])) == '[]') { //array
                _definition.type = "array";

                if (_instance[_n].length > 0) {
                    _definition.items = {};
                    if (typeof _instance[_n][0] == "function") {
                        _definition.items["$ref"] = "#/definitions/" + _instance[_n][0].name;
                        let inst = helper.instanceClass(_instance[_n][0]);
                        this.createDefinition(_instance[_n][0].name, inst, _definitionAll);
                    } else if (typeof _instance[_n][0] == "string") {
                        _definition.items.type = "string";
                    }
                } else {
                    _definition.example = [];
                }
            } else if (JSON.stringify(Object.getPrototypeOf(_instance[_n])) == '{}') {
                _definition.items = {};
                _definition.items["$ref"] = "#/definitions/" + _instance[_n].constructor.name;
                this.createDefinition(_instance[_n].constructor.name, _instance[_n], _definitionAll);
            }
        }
    }
}

module.exports = ExpressSwagger;