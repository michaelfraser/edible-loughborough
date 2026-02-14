package main

import (
	"bufio"
	"fmt"
	"os"
	"strings"
)

func main() {
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

		if strings.HasPrefix(line, "for =") {
			currentPath = strings.Trim(strings.Split(line, "=")[1], " \"")
			inValuesBlock = false // Reset for new block
		}

		if line == "[server.headers.values]" {
			if currentPath != "" {
				output.WriteString(currentPath + "\n")
			}
			inValuesBlock = true
			continue
		}

		if inValuesBlock {
			// If we hit a new block or a comment that isn't a header, stop capturing
			if strings.HasPrefix(line, "[") || strings.HasPrefix(line, "[[") {
				inValuesBlock = false
				continue
			}

			// Extract Key = "Value"
			if strings.Contains(line, "=") && !strings.HasPrefix(line, "#") {
				parts := strings.SplitN(line, "=", 2)
				key := strings.TrimSpace(parts[0])
				val := strings.Trim(strings.TrimSpace(parts[1]), "\"")
				output.WriteString(fmt.Sprintf("  %s: %s\n", key, val))
			}
		}
	}

	err = os.WriteFile("static/_headers", []byte(output.String()), 0644)
	if err != nil {
		fmt.Printf("Error writing file: %v\n", err)
		os.Exit(1)
	}

	fmt.Println("Successfully synced hugo.toml to static/_headers")
}