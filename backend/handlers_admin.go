package main

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// AdminLoginHandler checks ADMIN_PASS and issues an admin JWT
func AdminLoginHandler(w http.ResponseWriter, r *http.Request) {
	var req struct{ Password string }
	json.NewDecoder(r.Body).Decode(&req)
	if req.Password != os.Getenv("ADMIN_PASS") {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	exp := time.Now().Add(24 * time.Hour)
	claims := &Claims{
		Username: os.Getenv("ADMIN_USER"),
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(exp),
		},
	}
	tok, err := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(jwtKey)
	if err != nil {
		http.Error(w, "Token err", http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(map[string]string{"token": tok})
}

// AdminUsersHandler lists all users
func AdminUsersHandler(w http.ResponseWriter, r *http.Request) {
	cur, _ := userCollection.Find(context.Background(), bson.M{})
	defer cur.Close(context.Background())
	var out []User
	for cur.Next(context.Background()) {
		var u User
		cur.Decode(&u)
		out = append(out, u)
	}
	json.NewEncoder(w).Encode(out)
}

// AdminUploadsHandler lists all PDFs
func AdminUploadsHandler(w http.ResponseWriter, r *http.Request) {
	cur, _ := pdfCollection.Find(context.Background(), bson.M{})
	defer cur.Close(context.Background())
	var out []PDF
	for cur.Next(context.Background()) {
		var p PDF
		cur.Decode(&p)
		out = append(out, p)
	}
	json.NewEncoder(w).Encode(out)
}

// AdminDeletePDFHandler deletes by ObjectID
func AdminDeletePDFHandler(w http.ResponseWriter, r *http.Request) {
	idHex := mux.Vars(r)["id"]
	oid, err := primitive.ObjectIDFromHex(idHex)
	if err != nil {
		http.Error(w, "Bad id", http.StatusBadRequest)
		return
	}
	pdfCollection.DeleteOne(context.Background(), bson.M{"_id": oid})
	w.WriteHeader(http.StatusNoContent)
}