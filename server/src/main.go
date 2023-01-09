package main

import (
	"log"
	"os"

	"github.com/SixNines/sitc-sales-demo/cli"
)

// Initiate web server
func main() {
	log.SetOutput(os.Stderr)

	cumulusCli := cli.Cli()
	cumulusCli.Execute()
}
