package main

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"go.mongodb.org/mongo-driver/bson" // Added this import
)

var jwtKey = []byte(os.Getenv("JWT_KEY"))

// SignupHandler registers a new user and hashes their password
func SignupHandler(w http.ResponseWriter, r *http.Request) {
	var u User
	if err := json.NewDecoder(r.Body).Decode(&u); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Check duplicates
	filter := bson.M{"$or": []bson.M{
		{"username": u.Username},
		{"email": u.Email},
	}}
	if count, _ := userCollection.CountDocuments(context.Background(), filter); count > 0 {
		http.Error(w, "Username or email exists", http.StatusConflict)
		return
	}

	// **Hash the real incoming password**
	hashed, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Error hashing password", http.StatusInternalServerError)
		return
	}
	u.Password = string(hashed)

	_, err = userCollection.InsertOne(context.Background(), u)
	if err != nil {
		http.Error(w, "DB error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"msg": "User created"})
}

// LoginHandler authenticates a user and returns a JWT
func LoginHandler(w http.ResponseWriter, r *http.Request) {
	var creds struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	var u User
	err := userCollection.FindOne(context.Background(), bson.M{"username": creds.Username}).Decode(&u)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Compare the provided password with the stored hash
	if bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(creds.Password)) != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Issue JWT
	exp := time.Now().Add(24 * time.Hour)
	claims := &Claims{
		Username: u.Username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(exp),
		},
	}
	tokenStr, err := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(jwtKey)
	if err != nil {
		http.Error(w, "Error generating token", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"token": tokenStr})
}