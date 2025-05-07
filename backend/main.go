package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
	"github.com/joho/godotenv"
)

func init() {
	// Load .env if present
	if err := godotenv.Load(); err != nil {
		log.Println("no .env file found, relying on real env vars")
	} else {
		log.Println(".env found and loaded")
	}
}

func main() {
	// Connect to MongoDB
	client := InitializeDatabase()
	defer client.Disconnect(DatabaseContext)

	userCollection = client.Database("bookmgmt").Collection("users")
	pdfCollection = client.Database("bookmgmt").Collection("pdfs")

	r := mux.NewRouter()
	// Public
	r.HandleFunc("/signup", SignupHandler).Methods("POST")
	r.HandleFunc("/login", LoginHandler).Methods("POST")
	r.HandleFunc("/search", SearchHandler).Methods("GET")

	// User routes
	r.HandleFunc("/upload", AuthMiddleware(UploadHandler)).Methods("POST")
	r.HandleFunc("/goal", AuthMiddleware(GoalHandler)).Methods("POST", "GET")
	r.HandleFunc("/myuploads", AuthMiddleware(MyUploadsHandler)).Methods("GET")

	// Admin routes
	r.HandleFunc("/admin/login", AdminLoginHandler).Methods("POST")
	r.HandleFunc("/admin/users", AuthAdminMiddleware(AdminUsersHandler)).Methods("GET")
	r.HandleFunc("/admin/uploads", AuthAdminMiddleware(AdminUploadsHandler)).Methods("GET")
	r.HandleFunc("/admin/pdf/{id}", AuthAdminMiddleware(AdminDeletePDFHandler)).Methods("DELETE")
	r.HandleFunc("/admin/upload", AuthAdminMiddleware(UploadHandler)).Methods("POST")

	// Static file serving
	fs := http.FileServer(http.Dir("./uploads"))
	r.PathPrefix("/uploads/").Handler(http.StripPrefix("/uploads/", fs))

	// CORS
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
	})
	handler := c.Handler(r)

	fmt.Println("Server running on port 8000")
	log.Fatal(http.ListenAndServe(":8000", handler))
}