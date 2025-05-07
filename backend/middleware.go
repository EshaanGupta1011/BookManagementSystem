package main

import (
	"context"
	"net/http"
	"os"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

// ——— Middleware ——————————————————————————————————

func AuthMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// parse Bearer token
		h := r.Header.Get("Authorization")
		parts := strings.SplitN(h, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		tkn := parts[1]

		claims := &Claims{}
		t, err := jwt.ParseWithClaims(tkn, claims, func(t *jwt.Token) (interface{}, error) {
			return jwtKey, nil
		})
		if err != nil || !t.Valid {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		// stash username & full claims
		ctx := context.WithValue(r.Context(), "username", claims.Username)
		ctx = context.WithValue(ctx, "claims", claims)
		next(w, r.WithContext(ctx))
	} // Added the missing closing curly brace
}

// AuthAdminMiddleware ensures the JWT user == ADMIN_USER
func AuthAdminMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return AuthMiddleware(func(w http.ResponseWriter, r *http.Request) {
		if r.Context().Value("username") != os.Getenv("ADMIN_USER") {
			http.Error(w, "Forbidden", http.StatusForbidden)
			return
		}
		next(w, r)
	})
}