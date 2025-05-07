package main

import (
	"context"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	client         *mongo.Client
	userCollection *mongo.Collection
	pdfCollection  *mongo.Collection
	DatabaseContext context.Context
	cancelDatabaseContext context.CancelFunc
)

func InitializeDatabase() *mongo.Client {
	DatabaseContext, cancelDatabaseContext = context.WithTimeout(context.Background(), 10*time.Second)

	var err error
	client, err = mongo.Connect(DatabaseContext, options.Client().
		ApplyURI(os.Getenv("MONGO_URI")))
	if err != nil {
		log.Fatal(err)
	}

	if err = client.Ping(DatabaseContext, nil); err != nil {
		log.Fatal("Mongo ping failed:", err)
	}

	return client
}