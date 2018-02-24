DROP DATABASE IF EXISTS bamazon_DB;
CREATE DATABASE bamazon_DB;

USE bamazon_DB;

CREATE TABLE products
(
  item_id INT NOT NULL AUTO_INCREMENT,
  product_name VARCHAR
  (100) NOT NULL,
  department_name VARCHAR
  (100) NOT NULL,
  price DECIMAL
  (10,2) NOT NULL,
  stock_quantity INT
  (10),
  purchased_price DECIMAL
  (10,2) NOT NULL,
  PRIMARY KEY
  (item_id)
);



  INSERT INTO products
    (product_name, department_name, price, stock_quantity, purchased_price)
  VALUES
    ("iPhone-X 256GB Black", "CELL PHONES", 999.99, 34, 799.99);


  INSERT INTO products
    (product_name, department_name, price, stock_quantity, purchased_price)
  VALUES
    ("iPhone X Leather Case", "CELL PHONE ACCESSORIES", 49.99, 41, 29.99);

  INSERT INTO products
    (product_name, department_name, price, stock_quantity, purchased_price)
  VALUES
    ("Learn JavaScrip", "BOOKS", 9.99, 112, 5.99),
    ("Cooking with Gabe Cookbook", "BOOKS", 59.99, 18, 5.99);

  INSERT INTO products
    (product_name, department_name, price, stock_quantity, purchased_price)
  VALUES
    ("Nepresso Camal Pods", "COFFEE", 8.99, 220, 4.99),
    ("Nepresso Descaling Cleaner", "COFFEE", 9.99, 125, 4.99);

  INSERT INTO products
    (product_name, department_name, price, stock_quantity, purchased_price)
  VALUES
    ("Yankee Vanilla Scented Candles", "CANDLES", 15.99, 54, 10.99),
    ("Yankee Blueberry Scented Candles", "CANDLES", 16.99, 12, 11.99);

  INSERT INTO products
    (product_name, department_name, price, stock_quantity, purchased_price)
  VALUES
    ("Philadelphia Eagles SB52 Hat", "NFL", 29.99, 96, 10.99),
    ("Philadelphia Eagles SB52 Shirt Large", "NFL", 29.99, 44, 19.99);


  SELECT * FROM products;

ALTER TABLE products
ADD product_sales DECIMAL (10,2) DEFAULT 0;

  SELECT * FROM products;
