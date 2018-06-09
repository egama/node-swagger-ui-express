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
    static initController(_express, _router) {
        this._express = _express;

        if (!_router) {
            _router = this._express.Router();
        }

        _router.toSwagger = this.toSwagger;
        _router.swaggerController = this.swaggerController;
        return _router;
    }

    /**
     * 
     * @param {object} _resp 
     * @param {object} _req 
     */
    static toSwagger(_resp, _req) {
        var routI = this.stack[this.stack.length - 1].route;
        var itemOfRoutes = new ItemOfRoutes();
        itemOfRoutes.method = routI.stack[0].method;

        if (itemOfRoutes.method.toLowerCase() == "post") {
            //Request
            if (_req != null) {
                let instance_req = helper.instanceClass(_req);

                let itemModelReq = _arrayOfModels.find(x => { return x.name == _req.name });
                if (itemModelReq == null || itemModelReq.length == 0)
                    _arrayOfModels.push({ name: _req.name, instance: instance_req });

                itemOfRoutes.request = _req.name;
            }

            if (_resp != null) {
                let instance_resp = helper.instanceClass(_resp);

                let itemModelResp = _arrayOfModels.find(x => { return x.name == _resp.name });
                if (itemModelResp == null || itemModelResp == 0)
                    _arrayOfModels.push({ name: _resp.name, instance: instance_resp });

                itemOfRoutes.response = _resp.name;
            }

            itemOfRoutes.action = routI.path;
        } else if (itemOfRoutes.method.toLowerCase() == "get") {
            let path = routI.path;
            if (path.toString().indexOf(':') >= 0) {
                let path_string = path.toString().substring(0, path.toString().indexOf(':') - 1);
                let params_string = path.toString().substring(path.toString().indexOf(':'));

                itemOfRoutes.request = params_string;
            }
            if (_resp != null) {
                if (typeof _resp == "function") {
                    let instance_resp = helper.instanceClass(_resp);
                    let itemModelResp = _arrayOfModels.find(x => { return x.name == _resp.name });
                    if (itemModelResp == null || itemModelResp == 0)
                        _arrayOfModels.push({ name: _resp.name, instance: instance_resp });

                    itemOfRoutes.response = _resp.name;
                }
            }

            itemOfRoutes.action = path;

        }

        _arrayList.push(itemOfRoutes);

        return this;
    }

    static swaggerController(_controllerName) {
        this.controller = _controllerName;
        _arrayList.filter(x => x.controller == '').map(x => { x.controller = _controllerName });
        return this;
    }

    static swaggerInit(app, _version, _title) {
        let appConf = require('../../package.json')

        var obj = new SwaggerJsonClass(_version || appConf.version, _title || appConf.description);

        //Carregar as APIs
        obj.paths = {}
        _arrayList.forEach(_a => {
            if (_a.method == 'post') {
                helper.createPOSTDoc(obj, _a);
            } else if (_a.method == 'get') {
                helper.createGETDoc(obj, _a);
            }
        });

        //Carregar as models
        obj.definitions = {}
        _arrayOfModels.map(_a => {
            obj.definitions[_a.name] = {}
            obj.definitions[_a.name].type = "object";
            obj.definitions[_a.name].properties = {}
            Object.getOwnPropertyNames(_a.instance).map(_n => {
                obj.definitions[_a.name].properties[_n] = {}
                let desc = Object.getOwnPropertyDescriptor(_a.instance, _n);
                obj.definitions[_a.name].properties[_n].type = typeof desc.value;

            });
        });

        helper.createJson(JSON.stringify(obj));

        app.use('/swagger-ui', this._express.static(path.join(__dirname, '../node-swagger-ui-express')));
        app.use('/swagger.json', function (req, res) {
            res.json(require('./swagger.json'));
        });
        app.use('/swagger', function (req, res) {
            res.redirect('/swagger-ui?url=./swagger.json');
        });

        return app;
    }
}

module.exports = ExpressSwagger;