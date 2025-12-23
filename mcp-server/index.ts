import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { exec } from "child_process";
import * as path from "path";
import * as fs from "fs";

// Initialize MCP Server
const server = new Server(
    {
        name: "automation-mcp-server",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

// Define tool schemas
const RunTestSuiteSchema = z.object({
    testCaseId: z.string().optional().describe("The ID of the test case to run (e.g., TC001). If omitted, runs all tests."),
});

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "run_test_suite",
                description: "Execute the automation test suite. Can optionally filter by TestCaseID.",
                inputSchema: {
                    type: "object",
                    properties: {
                        testCaseId: {
                            type: "string",
                            description: "The ID of the specific test case to run (e.g., TC001)",
                        },
                    },
                },
            },
            {
                name: "get_test_report",
                description: "Retrieve the latest test execution report.",
                inputSchema: {
                    type: "object",
                    properties: {},
                },
            },
        ],
    };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (name === "run_test_suite") {
        const { testCaseId } = RunTestSuiteSchema.parse(args);
        const rootDir = path.resolve(__dirname, "../../");

        // Command to run the test script
        // Note: To support filtering, we would need to update run-test.ts to accept args.
        // For now, we just run the whole suite or log a warning if filtering is requested but not supported yet.
        const command = `npx ts-node web-engine/run-test.ts ${testCaseId ? "--test " + testCaseId : ""}`;

        return new Promise((resolve) => {
            exec(command, { cwd: rootDir }, (error, stdout, stderr) => {
                if (error) {
                    resolve({
                        content: [
                            {
                                type: "text",
                                text: `Execution Failed:\n${stderr}\n${stdout}`,
                            },
                        ],
                        isError: true,
                    });
                } else {
                    resolve({
                        content: [
                            {
                                type: "text",
                                text: `Execution Success:\n${stdout}`,
                            },
                        ],
                    });
                }
            });
        });
    }

    if (name === "get_test_report") {
        const reportPath = path.resolve(__dirname, "../../report.html");
        if (fs.existsSync(reportPath)) {
            // Reading HTML might be too much text, just returning summary or path
            // Ideally we read a JSON report.
            return {
                content: [
                    {
                        type: "text",
                        text: `Report available at: ${reportPath}\n(Content reading not yet optimized for HTML)`,
                    }
                ]
            };
        } else {
            return {
                content: [{ type: "text", text: "No report found. Run the test suite first." }],
                isError: true
            };
        }
    }

    throw new Error(`Unknown tool: ${name}`);
});

// Start the server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
