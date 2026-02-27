package main

import (
	"fmt"
	"log"
	"os/exec"
	"path/filepath"
	"strings"
	"sync"
)

func main() {
	urls := []string{
		"http://localhost:1313/",
	}

	var wg sync.WaitGroup

	for _, url := range urls {
		wg.Add(1)
		go func(target string) {
			defer wg.Done()
			runLighthouse(target)
		}(url)
	}

	wg.Wait()
	fmt.Println("\n--- All audits completed. Click the links above to view reports. ---")
}

func convertUrlToFilename(url string) string {
	// Replacing /, :, and . with underscores for a clean filename
	r := strings.NewReplacer(
		"https://", "",
		"http://", "",
		"/", "_",
		":", "_",
		".", "_",
	)
	safeName := r.Replace(url)
	return strings.Trim(safeName, "_")
}

func runLighthouse(url string) {
	safeName := convertUrlToFilename(url)

	tasks := []struct {
		name   string
		path   string
		preset string
		flags  string
	}{
		{name: "Desktop", path: fmt.Sprintf("./output/%s.desktop.html", safeName), preset: "desktop", flags: "--headless"},
		{name: "Mobile", path: fmt.Sprintf("./output/%s.mobile.html", safeName), preset: "", flags: "--headless"},
	}

	var taskWg sync.WaitGroup

	for _, t := range tasks {
		taskWg.Add(1)
		go func(task struct {
			name   string
			path   string
			preset string
			flags  string
		}) {
			defer taskWg.Done()

			fmt.Printf("Starting %s audit for: %s ...\n", task.name, url)

			args := []string{
				url,
				"--output", "html",
				"--output-path", task.path,
				"--chrome-flags=" + task.flags,
			}

			if task.preset != "" {
				args = append(args, "--preset="+task.preset)
			}

			cmd := exec.Command("lighthouse", args...)
			err := cmd.Run()

			if err != nil {
				log.Printf("Error auditing %s (%s): %v\n", url, task.name, err)
			} else {
				// Get absolute path to ensure the file:// link is valid
				absPath, _ := filepath.Abs(task.path)
				
				fmt.Printf("✓ %s Report Ready: file://%s\n", task.name, absPath)
			}
		}(t)
	}

	taskWg.Wait()
}