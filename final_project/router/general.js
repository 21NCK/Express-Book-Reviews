const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
  
    // Check if username already exists
    const userExists = users.some(user => user.username === username);
    if (userExists) {
      return res.status(409).json({ message: "Username already exists" });
    }
  
    // Add new user to users array
    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully" });
  });

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
  
    try {
      const book = await new Promise((resolve, reject) => {
        if (books[isbn]) {
          resolve(books[isbn]);
        } else {
          reject("Book not found");
        }
      });
  
      res.status(200).send(JSON.stringify(book, null, 4));
    } catch (err) {
      res.status(404).json({ message: err });
    }
  });
  
// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
    const authorParam = req.params.author.toLowerCase();
  
    try {
      const booksByAuthor = await new Promise((resolve, reject) => {
        const result = {};
        for (let isbn in books) {
          if (books[isbn].author.toLowerCase() === authorParam) {
            result[isbn] = books[isbn];
          }
        }
  
        if (Object.keys(result).length > 0) {
          resolve(result);
        } else {
          reject("No books found by this author");
        }
      });
  
      res.status(200).send(JSON.stringify(booksByAuthor, null, 4));
    } catch (err) {
      res.status(404).json({ message: err });
    }
  });

// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
    const titleParam = req.params.title.toLowerCase();
  
    try {
      const booksByTitle = await new Promise((resolve, reject) => {
        const result = {};
        for (let isbn in books) {
          if (books[isbn].title.toLowerCase() === titleParam) {
            result[isbn] = books[isbn];
          }
        }
  
        if (Object.keys(result).length > 0) {
          resolve(result);
        } else {
          reject("No books found with this title");
        }
      });
  
      res.status(200).send(JSON.stringify(booksByTitle, null, 4));
    } catch (err) {
      res.status(404).json({ message: err });
    }
  });

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
  
    if (book && book.reviews) {
      return res.status(200).json(book.reviews);
    } else if (book) {
      return res.status(200).json({ message: "No reviews for this book" });
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  });
  const axios = require('axios');

  public_users.get('/', async function (req, res) {
    try {
      // Simulating an async operation (e.g., fetching from a service)
      const booksData = await new Promise((resolve, reject) => {
        resolve(books);
      });
  
      res.status(200).send(JSON.stringify(booksData, null, 4));
    } catch (err) {
      res.status(500).json({ message: "Error fetching books" });
    }
  });
module.exports.general = public_users;
