# Run project

Copy config.js.dist to config.js and fill in correct settings, specifically:

* the mailgun api key
* the mailgun api base url
* stripe apiKey
* stripe secret

Create a folder .data in the root if it does not exists and make it writable

Go to the commandline and do

    npm install
    npm start

(npm is only used to transpile es6 and for nodemon)

# API

Most calls require a valid login header named token, except:

* user create
* token create
* user validation 
* menu

## User

Get an user by id (requires valid token)  
**GET /user?id=aaa**

Create a new user  
**POST /user**

###### Request

    {
      "name" : "B. Customer",
      "address": {
          "street": "Somestreet 1a",
          "zip": "1111AA",
          "city": "Amsterdam",
          "remarks": "Ring 2nd bell"
      },
      "email": "a.valid@email.com",
      "password": "test1234",
      "tos": true
    }

###### Response

    {
        "Message": "Resource created",
        "Id": "1234"
    }

Update an existing user (requires valid token)  
**PUT /user?id=aaa**

###### Request

    {
      "name" : "A. Customer",
    }

###### Response

    {
        "Message": "Resource updated",
        "Id": "1234"
    }
Delete an user by id (requires valid token)  
**DELETE /user?id=aaa**

## Validate

Validate user by sending validation token  
**POST /validate**

###### Request

    {
        "validationKey": "d7c31894132096f3bbb7868c3f7f4ea7_55c5f29b7c42d210bcc66d3251d5715838d8e8e032a5e988addcae561ab2 "
    }


## Token

Create a new token  
**POST /token**

###### Request

    {
      "user" : "1234",
      "password": "test1234"
    }

###### Response

    {
        "token": "61a709eb83d47021960c3d353180ab741f800316",
        "expires": 1547414004988,
        "user": "2a5cdf710295576c3eb5fae08bb637dd"
    }

Extend the expire time of an existing token (requires valid token)  
**PUT /token?id=aaa**

###### Request

    {
      "extend": true
    }

###### Response

    {
        "token": "61a709eb83d47021960c3d353180ab741f800316",
        "expires": 1547414004988,
        "user": "2a5cdf710295576c3eb5fae08bb637dd"
    }

Delete a token by id (requires valid token)  
**DELETE /token?id=aaa**


##Menu

Get the menu  
**GET /menu**

###### Response
    {
        "pizza": [{
                "id": 1001,
                "category": "pizza",
                "name": "Pizza Margherita  ",
                "price": 745,
                "ingredients": ["tomato", "cheese"],
                "choices": {
                    "Small": -100,
                    "Medium": 0,
                    "Large": 100
                }
            }, {
                "id": 1002,
                "category": "pizza",
                "name": "Pizza Cipolla",
                "price": 795,
                "ingredients": ["tomato", "cheese", "union"],
                "choices": {
                    "Small": -100,
                    "Medium": 0,
                    "Large": 100
                }
            },
            ...
        ]
    }

## Order

Get an order by id (requires valid token)  
**GET /order?id=aaa**

Create a new order  
**POST /order**

###### Request

    {
        "items": [{
            "id": 1001,
            "quantity": 1,
            "choice": "Small"
        }, {
            "id": 1003,
            "quantity": 1,
            "choice": "Large"
        }, {
            "id": 2006,
            "quantity": 1,
            "choice": "Spaghetti"
        }, {
            "id": 8001,
            "quantity": 1
        }],
        "address": {
            "street": "Somestreet 1a",
            "zip": "1111AA",
            "city": "Amsterdam",
            "remarks": "Ring 2nd bell"
        }
    }

###### Response

    {
        "Message": "Resource created",
        "Id": "1234"
    }

Update an existing order (requires valid token)  
**PUT /order?id=aaa**

###### Request

    {
        "items": [
            {"id": 1001, "quantity": 1, "choice": "Large"},
            {"id": 1003, "quantity": 1, "choice": "Large"},
            {"id": 2006, "quantity": 1, "choice": "Spaghetti"},
            {"id": 9001, "quantity": 1}
        ]
    }
###### Response

    {
        "Message": "Resource updated",
        "Id": "1234"
    }

Delete an order by id (requires valid token)  
**DELETE /order?id=aaa**

## Payment

Execute a payment by supplying a token, normally collected through stripe  
**POST /payment**

###### Request

{
	"paymentToken": "tok_mastercard",
	"order": "1234"
}

###### Response

    {
        "Message": "Payment successful"
    }
