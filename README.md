# Pizza-Hub
Nodejs Master Course Homework Assignment #3

Assignment: Build a back end nodejs api for a pizza delivery company's online ordering website. The primary requirement is that it not use any npm modules and only relies on node's rich array of builtin functionality such as fs, http, https, crypt, util, path and url just to name a few.</br>
In homework assignment #3 I have added the front end code to the pizza delivery app. Once again this is vanilla js without any npm packages or things like jquery. The front end logic handles creation, modification and deletion of customers as well as the creation of an order basket, the ability to delete order items from the basket and in the future will include the ability to send to a credit card processor which has been currently stubbed out. The menu items and subsequently order creation and processing is driven by a config file in app/configuration that allows the customer to add or subtract menu items just by modifying a json file and then restarting the server. I make heavy use of html templates and template builders that build the web pages either on the fly or at startup depending on the page.

## Description of key modules on the server side:

### Classes (Models):

1. Customer: The customer class primarily allows the handler to clone a customer from request data fields and then validate the customer properties. The properties are analogous to database columns and map to a customer file record. The key on this record is the phone number.

2. Token: The token class allows it associated handler to create and/or clone a token from request data fields and then validate the token properties as well as create a unique session token. The token is a unique 20 digit id and is also the key on the record.

3. Basket: The basket class in addition to being able to clone itself from payload date, knows how to traverse an array of orderSelections which each have one or more Choice selections and total up the price of the basket. The key is a unique 21 digit basket id which is a munge of the phone number and underscore and a 10 digit unique identifier. It could work like an index if we ever go national. ;o)

### Handlers (handlers):

1. CustomerHandler: Manages creation, reading updating and deleting of customers in conjunction with the Customer class. Customer create does not need a token, but all subsequent customer crud functions require a session token.

2. BasketHandler: Manages creation, reading, updating and deleting of baskets. Although as I built the front end logic I ended up using only the create and read functions.

3. TokenHandler: Manages the crud functions for the session token. Each handler uses the token to validate the client.

4. SessionHandler:  Handles straight html form and page requests as well as 404 and 405 responses.

5. SummaryHandler: Reads the selected basket from the database(file) and coordinates putting together the summary of the order as well as handling deleting of individual order items in the basket. The basketHandler and the SummaryHandler could be consolidated but I see no urgent need to do that.

### Utils:

- Various utility modules that are possibly reuseable in other projects and that provide functionality that is commonly used across multiple modules. Examples are server.js router.js, logs.js and config.js.

### Lib:

- Core modules that are always reimplemented in one way or another for any project. Such as server.js, router.js, fileDb.js and config.js

- The lib/templates javascript modules were added to build all of the html templates which are located in the htmlTemplates directory. I use unique strings in the html templates as variables or placeholders that are then populated with the correct data by the template builder javascript modules.

## Client side files

### public/css

- All of the css files for the front end logic. They are pretty much broken down into separate files along functional lines. Global.css is really just an include file that includes all of the other css files so that only 1 css file is needed in the html document.

## public/js

1. App.js is the main javascript file and all other files interface through it.

2. session.js manages the session state using a token that is passed in the header

3. ajax.js handles the xmlHttpRequest processing and contains 2 helper classes RequestObj and ResponseObj.

4. basket.js manages creating and processing the order basket.

5. Summary.js manages creating and processing the summary page, deleting of orders and submitting the basket for payment.

### Common modules shared between the browser and server

- These files are located in a subdirectory off of the public/js directory called common. They use a technique that is used by jquery, underscore and many other packages to allow a file to be used in both node js and the browser.

1. helpers.js holds common helper functions that are used throughout the application.

2. enumerations.js holds enumerations that define mostly string lengths and number constants.

3. smarCollection.js is a collection of objects that map the structure of a basket. The menu and the order display and creation use a collection with the smartCollection as the top level. Later on I saw the need for a map collection when I realized that I needed to process things at the item and choice level. So I added the smartMap. When the order form sends an order to the basketHandler as well as all of the summary form processing the smartMap is used. Eventually I need to do away with the smartcollection and re architect the menu and order form creation to also use the smartMap.

## Todo:

1. Wire the stripe code and mailGun code into the summaryHandler. Ran out of time.

2. Refactor the menu creation and orderCreateFrm creation to use the smartMap and do away with the smartCollection array.

3. Make the client responsive so that it resizes intelligently for tablets and phones.

4. Update the comments.


# Building the Pizza-Hub server:

- This is the easy part. There are no npm modules thus a package.json file is not needed. Just clone the repository and start index.js with node. config.js has some key configuration variables that you can set and is pretty much self explanatory.
