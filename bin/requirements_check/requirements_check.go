package main

import (
	"fmt"
	"os"
	"os/exec"
	"regexp"
	"strings"

	"golang.org/x/mod/semver"
)

type RequirementType string

const (
	CheckExact RequirementType = "exact"
	CheckMin   RequirementType = "min"
	// Exit codes following standard CLI conventions
	ExitSuccess         = 0
	ExitVersionMismatch = 1
	ExitToolMissing     = 2
	ExitExecutionError  = 3
)

type Requirement struct {
	Name      string
	Args      []string
	Version   string
	CheckType RequirementType
}

func main() {
	// Define your tool version requirements here
	requirements := []Requirement{
		{
			Name:      "hugo",
			Args:      []string{"version"},
			Version:   "v0.128.0",
			CheckType: CheckExact,
		},
		{
			Name:      "go",
			Args:      []string{"version"},
			Version:   "v1.26.0",
			CheckType: CheckExact,
		},
		{
			Name:      "node",
			Args:      []string{"--version"},
			Version:   "v25.2.1",
			CheckType: CheckExact,
		},
		{
			Name:      "netlify",
			Version:   "27.4.1",
			CheckType: CheckExact,
		},
	}

	fmt.Println("Checking system tool requirements...")

	finalExitCode := ExitSuccess

	for _, req := range requirements {
		if err, exitCode := checkRequirement(req); err != nil {
			fmt.Printf("❌ %s: %v\n", req.Name, err)

			// Priority: Preserve version mismatches over other errors if multiple checks fail
			if finalExitCode == ExitSuccess || exitCode == ExitVersionMismatch {
				finalExitCode = exitCode
			}
		} else {
			fmt.Printf("✅ %s: requirements met\n", req.Name)
		}
	}

	if finalExitCode != ExitSuccess {
		fmt.Printf("\nCheck failed with exit code %d.\n", finalExitCode)
		os.Exit(finalExitCode)
	}

	fmt.Println("\nAll system requirements are satisfied!")
	os.Exit(ExitSuccess)
}

func checkRequirement(req Requirement) (error, int) {
	execPath, err := exec.LookPath(req.Name)
	if err != nil {
		return fmt.Errorf("not installed or not found in PATH"), ExitToolMissing
	}

	out, err := exec.Command(execPath, req.Args...).CombinedOutput()
	if err != nil {
		return fmt.Errorf("failed to run command: %w", err), ExitExecutionError
	}

	rawVersion := extractSemver(string(out))
	if rawVersion == "" {
		return fmt.Errorf("could not parse version from output: %q", strings.TrimSpace(string(out))), ExitExecutionError
	}

	if !strings.HasPrefix(rawVersion, "v") {
		rawVersion = "v" + rawVersion
	}

	if !semver.IsValid(rawVersion) {
		return fmt.Errorf("extracted string %q is not valid semver", rawVersion), ExitExecutionError
	}

	target := req.Version
	if !strings.HasPrefix(target, "v") {
		target = "v" + target
	}

	switch req.CheckType {
	case CheckExact:
		if semver.Canonical(rawVersion) != semver.Canonical(target) {
			return fmt.Errorf("found %s, but exact required version is %s", rawVersion, target), ExitVersionMismatch
		}
	case CheckMin:
		if semver.Compare(rawVersion, target) < 0 {
			return fmt.Errorf("found %s, but minimum required version is %s", rawVersion, target), ExitVersionMismatch
		}
	}

	return nil, ExitSuccess
}

func extractSemver(input string) string {
	re := regexp.MustCompile(`v?(\d+\.\d+\.\d+)`)
	matches := re.FindStringSubmatch(input)
	if len(matches) > 1 {
		return matches[1]
	}
	return ""
}
