# sitc-ue5-azure

This is a project to port the exisiting [sitc sales demo](https://github.com/SixNines/sitc-sales-demo/) to run on and deploy on Azure infrastructure. 

At a high level, there are two main services at play here, 1) front end and 2) back end. Front end will be responsible for displaying the user interface and will be triggering the calls to the backend and communicating the results back to the user. The backend is responsible for interacting with the Cloud provider(in this case we will need to rewrite it to interface with Azure API). 

Main tasks:
1. Rewrite server files (located in [/server/src/](/server/src)) to use Azure SDK instead of AWS SDK

Rewrite:
1. server/src/config/config.go 
2. server/src/go.mod
3. server/src/routes/component/routes.go
4. server/src/routes/component/subrouter.go
5. server/src/routes/deployment/routes.go
6. server/src/routes/deployment/subrouter.go
7. server/src/routes/instance/routes.go
8. server/src/routes/instance/subrouter.go
9. server/src/routes/internal/status.go
10. server/src/routes/internal/subrouter.go
11. server/src/routes/keypair/routes.go
12. server/src/routes/keypair/subrouter.go


To run locally:

Frontend:
1. install npm
2. go to client folder
3. run `npm install`
4. run `npm run build`
5. run `npm start`
6. Open browser and go to http://localhost:3000
