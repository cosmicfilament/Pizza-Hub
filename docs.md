## Modules

<dl>
<dt><a href="#basketHandler.module_js">js</a></dt>
<dd><p>basket or cart crud functions. also handles menu request and payment</p>
</dd>
<dt><a href="#customerHandler.module_js">js</a></dt>
<dd><p>customer CRUD module</p>
</dd>
<dt><a href="#defaultHandler.module_js">js</a></dt>
<dd><p>error handler functions</p>
</dd>
<dt><a href="#tokenHandler.module_js">js</a></dt>
<dd><p>session token CRUD functions</p>
</dd>
<dt><a href="#index.module_json">json</a></dt>
<dd><p>entry point for the node server app</p>
</dd>
<dt><a href="#config.module_js">js</a></dt>
<dd><p>configuration values</p>
</dd>
<dt><a href="#fileDb.module_js">js</a></dt>
<dd><p>Basic flat file CRUD functions</p>
</dd>
<dt><a href="#router.module_js">js</a></dt>
<dd><p>process the path in the request object and passes back a handle to the request handler function</p>
</dd>
<dt><a href="#server.module_js">js</a></dt>
<dd><p>http/https server and request handler</p>
</dd>
<dt><a href="#workers.module_js">js</a></dt>
<dd><p>worker kind of sort of process within the node loop. Fires timers to process intermittent tasks</p>
</dd>
<dt><a href="#module_Basket class and enumerations">Basket class and enumerations</a></dt>
<dd><p>encapsulates the functionality of a basket or cart</p>
</dd>
<dt><a href="#module_Customer class and enumerations">Customer class and enumerations</a></dt>
<dd><p>encapsulates customer functionality</p>
</dd>
<dt><a href="#module_orderItem module">orderItem module</a></dt>
<dd><p>classes that map the menu items from the menu.json file. Used by the basketModule</p>
</dd>
<dt><a href="#module_Token class and enumerations">Token class and enumerations</a></dt>
<dd></dd>
<dt><a href="#module_Token">Token</a></dt>
<dd><p>Encapsulates what it is to be a validation Token</p>
</dd>
<dt><a href="#handlerUtils.module_js">js</a></dt>
<dd><p>functions shared across the handlers</p>
</dd>
<dt><a href="#helpers.module_js">js</a></dt>
<dd><p>various helper functions that are needed across modules</p>
</dd>
<dt><a href="#logs.module_js module">js module</a></dt>
<dd><p>functions for loggin and compressing and uncompressing log files</p>
</dd>
<dt><a href="#mailGun.module_js">js</a></dt>
<dd><p>send email thru mailGun infrastructure</p>
</dd>
<dt><a href="#stripe.module_js">js</a></dt>
<dd><p>stripe payments module</p>
</dd>
</dl>

<a name="basketHandler.module_js"></a>

## js
basket or cart crud functions. also handles menu request and payment


* [js](#basketHandler.module_js)
    * [.create()](#basketHandler.module_js.create) ⇒
    * [.read()](#basketHandler.module_js.read) ⇒
    * [.update()](#basketHandler.module_js.update) ⇒
    * [.delete()](#basketHandler.module_js.delete) ⇒
    * [.menu()](#basketHandler.module_js.menu) ⇒
    * [.checkOut()](#basketHandler.module_js.checkOut) ⇒

<a name="basketHandler.module_js.create"></a>

### js.create() ⇒
Creates a new basket based on data in the reqObj.payload.

**Kind**: static method of [<code>js</code>](#basketHandler.module_js)  
**Summary**: Basket create function.  
**Returns**: success msg or promise error on failure  
**Throws**:

- promise error

<table>
  <thead>
    <tr>
      <th>Param</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>reqObj.payload</td><td><p>(phone)- payload passes in the values used to create a new basket</p>
</td>
    </tr><tr>
    <td>headers.token</td><td><p>must have a valid session token to process the create function</p>
</td>
    </tr>  </tbody>
</table>

<a name="basketHandler.module_js.read"></a>

### js.read() ⇒
Reads an existing basket based on data in the reqObj.queryStringObject

**Kind**: static method of [<code>js</code>](#basketHandler.module_js)  
**Summary**: Basket read function.  
**Returns**: basket object on success or promise error on failure  
**Throws**:

- promise error

<table>
  <thead>
    <tr>
      <th>Param</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>reqObj.queryStringObject</td><td><p>basket id</p>
</td>
    </tr><tr>
    <td>headers.token</td><td><p>must have a valid session token to process the read function</p>
</td>
    </tr>  </tbody>
</table>

<a name="basketHandler.module_js.update"></a>

### js.update() ⇒
Updates the # of order items in a basket. Can either add or delete order items.

**Kind**: static method of [<code>js</code>](#basketHandler.module_js)  
**Summary**: Basket update function.  
**Returns**: success msg or promise error on failure  
**Throws**:

- promise error

<table>
  <thead>
    <tr>
      <th>Param</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>reqObj.payload</td><td><p>passes in basket id and and array of order items</p>
</td>
    </tr><tr>
    <td>headers.token</td><td><p>must have a valid session token to process the update function</p>
</td>
    </tr>  </tbody>
</table>

<a name="basketHandler.module_js.delete"></a>

### js.delete() ⇒
Deletes a basket with the basket id passed in the querystring

**Kind**: static method of [<code>js</code>](#basketHandler.module_js)  
**Summary**: Basket delete function.  
**Returns**: success msg or promise error on failure  
**Throws**:

- promise error

<table>
  <thead>
    <tr>
      <th>Param</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>reqObj.queryStringObject</td><td><p>used to retrieve the basket id.</p>
</td>
    </tr><tr>
    <td>headers.token</td><td><p>must have a valid session token to process the delete function</p>
</td>
    </tr>  </tbody>
</table>

<a name="basketHandler.module_js.menu"></a>

### js.menu() ⇒
no validation. allows anyone to read the menu

**Kind**: static method of [<code>js</code>](#basketHandler.module_js)  
**Summary**: menu function  
**Returns**: the restaurant's menu  
<a name="basketHandler.module_js.checkOut"></a>

### js.checkOut() ⇒
validates the basket, totals it and sends it to stripe for payment processing. at the end it sends an email to the customer with a status message

**Kind**: static method of [<code>js</code>](#basketHandler.module_js)  
**Summary**: checkOut function  
**Returns**: success msg or promise error on failure  
**Throws**:

- promise error

<table>
  <thead>
    <tr>
      <th>Param</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>reqObj.payload.id</td><td><p>used to retrieve the basket id.</p>
</td>
    </tr><tr>
    <td>headers.token</td><td><p>must have a valid session token to process the checkOut function</p>
</td>
    </tr>  </tbody>
</table>

<a name="customerHandler.module_js"></a>

## js
customer CRUD module


* [js](#customerHandler.module_js)
    * [.create(reqObj)](#customerHandler.module_js.create) ⇒
    * [.read(reqObj)](#customerHandler.module_js.read) ⇒
    * [.update(reqObj)](#customerHandler.module_js.update) ⇒
    * [.delete(reqObj)](#customerHandler.module_js.delete) ⇒

<a name="customerHandler.module_js.create"></a>

### js.create(reqObj) ⇒
Creates a new customer based on data in the reqObj.payload. The phone number passed in is the key(file name) on the record.

**Kind**: static method of [<code>js</code>](#customerHandler.module_js)  
**Summary**: Customer create function.  
**Returns**: JSON string with success msg or promise error on failure  
**Throws**:

- promise error

<table>
  <thead>
    <tr>
      <th>Param</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>reqObj</td><td><p>payload passes in firstName, lastName, email, address, password and phone. See customerModel</p>
</td>
    </tr>  </tbody>
</table>

<a name="customerHandler.module_js.read"></a>

### js.read(reqObj) ⇒
Reads a customer record from the file db and returns it to the caller

**Kind**: static method of [<code>js</code>](#customerHandler.module_js)  
**Summary**: Customer read function  
**Returns**: the customer record as a JSON string or promise error on failure  
**Throws**:

- promise error

<table>
  <thead>
    <tr>
      <th>Param</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>reqObj</td><td><p>the phone number is passed in on the querystring</p>
</td>
    </tr><tr>
    <td>headers.token</td><td><p>must have a valid session token to process the read function</p>
</td>
    </tr>  </tbody>
</table>

<a name="customerHandler.module_js.update"></a>

### js.update(reqObj) ⇒
Allows the caller to update firstName, LastName, address, password and email on existing customer

**Kind**: static method of [<code>js</code>](#customerHandler.module_js)  
**Summary**: Customer update function.  
**Returns**: success message or promise error on failure  
**Throws**:

- promise error

<table>
  <thead>
    <tr>
      <th>Param</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>reqObj</td><td><p>payload passes in firstName, lastName, email, address, password and phone. See customerModel</p>
</td>
    </tr><tr>
    <td>headers.token</td><td><p>must have a valid session token to process the update function</p>
</td>
    </tr>  </tbody>
</table>

<a name="customerHandler.module_js.delete"></a>

### js.delete(reqObj) ⇒
Allows the caller to delete an existing customer record(file)

**Kind**: static method of [<code>js</code>](#customerHandler.module_js)  
**Summary**: Customer delete function.  
**Returns**: success message or promise error on failure  
**Throws**:

- promise error

<table>
  <thead>
    <tr>
      <th>Param</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>reqObj</td><td><p>phone is passed in on the querystring</p>
</td>
    </tr><tr>
    <td>headers.token</td><td><p>must have a valid session token to process the delete function</p>
</td>
    </tr>  </tbody>
</table>

<a name="defaultHandler.module_js"></a>

## js
error handler functions


* [js](#defaultHandler.module_js)
    * [.notAllowed()](#defaultHandler.module_js.notAllowed)
    * [.notFound()](#defaultHandler.module_js.notFound)

<a name="defaultHandler.module_js.notAllowed"></a>

### js.notAllowed()
responds with 405 status code

**Kind**: static method of [<code>js</code>](#defaultHandler.module_js)  
**Summary**: notAllowed  
<a name="defaultHandler.module_js.notFound"></a>

### js.notFound()
responds with 404 status code

**Kind**: static method of [<code>js</code>](#defaultHandler.module_js)  
**Summary**: notFound function  
<a name="tokenHandler.module_js"></a>

## js
session token CRUD functions


* [js](#tokenHandler.module_js)
    * [.create(reqObj)](#tokenHandler.module_js.create) ⇒
    * [.read(reqObj)](#tokenHandler.module_js.read) ⇒
    * [.update(reqObj)](#tokenHandler.module_js.update) ⇒
    * [.delete(reqObj)](#tokenHandler.module_js.delete) ⇒

<a name="tokenHandler.module_js.create"></a>

### js.create(reqObj) ⇒
Creates a new token based on data in the reqObj.payload.

**Kind**: static method of [<code>js</code>](#tokenHandler.module_js)  
**Summary**: Token create function.  
**Returns**: JSON string with newToken ojbect on success or promise error on failure  
**Throws**:

- promise error

<table>
  <thead>
    <tr>
      <th>Param</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>reqObj</td><td><p>payload passes in customer password and phone number and expects a new token See tokenModel</p>
</td>
    </tr>  </tbody>
</table>

<a name="tokenHandler.module_js.read"></a>

### js.read(reqObj) ⇒
Reads an existing token based on the token id passed in the reqObj querystring

**Kind**: static method of [<code>js</code>](#tokenHandler.module_js)  
**Summary**: Token read function.  
**Returns**: stringified token object on success or promise error on failure  
**Throws**:

- promise error

<table>
  <thead>
    <tr>
      <th>Param</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>reqObj</td><td><p>reqObj passes in the token id in the querystring</p>
</td>
    </tr>  </tbody>
</table>

<a name="tokenHandler.module_js.update"></a>

### js.update(reqObj) ⇒
Extends the token validity for another 30 minutes or conversely immediately invalidates the token

**Kind**: static method of [<code>js</code>](#tokenHandler.module_js)  
**Summary**: Token update function.  
**Returns**: JSON string with success msg or promise error on failure  
**Throws**:

- promise error

<table>
  <thead>
    <tr>
      <th>Param</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>reqObj</td><td><p>payload passes in the token id and a new property called extends which signifies whether to extend or revoke the token.</p>
</td>
    </tr>  </tbody>
</table>

<a name="tokenHandler.module_js.delete"></a>

### js.delete(reqObj) ⇒
Deletes a token with the token id passed in the querystring

**Kind**: static method of [<code>js</code>](#tokenHandler.module_js)  
**Summary**: Token delete function.  
**Returns**: JSON string with success msg or promise error on failure  
**Throws**:

- promise error

<table>
  <thead>
    <tr>
      <th>Param</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>reqObj</td><td><p>only the queryStringObject in the reqObj is used to retrieve the token id.</p>
</td>
    </tr>  </tbody>
</table>

<a name="index.module_json"></a>

## json
entry point for the node server app

<a name="config.module_js"></a>

## js
configuration values

<a name="fileDb.module_js"></a>

## js
Basic flat file CRUD functions

<a name="router.module_js"></a>

## js
process the path in the request object and passes back a handle to the request handler function

<a name="router.module_js..Router"></a>

### js~Router(the) ⇒
Routes requests messages to the specific handler requested in the path

**Kind**: inner method of [<code>js</code>](#router.module_js)  
**Summary**: Message router object  
**Returns**: a handle to a function that will handle the request  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>the</td><td><p>route method takes a method and trimmed path string</p>
</td>
    </tr>  </tbody>
</table>

<a name="server.module_js"></a>

## js
http/https server and request handler

<a name="workers.module_js"></a>

## js
worker kind of sort of process within the node loop. Fires timers to process intermittent tasks

<a name="module_Basket class and enumerations"></a>

## Basket class and enumerations
encapsulates the functionality of a basket or cart


* [Basket class and enumerations](#module_Basket class and enumerations)
    * [~Basket](#module_Basket class and enumerations..Basket)
        * [new Basket()](#new_module_Basket class and enumerations..Basket_new)
        * _instance_
            * [.total](#module_Basket class and enumerations..Basket+total)
            * [.init()](#module_Basket class and enumerations..Basket+init)
            * [.parseOrderSelections(orderSelections)](#module_Basket class and enumerations..Basket+parseOrderSelections)
            * [.createId()](#module_Basket class and enumerations..Basket+createId) ⇒
            * [.validateId()](#module_Basket class and enumerations..Basket+validateId)
            * [.validatePhone()](#module_Basket class and enumerations..Basket+validatePhone)
            * [.validateorderSelections()](#module_Basket class and enumerations..Basket+validateorderSelections)
            * [.validateTimeStamp()](#module_Basket class and enumerations..Basket+validateTimeStamp)
            * [.validateBasket(skipId)](#module_Basket class and enumerations..Basket+validateBasket) ⇒
        * _static_
            * [.timeStamp()](#module_Basket class and enumerations..Basket.timeStamp)
            * [.clone(any)](#module_Basket class and enumerations..Basket.clone) ⇒

<a name="module_Basket class and enumerations..Basket"></a>

### Basket class and enumerations~Basket
**Kind**: inner class of [<code>Basket class and enumerations</code>](#module_Basket class and enumerations)  
**Summary**: Basket class  

* [~Basket](#module_Basket class and enumerations..Basket)
    * [new Basket()](#new_module_Basket class and enumerations..Basket_new)
    * _instance_
        * [.total](#module_Basket class and enumerations..Basket+total)
        * [.init()](#module_Basket class and enumerations..Basket+init)
        * [.parseOrderSelections(orderSelections)](#module_Basket class and enumerations..Basket+parseOrderSelections)
        * [.createId()](#module_Basket class and enumerations..Basket+createId) ⇒
        * [.validateId()](#module_Basket class and enumerations..Basket+validateId)
        * [.validatePhone()](#module_Basket class and enumerations..Basket+validatePhone)
        * [.validateorderSelections()](#module_Basket class and enumerations..Basket+validateorderSelections)
        * [.validateTimeStamp()](#module_Basket class and enumerations..Basket+validateTimeStamp)
        * [.validateBasket(skipId)](#module_Basket class and enumerations..Basket+validateBasket) ⇒
    * _static_
        * [.timeStamp()](#module_Basket class and enumerations..Basket.timeStamp)
        * [.clone(any)](#module_Basket class and enumerations..Basket.clone) ⇒

<a name="new_module_Basket class and enumerations..Basket_new"></a>

#### new Basket()
Encapsulates a single cart or basket

<a name="module_Basket class and enumerations..Basket+total"></a>

#### basket.total
iterates thru the selection and choices summing up the total price

**Kind**: instance property of [<code>Basket</code>](#module_Basket class and enumerations..Basket)  
**Summary**: getter total method  
<a name="module_Basket class and enumerations..Basket+init"></a>

#### basket.init()
Basket init method

**Kind**: instance method of [<code>Basket</code>](#module_Basket class and enumerations..Basket)  
**Summary**: init  
<a name="module_Basket class and enumerations..Basket+parseOrderSelections"></a>

#### basket.parseOrderSelections(orderSelections)
parses the chain of json arrays and objects in the menu.json file

**Kind**: instance method of [<code>Basket</code>](#module_Basket class and enumerations..Basket)  
**Summary**: parseOrderSelections  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>orderSelections</td><td><p>array</p>
</td>
    </tr>  </tbody>
</table>

<a name="module_Basket class and enumerations..Basket+createId"></a>

#### basket.createId() ⇒
creates a random string comprised of the customer phone number and a random 10 digit number

**Kind**: instance method of [<code>Basket</code>](#module_Basket class and enumerations..Basket)  
**Summary**: createId method  
**Returns**: new basket id  
**Throws**:

- nothing

<a name="module_Basket class and enumerations..Basket+validateId"></a>

#### basket.validateId()
Basket validateId method

**Kind**: instance method of [<code>Basket</code>](#module_Basket class and enumerations..Basket)  
**Summary**: validateId method  
<a name="module_Basket class and enumerations..Basket+validatePhone"></a>

#### basket.validatePhone()
Basket validatePhone method

**Kind**: instance method of [<code>Basket</code>](#module_Basket class and enumerations..Basket)  
**Summary**: validatePhone method  
<a name="module_Basket class and enumerations..Basket+validateorderSelections"></a>

#### basket.validateorderSelections()
just makes sure that the array is not empty

**Kind**: instance method of [<code>Basket</code>](#module_Basket class and enumerations..Basket)  
**Summary**: validateorderSelections method  
<a name="module_Basket class and enumerations..Basket+validateTimeStamp"></a>

#### basket.validateTimeStamp()
Basket validateTimeStamp method

**Kind**: instance method of [<code>Basket</code>](#module_Basket class and enumerations..Basket)  
**Summary**: validateTimeStamp method  
<a name="module_Basket class and enumerations..Basket+validateBasket"></a>

#### basket.validateBasket(skipId) ⇒
validates the basket object properties optionally skipping the id property, when not created yet.

**Kind**: instance method of [<code>Basket</code>](#module_Basket class and enumerations..Basket)  
**Summary**: validateBasket method  
**Returns**: true if successfull or the name of the first property to fail on error  
**Throws**:

- nothing

<table>
  <thead>
    <tr>
      <th>Param</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>skipId</td><td><code>false</code></td><td><p>boolean that if true skips the id property</p>
</td>
    </tr>  </tbody>
</table>

<a name="module_Basket class and enumerations..Basket.timeStamp"></a>

#### Basket.timeStamp()
Basket timeStamp method

**Kind**: static method of [<code>Basket</code>](#module_Basket class and enumerations..Basket)  
**Summary**: timeStamp  
<a name="module_Basket class and enumerations..Basket.clone"></a>

#### Basket.clone(any) ⇒
Creates a new basket based on the properties passed into it.

**Kind**: static method of [<code>Basket</code>](#module_Basket class and enumerations..Basket)  
**Summary**: Basket clone method  
**Returns**: a new basket object  
**Throws**:

- nothing

<table>
  <thead>
    <tr>
      <th>Param</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>any</td><td><p>object that can be coerced into  basket</p>
</td>
    </tr>  </tbody>
</table>

<a name="module_Customer class and enumerations"></a>

## Customer class and enumerations
encapsulates customer functionality


* [Customer class and enumerations](#module_Customer class and enumerations)
    * [~Customer](#module_Customer class and enumerations..Customer)
        * [new Customer()](#new_module_Customer class and enumerations..Customer_new)
        * _instance_
            * [.init()](#module_Customer class and enumerations..Customer+init)
            * [.validateFirstName()](#module_Customer class and enumerations..Customer+validateFirstName)
            * [.validateLastName()](#module_Customer class and enumerations..Customer+validateLastName)
            * [.validateEmail()](#module_Customer class and enumerations..Customer+validateEmail) ⇒
            * [.validatePhone()](#module_Customer class and enumerations..Customer+validatePhone)
            * [.validatePassword()](#module_Customer class and enumerations..Customer+validatePassword)
            * [.validateAddress()](#module_Customer class and enumerations..Customer+validateAddress)
            * [.validateCustomer()](#module_Customer class and enumerations..Customer+validateCustomer) ⇒
        * _static_
            * [.clone(clones)](#module_Customer class and enumerations..Customer.clone) ⇒
            * [.createPasswordHash(clear)](#module_Customer class and enumerations..Customer.createPasswordHash)

<a name="module_Customer class and enumerations..Customer"></a>

### Customer class and enumerations~Customer
**Kind**: inner class of [<code>Customer class and enumerations</code>](#module_Customer class and enumerations)  
**Summary**: Customer class  

* [~Customer](#module_Customer class and enumerations..Customer)
    * [new Customer()](#new_module_Customer class and enumerations..Customer_new)
    * _instance_
        * [.init()](#module_Customer class and enumerations..Customer+init)
        * [.validateFirstName()](#module_Customer class and enumerations..Customer+validateFirstName)
        * [.validateLastName()](#module_Customer class and enumerations..Customer+validateLastName)
        * [.validateEmail()](#module_Customer class and enumerations..Customer+validateEmail) ⇒
        * [.validatePhone()](#module_Customer class and enumerations..Customer+validatePhone)
        * [.validatePassword()](#module_Customer class and enumerations..Customer+validatePassword)
        * [.validateAddress()](#module_Customer class and enumerations..Customer+validateAddress)
        * [.validateCustomer()](#module_Customer class and enumerations..Customer+validateCustomer) ⇒
    * _static_
        * [.clone(clones)](#module_Customer class and enumerations..Customer.clone) ⇒
        * [.createPasswordHash(clear)](#module_Customer class and enumerations..Customer.createPasswordHash)

<a name="new_module_Customer class and enumerations..Customer_new"></a>

#### new Customer()
Encapsulates what it is to be a customer

<a name="module_Customer class and enumerations..Customer+init"></a>

#### customer.init()
**Kind**: instance method of [<code>Customer</code>](#module_Customer class and enumerations..Customer)  
**Summary**: Customer init method  
<a name="module_Customer class and enumerations..Customer+validateFirstName"></a>

#### customer.validateFirstName()
Customer validateFirstName method

**Kind**: instance method of [<code>Customer</code>](#module_Customer class and enumerations..Customer)  
**Summary**: validateFirstName  
<a name="module_Customer class and enumerations..Customer+validateLastName"></a>

#### customer.validateLastName()
Customer validateLastName method

**Kind**: instance method of [<code>Customer</code>](#module_Customer class and enumerations..Customer)  
**Summary**: validateLastName  
<a name="module_Customer class and enumerations..Customer+validateEmail"></a>

#### customer.validateEmail() ⇒
method to validate the email address passed in

**Kind**: instance method of [<code>Customer</code>](#module_Customer class and enumerations..Customer)  
**Summary**: validateEmail  
**Returns**: true on success or an error string if failed.  
**Throws**:

- nothing

<a name="module_Customer class and enumerations..Customer+validatePhone"></a>

#### customer.validatePhone()
Customer validatePhone method

**Kind**: instance method of [<code>Customer</code>](#module_Customer class and enumerations..Customer)  
**Summary**: validatePhone  
<a name="module_Customer class and enumerations..Customer+validatePassword"></a>

#### customer.validatePassword()
validates the password min length only. works on the hashed or clear text password

**Kind**: instance method of [<code>Customer</code>](#module_Customer class and enumerations..Customer)  
**Summary**: validatePassword  
**Todo**

- rewrite this so that if the pwd i clear text we can do better validation

<a name="module_Customer class and enumerations..Customer+validateAddress"></a>

#### customer.validateAddress()
Customer validateAddress method

**Kind**: instance method of [<code>Customer</code>](#module_Customer class and enumerations..Customer)  
**Summary**: validateAddress method  
<a name="module_Customer class and enumerations..Customer+validateCustomer"></a>

#### customer.validateCustomer() ⇒
method to validate the complete customer object using the above helper methods

**Kind**: instance method of [<code>Customer</code>](#module_Customer class and enumerations..Customer)  
**Summary**: validateCustomer  
**Returns**: true if successfull or the name of the first property to fail on error  
**Throws**:

- nothing

<a name="module_Customer class and enumerations..Customer.clone"></a>

#### Customer.clone(clones) ⇒
clones a Customer from customer a customer like object

**Kind**: static method of [<code>Customer</code>](#module_Customer class and enumerations..Customer)  
**Summary**: clone  
**Returns**: a new customer object  
**Throws**:

- nothing

<table>
  <thead>
    <tr>
      <th>Param</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>clones</td><td><p>a customer from anything with a customer property</p>
</td>
    </tr>  </tbody>
</table>

<a name="module_Customer class and enumerations..Customer.createPasswordHash"></a>

#### Customer.createPasswordHash(clear)
Customer createPasswordHash method that creates a hash on the value passed in

**Kind**: static method of [<code>Customer</code>](#module_Customer class and enumerations..Customer)  
**Summary**: createPasswordHash  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>clear</td><td><p>text password</p>
</td>
    </tr>  </tbody>
</table>

<a name="module_orderItem module"></a>

## orderItem module
classes that map the menu items from the menu.json file. Used by the basketModule


* [orderItem module](#module_orderItem module)
    * [~MenuTitle](#module_orderItem module..MenuTitle)
        * [new MenuTitle()](#new_module_orderItem module..MenuTitle_new)
        * [.menuTitle](#module_orderItem module..MenuTitle.menuTitle) ⇒
    * [~OrderSelection](#module_orderItem module..OrderSelection)
        * [new OrderSelection()](#new_module_orderItem module..OrderSelection_new)
        * [.total](#module_orderItem module..OrderSelection+total)
        * [.init()](#module_orderItem module..OrderSelection+init)
        * [.parseChoices()](#module_orderItem module..OrderSelection+parseChoices)
    * [~Choice](#module_orderItem module..Choice)
        * [new Choice()](#new_module_orderItem module..Choice_new)

<a name="module_orderItem module..MenuTitle"></a>

### orderItem module~MenuTitle
**Kind**: inner class of [<code>orderItem module</code>](#module_orderItem module)  
**Summary**: MenuTitle class  

* [~MenuTitle](#module_orderItem module..MenuTitle)
    * [new MenuTitle()](#new_module_orderItem module..MenuTitle_new)
    * [.menuTitle](#module_orderItem module..MenuTitle.menuTitle) ⇒

<a name="new_module_orderItem module..MenuTitle_new"></a>

#### new MenuTitle()
restaurant name in the menu.json file

<a name="module_orderItem module..MenuTitle.menuTitle"></a>

#### MenuTitle.menuTitle ⇒
**Kind**: static property of [<code>MenuTitle</code>](#module_orderItem module..MenuTitle)  
**Summary**: getter menuTitle  
**Returns**: title  
**Throws**:

- nothing

<a name="module_orderItem module..OrderSelection"></a>

### orderItem module~OrderSelection
**Kind**: inner class of [<code>orderItem module</code>](#module_orderItem module)  
**Summary**: OrderSelection class  

* [~OrderSelection](#module_orderItem module..OrderSelection)
    * [new OrderSelection()](#new_module_orderItem module..OrderSelection_new)
    * [.total](#module_orderItem module..OrderSelection+total)
    * [.init()](#module_orderItem module..OrderSelection+init)
    * [.parseChoices()](#module_orderItem module..OrderSelection+parseChoices)

<a name="new_module_orderItem module..OrderSelection_new"></a>

#### new OrderSelection()
wraps the selection portion of the menu.json file

<a name="module_orderItem module..OrderSelection+total"></a>

#### orderSelection.total
totals all of the prices for each choice in a selection

**Kind**: instance property of [<code>OrderSelection</code>](#module_orderItem module..OrderSelection)  
**Summary**: getter total  
**Throws**:

- nothing

<a name="module_orderItem module..OrderSelection+init"></a>

#### orderSelection.init()
creates a selection and delegates down to the choice for its creation

**Kind**: instance method of [<code>OrderSelection</code>](#module_orderItem module..OrderSelection)  
**Summary**: init  
**Throws**:

- nothing

<a name="module_orderItem module..OrderSelection+parseChoices"></a>

#### orderSelection.parseChoices()
parses the choices from the menu.json file

**Kind**: instance method of [<code>OrderSelection</code>](#module_orderItem module..OrderSelection)  
**Summary**: parseChoices  
**Throws**:

- nothing

<a name="module_orderItem module..Choice"></a>

### orderItem module~Choice
**Kind**: inner class of [<code>orderItem module</code>](#module_orderItem module)  
**Summary**: Choice class  
<a name="new_module_orderItem module..Choice_new"></a>

#### new Choice()
class that wraps a single choice from the menu.json file

<a name="module_Token class and enumerations"></a>

## Token class and enumerations
<a name="module_Token"></a>

## Token
Encapsulates what it is to be a validation Token

**Summary**: Token class  

* [Token](#module_Token)
    * _instance_
        * [.init()](#module_Token+init)
        * [.updateExpiry(extend)](#module_Token+updateExpiry) ⇒
        * [.validateId()](#module_Token+validateId)
        * [.validatePhone()](#module_Token+validatePhone)
        * [.validateTokenExpiration()](#module_Token+validateTokenExpiration)
        * [.validateToken()](#module_Token+validateToken) ⇒
    * _static_
        * [.clone(an)](#module_Token.clone) ⇒
        * [.createTokenString()](#module_Token.createTokenString) ⇒

<a name="module_Token+init"></a>

### token.init()
**Kind**: instance method of [<code>Token</code>](#module_Token)  
**Summary**: Token init method  
<a name="module_Token+updateExpiry"></a>

### token.updateExpiry(extend) ⇒
Either updates the expiration by 30 minutes or immediately revokes the token

**Kind**: instance method of [<code>Token</code>](#module_Token)  
**Summary**: Token updateExpiry method  
**Returns**: a new Date object  
**Throws**:

- nothing

<table>
  <thead>
    <tr>
      <th>Param</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>extend</td><td><code>true</code></td><td><p>boolean that if true extends the token and if false revokes the token</p>
</td>
    </tr>  </tbody>
</table>

<a name="module_Token+validateId"></a>

### token.validateId()
token validateId method

**Kind**: instance method of [<code>Token</code>](#module_Token)  
**Summary**: validateId  
<a name="module_Token+validatePhone"></a>

### token.validatePhone()
token validatePhone method

**Kind**: instance method of [<code>Token</code>](#module_Token)  
**Summary**: validatePhone  
<a name="module_Token+validateTokenExpiration"></a>

### token.validateTokenExpiration()
token validateExpiration method

**Kind**: instance method of [<code>Token</code>](#module_Token)  
**Summary**: validateTokenExpiration  
<a name="module_Token+validateToken"></a>

### token.validateToken() ⇒
validates the complete token object

**Kind**: instance method of [<code>Token</code>](#module_Token)  
**Summary**: validateToken  
**Returns**: true on success or the string name of the failed property on failure  
**Throws**:

- nothing

<a name="module_Token.clone"></a>

### Token.clone(an) ⇒
Creates a new Token based on the properties passed into it. Can end up with less or more properties than the canonical Token.

**Kind**: static method of [<code>Token</code>](#module_Token)  
**Summary**: Token clone method  
**Returns**: a new token object  
**Throws**:

- nothing

<table>
  <thead>
    <tr>
      <th>Param</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>an</td><td><p>object that can be coerced into a Token</p>
</td>
    </tr>  </tbody>
</table>

<a name="module_Token.createTokenString"></a>

### Token.createTokenString() ⇒
Creates a new token id

**Kind**: static method of [<code>Token</code>](#module_Token)  
**Summary**: Token CreateTokenString method  
**Returns**: a new token object  
**Throws**:

- nothing

<a name="handlerUtils.module_js"></a>

## js
functions shared across the handlers

<a name="helpers.module_js"></a>

## js
various helper functions that are needed across modules

<a name="logs.module_js module"></a>

## js module
functions for loggin and compressing and uncompressing log files


* [js module](#logs.module_js module)
    * [~gzipP(file)](#logs.module_js module..gzipP) ⇒
    * [~unzipP(zipped)](#logs.module_js module..unzipP) ⇒

<a name="logs.module_js module..gzipP"></a>

### js module~gzipP(file) ⇒
promisified gzip function for zipping log files

**Kind**: inner method of [<code>js module</code>](#logs.module_js module)  
**Summary**: gzipP function  
**Returns**: gzipped buffer  
**Throws**:

- promise reject

<table>
  <thead>
    <tr>
      <th>Param</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>file</td><td><p>and data</p>
</td>
    </tr>  </tbody>
</table>

<a name="logs.module_js module..unzipP"></a>

### js module~unzipP(zipped) ⇒
promisified unzip function for unzipping logs

**Kind**: inner method of [<code>js module</code>](#logs.module_js module)  
**Summary**: unzipP  
**Returns**: uzipped data in a buffer  
**Throws**:

- promise reject

<table>
  <thead>
    <tr>
      <th>Param</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>zipped</td><td><p>data</p>
</td>
    </tr>  </tbody>
</table>

<a name="mailGun.module_js"></a>

## js
send email thru mailGun infrastructure

<a name="exp_mailGun.module_js--module.exports"></a>

### .module.exports ⇒ ⏏
sends email status to customers

**Kind**: static property of [<code>js</code>](#mailGun.module_js)  
**Summary**: mailGun.js  
**Returns**: status  
**Throws**:

- promise reject

<table>
  <thead>
    <tr>
      <th>Param</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>basket</td><td><p>id</p>
</td>
    </tr><tr>
    <td>email</td><td><p>address</p>
</td>
    </tr><tr>
    <td>message</td><td></td>
    </tr>  </tbody>
</table>

<a name="stripe.module_js"></a>

## js
stripe payments module

<a name="exp_stripe.module_js--module.exports"></a>

### .module.exports ⇒ ⏏
processes payment via stripe.com

**Kind**: static property of [<code>js</code>](#stripe.module_js)  
**Summary**: stripe.js  
**Returns**: success or fail  
**Throws**:

- promise reject

<table>
  <thead>
    <tr>
      <th>Param</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>total</td><td><p>in dollars</p>
</td>
    </tr><tr>
    <td>basket</td><td><p>id</p>
</td>
    </tr>  </tbody>
</table>

