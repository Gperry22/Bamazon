require("dotenv").config();

var mysql = require("mysql");
var inquirer = require("inquirer");
var clear = require("clear");

var connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PW,
  database: "bamazon_DB"
});



connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);
  clear();
  start();
});



                            //FUNCTIONS TO PROMPT USER//
//**********************************************************************************************************//
function start() {
  inquirer
    .prompt({
      name: "choice",
      type: "list",
      message: "What would you like to do?",
      choices: ["View Overhead Cost and Profits by Department", "Create New Department for Managers to add Products to"]
    })
    .then(function(answer) {
      switch (answer.choice) {
        case "View Overhead Cost and Profits by Department":
          //   viewSalesByDept();
          getDeptTotalSales();
          break;
        case "Create New Department for Managers to add Products to":
          createDept();
          break;
      }
    });
}
//**********************************************************************************************************//
//END OF FUNCTION


                            //FUNCTIONS TO GET TOTAL OVERHEAD AND PROFITS//
//**********************************************************************************************************//
function getDeptTotalSales() {
  connection.query(
    "SELECT * FROM departments",
    function(err, res) {
      if (err) throw err;
      // console.log(res);
      for (let i = 0; i < res.length; i++) {
        console.log(
          "DEPT_ID: " +
            res[i].department_id +
            "  DEPT NAME: " +
            res[i].department_name +
            "  Over Head COST: " +
            res[i].over_head_cost +
            "  PRODUCT SALES: " +
            res[i].product_sales +
            "  PROFIT: " +
            res[i].total_profit
        );     
      }
      start();
    }
  );
}
//**********************************************************************************************************//
//END OF FUNCTION


                            //FUNCTIONS TO CREATE DEPT//
//**********************************************************************************************************//
function createDept() {
  inquirer
    .prompt([
      {
        name: "dept",
        type: "input",
        message:
          "Enter the Name of the Dept to create. Must be more than 1 Letter to continue.",
        validate: function(value) {
          if (value.length > 1) {
            return true;
          }
          return false;
        }
      }
    ])
    .then(function(answer) {
      var dept = answer.dept.toUpperCase();

      checkDept(dept);
      // CHECKS IF THERE IS A CURRENT DEPARTMENT ALREADY CREATED
      function checkDept(dept) {
        connection.query("SELECT department_name FROM departments", function(
          err,
          results
        ) {
          if (err) throw err;
          var choiceArray = [];
          for (let i = 0; i < results.length; i++) {
            choiceArray.push(results[i].department_name);
          }
          if (!choiceArray.includes(dept)) {
            console.log(
              "There is not department by this name and it will now be created."
            );
            connection.query(
              "INSERT INTO departments SET ?",
              {
                department_name: dept,
                over_head_cost: 0.0,
                product_sales: 0.0,
                total_profit: 0.0
              },
              function(err, res) {
                if (err) throw err;
                console.log(
                  res.affectedRows + " Dept inserted in Departments\n");
                start();
              }
            );
          } else {
            console.log(dept +" is already current department. Please restart and try again.");
              start();
            }
        });
      }
    });
}
//**********************************************************************************************************//
//END OF FUNCTION
