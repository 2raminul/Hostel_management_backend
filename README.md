
## Hostel Admin backend api

## Project Run Instruction and Environment requirments

# Setup docker and docker-compose in your local machine for local development 

```bash

Step 1: git clone [url]

Step 2: cd []

Step 3: cp .env.example .env

Step 4: now run docker-compose up --build -d


```
## N:B: please be patient it will take a while to setup docker env and project 

After all the setup done you can browse http://localhost:8023 to see the result

## To visit swagger docs please visit http://localhost:8023/api-docs

## Setup without docker

```bash

Install the following requirments to up and running the codebase

1. Node.js lts/ v20.14.0
2. Postgres
3. Redis

Now change your env accordingly to run the project


Step 1: git clone [url]

Step 2: cd []

Step 3: cp .env.example .env

Step 4: npm i

Step 5: npm run start:dev

```


## Migration Run Command

Create Base Migration If Base migrations doesn't exist

N:B if you want to add tables for your base migrations then create your entity classes for initial migrations

```javascript

npm run migration:generate -- db/migrations/User  [User is the entity name]

```

Run Base Migration 

```javascript

npm run migration:run

```

## Creating new migration

First create a TypeOrm entity class Like User with property like name,phone password property then run the below command


```javascript

npm run migration:generate -- db/migrations/CreateSellerTable  [You can use User for altering the table or any custom name AddTestColumnInUser]

```

## Altering existing table

Add the corresponding property to the entity table, let's suppose you want to add new column in users table the add the property in the user entity class, TypeOrm will automatically detect the new field if you run the below command

```javascript

npm run migration:generate -- db/migrations/AlterSellerTable

```

## Migration Run command for new create or alter table

```javascript

npm run migration:run

```
     





