# sitc-ue5-azure

This is a project to port the exisiting [sitc sales demo](https://github.com/SixNines/sitc-sales-demo/) to run on and deploy on Azure infrastructure. 

At a high level, there are two main services at play here, 1) front end and 2) back end. Front end will be responsible for displaying the user interface and will be triggering the calls to the backend and communicating the results back to the user. The backend is responsible for interacting with the Cloud provider(in this case we will need to rewrite it to interface with Azure API). 

Main tasks:
1. Rewrite server files (located in [/server/src/](/server/src)) to use Azure SDK instead of AWS SDK