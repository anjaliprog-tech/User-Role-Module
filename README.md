#User role access module

## TECH stack - Node.js, Express and Mongo DB.

## Install
Clone repo by this and after cloning follow these setps.
    $ git clone git@github.com:anjaliprog-tech/User-Role-Module.git
    $ cd project_name

    First install node modules using command 
        $ npm install  

## Configure app
    Create a .env file in the root directory and add the following:
    
        MONGO_URI=mongodb://localhost:27017/your-database-name
        PORT=3000
        JWT_SECRET=<YOUR-JWT-SECRET>
        # Add other environment variables as needed


## Running the project
    $ npm run dev  OR nodemon server.js

## Notes:
    ➙ To run application you must have install node and mongo db in your machine.
    ➙ After installing node go to project root directory and install node modules using command mention above.
    ➙ In case 'npm i' command doesn't work use 'npm i --force'.

