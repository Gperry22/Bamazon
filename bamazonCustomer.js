require("dotenv").config();

var mysql = require("mysql");
var inquirer = require("inquirer");
var clear = require("clear");
var itemsNumber = 0;



var connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PW,
  database: "bamazon_DB"
});


connection.connect(function (err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);
  clear();
  itemsLength();
  start();
});
                            //FUNCTIONS TO PROMPT USER//
//**********************************************************************************************************//
function start() {
  inquirer
    .prompt({
      name: "buyOrBrowse",
      type: "rawlist",
      message:
        "\nWelcome to Bamazon, Would you like me to show you want we have in stock?",
      choices: ["YES", "NOPE"]
    })
    .then(function (answer) {
      // based on their answer, either call the bid or the post functions
      if (answer.buyOrBrowse.toUpperCase() === "YES") {
        listItemsForSale();
      } else {
        sayGoodbye();
      }
    });
}
//**********************************************************************************************************//
//END OF FUNCTION



                            //FUNCTIONS TO LIST ITEM FOR SALE//
//**********************************************************************************************************//
function listItemsForSale() {
  connection.query("SELECT * FROM products", function (err, results) {
    if (err) throw err;
    var choiceArray = [];
    for (let i = 0; i < results.length; i++) {
      choiceArray.push(
        "Item " +
        results[i].item_id +
        " " +
        results[i].product_name +
        "  Price: " +
        results[i].price +
        "  In Stock: " +
        results[i].stock_quantity
      );
    }
    console.log("\nGreat Here they are:");
    console.log("\nBamazon deals of the Day\n");
    console.log(choiceArray);
    purchaseItem();
  });
}

function sayGoodbye() {
  console.log("Okay well maybe another time.");
  connection.end();

}
//**********************************************************************************************************//
//END OF FUNCTION

                            //FUNCTIONS TO PURCHASE AN IT//
//**********************************************************************************************************//
function purchaseItem() {
  inquirer
    .prompt([
      {
        name: "item",
        type: "input",
        message: "Please enter the Item Number of the item you'd like to buy.",
        validate: function (value) {
          if (isNaN(value) === false && value >= 1 && value <= itemsNumber) {
            return true;
          }
          return false;
        }
      },
      {
        name: "amount",
        type: "input",
        message: "Please enter the Quantity of the item you'd like to buy.",
        validate: function (value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
      }
    ])
    .then(function (answer) {
      var itemUserWants = parseInt(answer.item);
      var amountUserWants = parseInt(answer.amount);
      checkAmountInStock(itemUserWants, amountUserWants);
    });
}

//CHECKS STOCK OF ITEM
function checkAmountInStock(itemUserWants, amountUserWants) {
  var query = "SELECT price,stock_quantity,department_name FROM products WHERE ?"; 
  connection.query(query, { item_id: itemUserWants }, function (err, res) {
    if (err) throw err;
    

    for (let i = 0; i < res.length; i++) {
      let amountOnHand = res[i].stock_quantity;
      let priceOfItem = res[i].price;
      let dept = res[i].department_name;
     
      if (res[i].stock_quantity >= amountUserWants) {

        updateAndChargeUser(itemUserWants, amountUserWants, amountOnHand, priceOfItem, dept); //(itemUserWants, AmountUserWants, AmountOnHand, Price)
        return true;
      } else {
        console.log(
          `I'm sorry we don't have ${amountUserWants} quantities of this item in stock. We only have ${amountOnHand} in stock. Please chose a lower amount.`
        );
        purchaseItem();
        return false;
      }
    }
  });
}

//UPDATES STOCK QUANTITY AND CHARGES USER
function updateAndChargeUser(itemUserWants, amountUserWants, amountOnHand, price, dept) {
  //(itemUserWants, AmountUserWants, AmountOnHand, Price)
  var getTotal = parseFloat(amountUserWants) * parseFloat(price);
  var userTotal = getTotal.toFixed(2);
  var amountInStockLeft = parseInt(amountOnHand) - parseInt(amountUserWants);
  console.log("\nYour total is: $" + userTotal);
  console.log("Thanks for your order!");
  console.log("It will be processed and shipped out within 24 Hours!");
  var query = connection.query(
    "UPDATE products SET ? WHERE ?",
    [
      {
        stock_quantity: amountInStockLeft
      },
      {
        item_id: itemUserWants
      }
    ],
    function (err, res) {
      console.log(
        res.affectedRows +
        " The Stock Quantity for this item has been updated to: " +
        amountInStockLeft +
        "\n"
      );
    }
  );
  getProductSales(itemUserWants, amountUserWants, dept);
}

function getProductSales(itemUserWants, amountUserWants, dept) {
  //(itemUserWants,AmountUserWants)
  var updateSales;
  var query = "SELECT product_sales, price FROM products WHERE ?";
  connection.query(query, { item_id: itemUserWants }, function (err, res) {
    if (err) throw err;
    for (let i = 0; i < res.length; i++) {
      let salesAlreadyInDb = res[i].product_sales;
      let price = res[i].price;
      let salesEquation = parseFloat(salesAlreadyInDb + (amountUserWants * price));
      updateSales = salesEquation.toFixed(2);
    }
    addToProductSales(itemUserWants, updateSales, dept);
  });
}

function addToProductSales(itemUserWants, updatedSales, dept) {
  //(itemUserWants,UpdatedSales)
  connection.query("UPDATE products SET ? WHERE ?",
    [
      {
        product_sales: updatedSales
      },
      {
        item_id: itemUserWants
      }
    ],
    function (err, res) {
      console.log(
        res.affectedRows +
        " The sales for this item has been updated to: " + updatedSales +"\n"); // Shows Affect # of Rows
      getTotalProductSales(dept)
    }
  );
}
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
//GETS THE TOTAL PRODUCT SALES FOR ALL ITEMS IN THIS DEPT
function getTotalProductSales(dept) {
  connection.query("SELECT SUM(product_sales) AS totalProductSales FROM products WHERE department_name = ?", [dept], function (err, res) {
    if (err) throw err;
    let totalProductSales;
    for (let i = 0; i < res.length; i++) {
      totalProductSales = res[i].totalProductSales;
    }
    console.log("Total product sales for " + dept + " is: " + totalProductSales);
    updateProductSales(dept, totalProductSales)
  })
}


//UPDATES THE NEW PRODUCT SALES FOR THIS DEPT TO DEPARTMENTS TABLE
function updateProductSales(dept, totalProductSales) {
  connection.query("UPDATE departments SET ? WHERE ?",
    [
      { product_sales: totalProductSales },
      { department_name: dept }
    ], function (err, res) {
      if (err) throw err;
      console.log(res.affectedRows + " The total product sales for " + dept + " has been updated in the Departments Table to: " + totalProductSales + " !\n");
      getTotalStock(dept, totalProductSales)
    })
}

//GETS THE TOTAL STOCK FOR ALL ITEMS IN THIS DEPT
function getTotalStock(dept, totalProductSales) {
  connection.query("SELECT SUM(stock_quantity) AS totalStock FROM products WHERE department_name = ?", [dept], function (err, res) {
    if (err) throw err;
    let totalStock;
    for (let i = 0; i < res.length; i++) {
      totalStock = res[i].totalStock;
    }
    console.log("Total stock for " + dept + " is: " + totalStock);
    getTotalPurchasedPrice(dept, totalProductSales, totalStock)
  })
}

//GETS THE TOTAL OVERHEAD COST FOR ALL ITEMS IN THIS DEPT
function getTotalPurchasedPrice(dept, totalProductSales, totalStock) {
  connection.query("SELECT SUM(purchased_price) AS totalPurchasePrice FROM products WHERE department_name = ?", [dept], function (err, res) {
    if (err) throw err;
    let totalPurPrice;
    let totalProfit;
    let overheadCost;
    for (let i = 0; i < res.length; i++) {
      totalPurPrice = res[i].totalPurchasePrice;
    }
    overheadCost = parseFloat(totalStock * totalPurPrice);
    totalProfit = parseFloat(totalProductSales-overheadCost).toFixed(2);
    Math.sign(totalProfit); 
    console.log("Total overhead cost for " + dept + " is: " + overheadCost.toFixed(2));
    console.log("Total Profit for " + dept + " is: " + totalProfit);
    updateTotalProfit(dept, totalProfit, overheadCost)
  })
}

//UPDATES THE NEW TOTAL PROFIT FOR THIS DEPT TO DEPARTMENTS TABLE
function updateTotalProfit(dept, totalProfit, overheadCost) {
  connection.query("UPDATE departments SET ?,? WHERE ?",
    [
      { over_head_cost: overheadCost },
      { total_profit: totalProfit },
      { department_name: dept }
    ], function (err, res) {
      if (err) throw err;
      console.log(res.affectedRows + " The total profit for " + dept + " has been updated in the Departments Table to: " + totalProfit + " !\n");
    })
}
//**********************************************************************************************************//
//END OF FUNCTION