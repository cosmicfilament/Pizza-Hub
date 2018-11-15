# Pizza-Hub
~~Nodejs Master Course Homework Assignment # 2~~</br>
Nodejs Master Course Homework Assignment #3 (WIP)

Assignment: Build a back end nodejs api for a pizza delivery company's online ordering website. The primary requirement is that it not use any npm modules and only relies on node's rich array of builtin functionality such as fs, http, https, crypt, util, path and url just to name a few.</br>
In homework assignment #3 I have added the front end code to the pizza delivery app. Once again this is vanilla js without any packages or imports etc....

## Description of key modules:

### Classes (Models):

1. Customer: The customer class primarily allows the handler to clone a customer from request data fields and then validate the customer properties. The properties are analogous to database columns and map to a customer file record. The key on this record is the phone number.

2. Token: The token class allows it associated handler to create and/or clone a token from request data fields and then validate the token properties as well as create a unique session token. The token is a unique 20 digit id and is also the key on the record.

3. Basket: The basket class in addition to being able to clone itself from payload date, knows how to traverse an array of orderSelections which each have one or more Choice selections and total up the price of the basket. The key is a unique 21 digit basket id which is a munge of the phone number and underscore and a 10 digit unique identifier. It could work like an index if we ever go national. ;o)

4. OrderSelection: This class is very small and holds one menu selection. A selection can be something like a pizza or a topping

5. Choice: Another small class that holds a choice within a selection and the price of that choice. A choice is either an 8" pizza or a 12" pizza. Toppings are each choices and a basket can have multiple toppings in it.

### Handlers (handlers):

1. CustomerHandler: Manages creation, reading updating and deleting of customers in conjunction with the Customer class. Customer create does not need a token, but all subsequent customer crud functions require a session token.

2. BasketHandler: Manages creation, reading, updating and deleting of baskets. Also generates the menu for the home page and initiates the payment process. All functions except the menu retrieval function require a sesssion token.

3. TokenHandler: Manages the crud functions for the session token. Each handler uses the token to validate the client.

4. DefaultHandler: Handles 404 and 405 responses. Was also used in initial testing.

### Utils:

- Various utility modules that are possibly reuseable in other projects and that provide functionality that is commonly used across multiple modules. Examples are server.js router.js, logs.js and config.js. Also the payment processing interface to stripe as well as the email interface to mail Gun is in this directory.

### Lib:

- Core modules that are always reimplemented in one way or another for any project. Such as server.js, router.js, fileDb.js and config.js

## Overview of the workflow:

1. Show the menu: http://localhost:3000/basket/menu calls basketHandler->menu

2. Create a new customer and grab a session token: http://localhost:3000/customer/create calls customerHandler->create, then on success send .../token/create which calls tokenHandler->create and returns a token valid for 30 minutes.

3. Login and order an 8" pizza with pepperoni on it: http://localhost:3000/token/read with a valid phone number and password gets a session token back. Use that token to call .../basket/create to create an empty basket. Then call .../basket/update to add items to the basket. Finally call ../basket/checkout to complete the purchase process and receive an email response back from the pizza company.

# Building the Pizza-Hub server:

- This is the easy part. There are no npm modules thus a package.json file is not needed. Just clone the repository and start index.js with node. config.js has some key configuration variables that you can set and is pretty much self explanatory.
