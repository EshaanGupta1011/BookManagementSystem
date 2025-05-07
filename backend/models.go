package main

import (
	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// User model
type User struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Username    string             `bson:"username"    json:"username"`
	Email       string             `bson:"email"       json:"email"`
	Password    string             `bson:"password"    json:"password"`
	ReadingGoal int                `bson:"readingGoal,omitempty" json:"readingGoal"`
}

// PDF model
type PDF struct {
	ID         primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Title      string             `bson:"title"       json:"title"`
	Subject    string             `bson:"subject"     json:"subject"`
	Year       int                `bson:"year"        json:"year"`
	FilePath   string             `bson:"filePath"    json:"filePath"`
	UploadedBy string             `bson:"uploadedBy"  json:"uploadedBy"`
}

// Claims holds JWT data
type Claims struct {
	Username string `json:"username"`
	jwt.RegisteredClaims
}