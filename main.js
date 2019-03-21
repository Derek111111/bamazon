var inquirer = require("inquirer");
var mysql = require("mysql");

//set up connection to my database for queries
var connection = mysql.createConnection({


    host:"localhost",
    port:3306,
    user:"root",
    password:"root",
    database:"bamazon"

});

connection.connect(function(err){

if(err){ throw err};
console.log("Connected as " + connection.threadId + "\n");

beginningPrompt();
});


function beginningPrompt(){
    connection.query("SELECT * FROM products", function(err,res){

        //console.log(res);

        var itemsToDisplay = [];
        for(var i = 0; i< res.length; i++){

           var itemString =res[i].product_name;
           itemsToDisplay.push(itemString);

        }

            inquirer.prompt([

                {
                    type:"list",
                    name:"itemToBuy",
                    message:"Which item would you like to buy?",
                    choices: itemsToDisplay
                }
    
            ]).then(function(answers){
    
                howMany(answers.itemToBuy);
    
            });

    });


};

function howMany(itemName){

    inquirer.prompt([

        {
            type:"input",
            name:"amount",
            message:"How many " + itemName + "'s would you like to buy?",
            validate:function(input){

                if(isNaN(parseInt(input))){
                    return false;
                }else{
                    return true;
                }

            }
        }

    ]).then(function(answers){

        quantityCheck(itemName, answers.amount);

    })

}

function quantityCheck(itemName,amount){

    connection.query("SELECT * FROM products WHERE product_name = ?", [itemName],function(err,res){

        if(err){ throw err};

        var item = res[0];
        //console.log(res);

        if(item.stock_quantity < parseInt(amount)){
            console.log("Insufficient quantity!");
            howMany(itemName);
        }else{

            //console.log(amount + " : " + item.stock_quantity);
            validatePurchase(itemName,amount, parseFloat(item.price),parseInt(item.stock_quantity));
        }

    });

}

function validatePurchase(itemName,amount,price,quantity){

    inquirer.prompt([

        {
            type:"confirm",
            message:"Are you sure you want to buy " + amount + " " + itemName + "s?",
            name:"confirm"
        }

    ]).then(function(answer){

        console.log("Answer: " + answer.confirm);
        if(answer.confirm){

            console.log('Complete purchase');
            completePurchase(itemName,amount,price,quantity);

        }else{

            console.log("restart");
            beginningPrompt();

        }

    });

}

function completePurchase(itemName, amount, price,quantity){

    console.log("Your total is $" + parseInt(amount)*price );

    if(amount == quantity){

        connection.query("DELETE FROM products WHERE product_name = ?", [itemName], function(err,res){

            if(err){throw err};

            //console.log(res);
            console.log("Purchase completed!")
            beginningPrompt();

        });

    }else{

        var difference = quantity - amount;

        connection.query(
            "UPDATE products SET ? WHERE ?",
            [
                {
                    stock_quantity: difference
                },
                {
                    product_name: itemName
                }
            ],
            function(err,res){

                if(err){throw err};

                //console.log(res);
                console.log("Purchase complete!");
                beginningPrompt();


            }
        );

    }


}


