package main

import (
	"context"
	"encoding/json"
	"net/http"

	"go.mongodb.org/mongo-driver/bson"
)

// GoalHandler GET/POST user reading goal
func GoalHandler(w http.ResponseWriter, r *http.Request) {
	user := r.Context().Value("username").(string)
	switch r.Method {
	case "POST":
		var payload struct{ Goal int }
		json.NewDecoder(r.Body).Decode(&payload)
		userCollection.UpdateOne(
			context.Background(),
			bson.M{"username": user},
			bson.M{"$set": bson.M{"readingGoal": payload.Goal}},
		)
		json.NewEncoder(w).Encode(map[string]string{"msg": "Goal set"})
	case "GET":
		var u User
		userCollection.FindOne(context.Background(), bson.M{"username": user}).Decode(&u)
		json.NewEncoder(w).Encode(map[string]int{"readingGoal": u.ReadingGoal})
	}
}