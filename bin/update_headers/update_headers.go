package main

import (
	"bufio"
	"fmt"
	"os"
	"strings"
)

func main() {
	toRemove := []string{
		"http://localhost:8081/api/v1",
	}

	file, err := os.Open("config/_default/hugo.toml")
	if err != nil {
		fmt.Printf("Error: %v\n", err)
		os.Exit(1)
	}
	defer file.Close()

	var output strings.Builder
	output.WriteString("# Generated from hugo.toml - DO NOT EDIT\n\n")

	scanner := bufio.NewScanner(file)
	var currentPath string
	inValuesBlock := false

	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())

		// Capture the URL path (e.g., for = "/*")
		if strings.HasPrefix(line, "for =") {
			parts := strings.SplitN(line, "=", 2)
			if len(parts) > 1 {
				currentPath = strings.Trim(parts[1], " \"")
			}
			inValuesBlock = false 
		}

		// Look for the start of the headers section
		if line == "[server.headers.values]" {
			if currentPath != "" {
				output.WriteString(currentPath + "\n")
			}
			inValuesBlock = true
			continue
		}

		if inValuesBlock {
			// Stop if we hit a new TOML block
			if strings.HasPrefix(line, "[") {
				inValuesBlock = false
				continue
			}

			// Process Key = "Value"
			if strings.Contains(line, "=") && !strings.HasPrefix(line, "#") {
				parts := strings.SplitN(line, "=", 2)
				key := strings.TrimSpace(parts[0])
				val := strings.Trim(strings.TrimSpace(parts[1]), "\"")

				// Only sanitize if it's the CSP header
				if key == "Content-Security-Policy" {
					for _, target := range toRemove {
						val = strings.ReplaceAll(val, target, "")
					}
					val = strings.Join(strings.Fields(val), " ")
				}

				output.WriteString(fmt.Sprintf("  %s: %s\n", key, val))
			}
		}
	}

	// Save to the static folder for Netlify/Cloudflare deployment
	err = os.WriteFile("static/_headers", []byte(output.String()), 0644)
	if err != nil {
		fmt.Printf("Error writing file: %v\n", err)
		os.Exit(1)
	}

	fmt.Println("Successfully synced hugo.toml to static/_headers and sanitized CSP.")
}