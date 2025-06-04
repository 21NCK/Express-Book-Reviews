const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{   
    return users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ 
      return users.some(user => user.username === username && user.password === password);
}
const JWT_SECRET = "21NCK";
//only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    // Check if fields are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Check if user exists and password matches
    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });

    // Return token
    return res.status(200).json({ message: "Login successful", token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;

    if (!review) {
        return res.status(400).json({ message: "Review query parameter is required" });
    }

    // 🔐 Get username from JWT (via request.user)
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Authorization token missing" });

    try {
        const decoded = jwt.verify(token, "21NCK");
        const username = decoded.username;

        // Find book
        if (!books[isbn]) {
            return res.status(404).json({ message: "Book not found" });
        }

        // Add or update review
        if (!books[isbn].reviews) {
            books[isbn].reviews = {};
        }

        books[isbn].reviews[username] = review;

        return res.status(200).json({
            message: "Review added/updated successfully",
            reviews: books[isbn].reviews
        });

    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
});
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
  
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }
  
    const token = authHeader.split(" ")[1];
    let username;
    try {
      const decoded = jwt.verify(token, "21NCK"); // Replace with your actual key
      username = decoded.username;
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
  
    // Check if the book exists
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }
  
    // Check if the user has posted a review
    if (!books[isbn].reviews || !books[isbn].reviews[username]) {
      return res.status(404).json({ message: "You have not posted a review for this book" });
    }
  
    // Delete the review
    delete books[isbn].reviews[username];
  
    return res.status(200).json({
      message: "Review deleted successfully",
      reviews: books[isbn].reviews
    });
  });
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
