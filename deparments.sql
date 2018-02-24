USE bamazon_DB;

CREATE TABLE departments
(
  department_id INT NOT NULL AUTO_INCREMENT,
  department_name VARCHAR (100) NOT NULL,
  over_head_cost DECIMAL(10,2) DEFAULT 0,
  product_sales DECIMAL(10,2) DEFAULT 0,
  total_profit DECIMAL(10,2) DEFAULT 0,
  PRIMARY KEY
    (department_id)
);


INSERT INTO departments
    (department_name)
VALUES
    ("CELL PHONES"),
    ("CELL PHONE ACCESSORIES"),
    ("BOOKS"),
    ("COFFEE"),
    ("CANDLES"),
    ("NFL");

 SELECT * FROM departments;   
    