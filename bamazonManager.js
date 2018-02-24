require("dotenv").config();

var mysql = require("mysql");
var inquirer = require("inquirer");
var clear = require("clear");
var itemsNumber = 0;

// var connection = mysql.createConnection({
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     user: process.env.DB_USER,
//     password: process.env.DB_PW,
//     database: "bamazon_DB"
// });
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "bamazon_DB"
});


connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    clear();
    itemsLength();
    start();
})

//PROMPTS FOR WHAT THE MANAGER WOULD LIKE TO DO.
//**********************************************************************************************************//
function start() {
    inquirer
        .prompt({
            name: "choice",
            type: "list",
            message: "What would you like to do?",
            choices: [
                "View Products for Sale",
                "View Low Inventory Less than 30 items in stock",
                "Add to Inventory Quantity",
                "Add New Product"
            ]
        })
        .then(function (answer) {
            switch (answer.choice) {
                case "View Products for Sale":
                    viewAll();
                    break;
                case "View Low Inventory Less than 30 items in stock":
                    viewLowInv();
                    break;
                case "Add to Inventory Quantity":
                    // viewAll();
                    addToInv();
                    break;
                case "Add New Product":
                    addNewProduct();
                    break;
            }
        });
}
//**********************************************************************************************************//
//END OF FUNCTION



                            //FUNCTION TO VIEW ALL ITEMS AVAILABLE FOR PURCHASE //
//**********************************************************************************************************//
//VIEWS ALL ITEMS AVAILABLE FOR PURCHASE
function viewAll() {
    connection.query("SELECT * FROM products", function (err, results) {
        if (err) throw err;
        for (let i = 0; i < results.length; i++) {
            console.log("Item " + results[i].item_id + "|  Dept Name: " + results[i].department_name + "|  Product Name: " + results[i].product_name + "|  Price: " + results[i].price + "|  In Stock: " + results[i].stock_quantity);

        }
    });
}
//**********************************************************************************************************//
//END OF FUNCTION



                            //FUNCTION TO VIEW LOW INVENTORY //
//**********************************************************************************************************//
//VIEWS ALL INVENTORY LESS THAN 30 ITEMS IN ST0CKS
function viewLowInv() {
    connection.query("SELECT * FROM products WHERE stock_quantity <= 30", function (err, results) {
        if (err) throw err;
        for (let i = 0; i < results.length; i++) {
            console.log("Item " + results[i].item_id + "|  Product Name: " + results[i].product_name + "|  Price: " + results[i].price + "|  In Stock: " + results[i].stock_quantity);
        }

    });
    connection.end();
};
//**********************************************************************************************************//
//END OF FUNCTION




//FUNCTION TO UPDATE A ITEMS STOCK LEVEL.  ALSO UPDATES ALL ITEMS IN THE DEPTS OVERHEAD COST TO DEPARTMENTS TABLE //
//**********************************************************************************************************//
//ADDS ITEMS TO INVENTORY, BUT ALSO CHECKS IF THERE IS A VAILD DEPT AND THE ITEM TO UPDATE IS ASSOCIATED WITH THE CHOSEN DEPT
//CALLS FOR FUNCTIONS LISTED AT THE BOTTOM OF PAGE: 
function addToInv() {
    inquirer
        .prompt([
            {
                name: "dept",
                type: "input",
                message: "Enter the Department of the Item to update.\n\n",
            },
            {
                name: "item",
                type: "input",
                message: "Enter the Item ID of the product to update.\n\n",
                validate: function (value) {
                    if (isNaN(value) === false && value >= 1 && value <= itemsNumber) {
                        return true;
                    }
                    return false;
                }
            },
            {
                name: "quantity",
                type: "input",
                message: "Enter the New quantity amount.",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            }
        ])
        .then(function (answer) {
            var itemIdToUpdateStock = parseInt(answer.item);
            var itemQuantity = parseInt(answer.quantity);
            var dept = answer.dept.toUpperCase();

            checkDept(dept, itemIdToUpdateStock, itemQuantity)
            // CHECKS IF THERE IS A CURRENT DEPARTMENT TO UPDATE AN ITEMS STOCK QUANTITY
            function checkDept(dept, itemIdToUpdateStock, itemQuantity) {
                connection.query("SELECT department_name FROM departments", function (err, results) {
                    if (err) throw err;
                    var choiceArray = [];
                    for (let i = 0; i < results.length; i++) {
                        choiceArray.push(results[i].department_name)
                    }
                    if (choiceArray.includes(dept)) {
                        console.log("The department entered is a valid department.");
                        checkItemID(dept, itemIdToUpdateStock, itemQuantity)
                    } else {
                        console.log(dept + " is not a current department. Please restart and try again.");
                    }
                })
            }


            // IF THERE IS A CURRENT DEPARTMENT, CHECKS TO MAKE SURE ITEM_ID TO UPDATE IS IN THE DEPT
            function checkItemID(dept, itemIdToUpdateStock, itemQuantity) {
                connection.query("SELECT * FROM products WHERE department_name = ?", [dept], function (err, results) {
                    if (err) throw err;
                    var choiceArray = [];
                    for (let i = 0; i < results.length; i++) {
                        choiceArray.push(results[i].item_id)
                    }
                    console.log("The item to update is " + itemIdToUpdateStock);
                    if (choiceArray.includes(itemIdToUpdateStock)) {
                        console.log("Item to update is associated with the " + dept + " department");
                        updateStock(dept, itemQuantity, itemIdToUpdateStock)
                    } else {
                        console.log("Item_ID: " + itemIdToUpdateStock + " is not associated with the current department. Please restart and try again.");
                    }
                })
            }

            // UPDATES THE STOCK QUANTITY FOR THE DEPARTMENT
            function updateStock(dept, itemQuantity, itemIdToUpdateStock) {
                connection.query("UPDATE products SET ? WHERE ?",
                    [
                        {
                            stock_quantity: itemQuantity
                        },
                        {
                            item_id: itemIdToUpdateStock
                        }
                    ]
                    , function (err, res) {
                        if (err) throw err;
                        console.log(res.affectedRows + " Stock Quantity updated to: " + itemQuantity +" !\n");
                        getTotalPurchasedPrice(dept)
                    });
            }

        });
}
//**********************************************************************************************************//
//END OF FUNCTION






 //FUNCTION TO ADD A PRODUCT TO AN ALREADY CREATED DEPT.  ALSO UPDATES ALL ITEMS IN THE DEPTS OVERHEAD COST TO DEPARTMENTS TABLE //
//**********************************************************************************************************//
//ADDS ITEMS TO AN ALREADY CREATE DEPARTMENT
function addNewProduct() {
    inquirer
        .prompt([
            {
                name: "department",
                type: "input",
                message: "Enter the department you would like to add a product to.  Must add to Existing department.",
            },
            {
                name: "item",
                type: "input",
                message: "Enter the Name of the item to add to inventory.",
            },
            {
                name: "price",
                type: "input",
                message: "Enter the price of the item we will sell it for. Must be in the format of 99.99",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            },
            {
                name: "quantity",
                type: "input",
                message: "Enter the quantity/stock.",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            },
            {
                name: "purchasePrice",
                type: "input",
                message: "Enter the price we purchase this item for. Must be in the format of 99.99",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            }
        ])
        .then(function (answer) {
            var itemIdToUpdateStock = answer.item;
            var dept = answer.department.toUpperCase();
            var itemPrice = parseFloat(answer.price);
            var itemQuantity = parseInt(answer.quantity);
            var purchasePrice = parseFloat(answer.purchasePrice);
            //CHECKS TO SEE IF THERE IS A VALID DEPT
            connection.query("SELECT department_name FROM departments", function (err, results) {
                if (err) throw err;
                var choiceArray = [];
                for (let i = 0; i < results.length; i++) {
                    choiceArray.push(results[i].department_name)
                }
                if (choiceArray.includes(dept)) {
                    console.log("The department entered is a valid department.");
                    //ADDS PRODUCT TO DEPT
                    connection.query("INSERT INTO products SET ?",
                        {
                            product_name: itemIdToUpdateStock,
                            department_name: dept,
                            price: itemPrice,
                            stock_quantity: itemQuantity,
                            purchased_price: purchasePrice,
                        }
                        , function (err, res) {
                            if (err) throw err;
                            console.log(res.affectedRows +" "+ itemIdToUpdateStock + " product added to department!\n");
                            getTotalPurchasedPrice(dept);

                        });
                } else {
                    console.log(dept + " is not a current department. Please restart and try again.");
                }
            })
        })
};
//**********************************************************************************************************//
//END OF FUNCTION




//FUNCTIONS TO GET HOW MANY ITEMS ARE AVAILABLE TO BUY USER CAN ONLY SELECT ITEMS 1 THROUGH WHAT THIS FUNCTION RETURNS //
//**********************************************************************************************************//
// CHECKS THE LENGTH OF ITEMS THAT USER CAN CHOOSE FROM
function itemsLength() {
    connection.query("SELECT * FROM products", function (err, results) {
        if (err) throw err;
        var itemsLengthArray = [];
        for (let i = 0; i < results.length; i++) {
            itemsLengthArray.push(results[i].department_id)
        }
        itemsNumber = itemsLengthArray.length;
    });
    return itemsNumber
}
//**********************************************************************************************************//
//END OF FUNCTION




                            //FUNCTIONS TO UPDATE TOTAL SALES//
//**********************************************************************************************************//
//GETS THE TOTAL PRICE/OVERHEAD COST  FOR ALL ITEMS IN THIS DEPT
function getTotalPurchasedPrice(dept) {
    connection.query("SELECT SUM(purchased_price) AS totalPurchasePrice FROM products WHERE department_name = ?", [dept], function (err, res) {
        if (err) throw err;
        let totalPurPrice;
        for (let i = 0; i < res.length; i++) {
            totalPurPrice = res[i].totalPurchasePrice;
        }
        console.log("Total overhead cost for " + dept + " is: " + totalPurPrice);
        getTotalOverSales(dept, totalPurPrice)
    })
}

//GETS THE TOTAL STOCK FOR ALL ITEMS IN THIS DEPT
function getTotalOverSales(dept, totalPurPrice) {
    connection.query("SELECT SUM(stock_quantity) AS totalStock FROM products WHERE department_name = ?", [dept], function (err, res) {
        if (err) throw err;
        let totalStock;
        for (let i = 0; i < res.length; i++) {
            totalStock = res[i].totalStock;
        }
        console.log("Total stock for " + dept + "is: " + totalStock);
        let newOHC = parseFloat(totalStock * totalPurPrice).toFixed(2)
        console.log("The new Overhead Cost for " + dept + " is " + newOHC);
        getNewOHC(dept, newOHC)
    })
}

//UPDATES THE NEW OVERHEAD COST FOR THIS DEPT TO DEPARTMENTS TABLE
function getNewOHC(dept, newOHC) {
    connection.query("UPDATE departments SET ? WHERE ?",
        [
            { over_head_cost: newOHC },
            { department_name: dept }
        ], function (err, res) {
            if (err) throw err;
            console.log(res.affectedRows + " The total Overhead Cost for " + dept + " has been updated in the Departments Table to: " + newOHC + " !\n");
            getTotalProductSales(dept, newOHC)  
        })
}

//GETS THE TOTAL PRODUCT SALES FOR ALL ITEMS IN THIS DEPT
function getTotalProductSales(dept, newOHC) {
    connection.query("SELECT SUM(product_sales) AS totalProductSales FROM products WHERE department_name = ?", [dept], function (err, res) {
        if (err) throw err;
        let totalProductSales;
        for (let i = 0; i < res.length; i++) {
            totalProductSales = res[i].totalProductSales;
        }
        console.log("Total product sales for " + dept + " is: " + totalProductSales);
        updateProductSales(dept,newOHC, totalProductSales)
    })
}


//UPDATES THE NEW PRODUCT SALES FOR THIS DEPT TO DEPARTMENTS TABLE
function updateProductSales(dept,newOHC, totalProductSales) {
    connection.query("UPDATE departments SET ? WHERE ?",
        [
            { product_sales: totalProductSales },
            { department_name: dept }
        ], function (err, res) {
            if (err) throw err;
            console.log(res.affectedRows + " The total product sales for " + dept + " has been updated in the Departments Table to: " + totalProductSales + " !\n");
            let totalProfit = parseFloat(totalProductSales - newOHC).toFixed(2);
            updateTotalProfit(dept, totalProfit, newOHC)
        })
}

//UPDATES THE NEW TOTAL PROFIT FOR THIS DEPT TO DEPARTMENTS TABLE
function updateTotalProfit(dept, totalProfit, newOHC) {

    connection.query("UPDATE departments SET ?,? WHERE ?",
        [
            { over_head_cost: newOHC },
            { total_profit: totalProfit },
            { department_name: dept }
        ], function (err, res) {
            if (err) throw err;
            console.log(res.affectedRows + " The total profit for " + dept + " has been updated in the Departments Table to: " + totalProfit + " !\n");
        })
}
//**********************************************************************************************************//
//END OF FUNCTION
