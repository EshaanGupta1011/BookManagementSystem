package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strconv"
	"time"

	"go.mongodb.org/mongo-driver/bson"
)

// SearchHandler lets anyone search PDFs by subject/year
func SearchHandler(w http.ResponseWriter, r *http.Request) {
	filter := bson.M{}
	if s := r.URL.Query().Get("subject"); s != "" {
		filter["subject"] = s
	}
	if y := r.URL.Query().Get("year"); y != "" {
		if yi, err := strconv.Atoi(y); err == nil {
			filter["year"] = yi
		}
	}
	cur, err := pdfCollection.Find(context.Background(), filter)
	if err != nil {
		http.Error(w, "DB error", http.StatusInternalServerError)
		return
	}
	defer cur.Close(context.Background())
	var out []PDF
	for cur.Next(context.Background()) {
		var p PDF
		cur.Decode(&p)
		out = append(out, p)
	}
	json.NewEncoder(w).Encode(out)
}

// UploadHandler handles both user & admin uploads
func UploadHandler(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		http.Error(w, "Bad form", http.StatusBadRequest)
		return
	}
	file, hdr, err := r.FormFile("pdf")
	if err != nil {
		http.Error(w, "No file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	name := fmt.Sprintf("%d_%s", time.Now().UnixNano(), hdr.Filename)
	os.MkdirAll("./uploads", os.ModePerm)
	out, _ := os.Create("./uploads/" + name)
	defer out.Close()
	io.Copy(out, file)

	year, _ := strconv.Atoi(r.FormValue("year"))
	p := PDF{
		Title:      r.FormValue("title"),
		Subject:    r.FormValue("subject"),
		Year:       year,
		FilePath:   name,
		UploadedBy: r.Context().Value("username").(string),
	}
	pdfCollection.InsertOne(context.Background(), p)
	json.NewEncoder(w).Encode(map[string]string{"msg": "Uploaded"})
}

// MyUploadsHandler returns only the logged-in user’s PDFs
func MyUploadsHandler(w http.ResponseWriter, r *http.Request) {
	user := r.Context().Value("username").(string)
	cur, _ := pdfCollection.Find(context.Background(), bson.M{"uploadedBy": user})
	defer cur.Close(context.Background())
	var out []PDF
	for cur.Next(context.Background()) {
		var p PDF
		cur.Decode(&p)
		out = append(out, p)
	}
	json.NewEncoder(w).Encode(out)
}