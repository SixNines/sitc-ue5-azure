package cli

import (
	"log"
	"os"
	"strconv"

	"github.com/spf13/cobra"
)

type InitializeArgs struct {
	adminUserName string
	adminPassword string
	deploymentKey string
}

type ServerArgs struct {
	port int
}

type CLIArgs struct {
	init   InitializeArgs
	server ServerArgs
}

var cliArgs *CLIArgs

func Cli() *cobra.Command {

	cliArgs = &CLIArgs{}

	var initialize = &cobra.Command{
		Use:   "init",
		Short: "Initialize DB admin and generate secure Auth Key/Secret pair for API authorization.",
		Long:  "Initialize DB admin and generate secure Auth Key/Secret pair for API authorization.",
		Run: func(cmd *cobra.Command, args []string) {
			Initialize(cliArgs)
		},
	}

	initialize.Flags().StringVar(
		&cliArgs.init.deploymentKey,
		"api-key",
		os.Getenv("API_KEY"),
		"Set API key for Cumulus server.",
	)

	initialize.Flags().StringVar(
		&cliArgs.init.adminUserName,
		"admin-name",
		os.Getenv("ADMIN_USERNAME"),
		"Set admin username for Cumulus server.",
	)

	initialize.Flags().StringVar(
		&cliArgs.init.adminPassword,
		"admin-password",
		os.Getenv("ADMIN_PASSWORD"),
		"Set admin password for Cumulus server.",
	)

	initialize.MarkFlagRequired("api-key")
	initialize.MarkFlagRequired("admin-name")
	initialize.MarkFlagRequired("admin-password")

	var serve = &cobra.Command{
		Use:   "serve",
		Short: "Run Cumulus server.",
		Long:  "Run Cumulus server.",
		Run: func(cmd *cobra.Command, args []string) {
			Serve(cliArgs)
		},
	}

	port_default := os.Getenv("SERVER_PORT")
	if port_default == "" {
		port_default = "9100"
	}

	port_default_as_int, err := strconv.Atoi(port_default)
	if err != nil {
		log.Fatalf("err. - invalid SERVER_PORT envar")
		os.Exit(1)
	}

	serve.Flags().IntVar(
		&cliArgs.server.port,
		"port",
		port_default_as_int,
		"Set port for server.",
	)

	var root = &cobra.Command{
		Use:   "cumulus",
		Short: "Cumulus is an API for deploying Unreal Engine 5 in the Azure cloud.",
		Long:  `Cumulus is an API for deploying Unreal Engine 5 in the Azure cloud.`,
	}

	root.AddCommand(serve, initialize)

	return root

}
