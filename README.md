
<a><h1 align="center">Node Swagger-ui express</h1></a>
<p align="center">Best automatic swagger-ui with express.</p>
<p>In 5 minutes you will have swagger documentation available.</p>
<p align="center"><a href="https://www.npmjs.com/package/node-swagger-ui-express">
<img width=40px; src="https://docs.npmjs.com/images/npm.svg" alt="npm download"></a>
</p>


### Features
Created for Node.js, this module has features like an application in a simple and easy way.

## How to use

### Installing

> ##### Node.js
`npm i node-swagger-ui-express`

### Importing
    const { ExpressSwagger } = require('node-swagger-ui-express');


### Methods
We will use the three methods below to create the swagger

##### 1. initController
	Method to start controller. Used in every controller/router at the beginning of everything.
	Parameters:
	* controllerName - Name of controller/router
	* express - instance of express
	* router - instance of router

##### 2. toSwagger
	Method to include action to swagger. Used in every action you need to include in swagger.
	Parameters:
	* ClassResponse - class of response
	* ClassRequest - class of request

##### 3. swaggerInit
	Method to start swagger. Used after route creation. It is used to create the document.

#### Using
Here is an example implementation.

* controllers/authController.js
>  
>```javascript     
>const { RequestAuthRegister, ResponseAuthRegister, RequestAuthAuthenticate, ResponseAuthAuthenticate } =  require('../viewModel/auth');
> const { ExpressSwagger } =  require('node-swagger-ui-express');
> const  express  =  require('express');
> const  router  =  express.Router();
>
>ExpressSwagger.initController('/api/account', express, router);
>
>router.post('/register', async (req, resp) => {
>     return  resp.send("register");
>}).toSwagger(ResponseAuthRegister, RequestAuthRegister);
>
>router.put('/update', async (req, resp) => {
>     return  resp.send("global");
>}).toSwagger(ResponseAuthAuthenticate, RequestAuthAuthenticate);
>
>router.delete('/:id', async (req, resp) => {
>     return  resp.send("delete OK");
>}).toSwagger(ResponseAuthAuthenticate);;
>
>router.get('/:id', async (req, resp) => {
>     return  resp.send("get id OK");
>}).toSwagger(ResponseAuthAuthenticate);
>
>router.get('/', async(req, resp) => {
>     return  resp.send("get all OK");
>}).toSwagger("");
>
>module.exports  = (app) =>  app.use(router.controller, router);
>```

* index.js

>```javascript
>	const express = require('express');
>	const bodyParser = require('body-parser');
>	const { ExpressSwagger } = require('node-swagger-ui-express');
>	
>	const app = express();
>	
>	app.use(bodyParser.json());
>	app.use(bodyParser.urlencoded({ extended: false }));
>	
>	require('./controllers/authController')(app);
>	
>	ExpressSwagger.swaggerInit(app);
>	app.listen(3200);
>```

* viewModel/auth.js

>```javascript
>	class RequestAuthRegister {
>	    constructor() {
>	        this.email = "";
>	        this.password = "";
>	        this.id = 0;
>	    }
>	}
>
>	class ResponseAuthRegister {
>	    constructor() {
>	        this.hash = "";
>	    }
>	}
>	
>	class RequestAuthAuthenticate {
>	    constructor() {
>	        this.user = "";
>	        this.password = "";
>	    }
>	}
>
>	class ResponseAuthAuthenticate {
>	    constructor() {
>	        this.token = "";
>	    }
>	}
>	
>	module.exports.ResponseAuthRegister = ResponseAuthRegister;
>	module.exports.RequestAuthRegister = RequestAuthRegister;
>	module.exports.RequestAuthAuthenticate = RequestAuthAuthenticate;
>	module.exports.ResponseAuthAuthenticate = ResponseAuthAuthenticate;
>```


* Swagger-UI
`http://localhost:3200/swagger-ui/`

#### Example
https://github.com/egama/Example-node-swagger-ui-express