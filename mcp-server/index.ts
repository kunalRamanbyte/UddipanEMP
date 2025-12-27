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

// Determine root directory robustly
// If running from dist/index.js, root is ../../
// If running from index.ts (ts-node), root is ../
const isDist = __dirname.endsWith('dist');
const rootDir = path.resolve(__dirname, isDist ? "../../" : "../");

console.error(`[MCP] Server initializing. Root directory: ${rootDir}`);
console.error(`[MCP] Mode: ${isDist ? 'Distribution' : 'Source (ts-node)'}`);

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
                description: "Execute the automation test suite. For full suite, it runs in background to prevent timeouts.",
                inputSchema: {
                    type: "object",
                    properties: {
                        testCaseId: {
                            type: "string",
                            description: "Specific test case ID (e.g., TC001). If omitted, runs full suite in background.",
                        },
                    },
                },
            },
            {
                name: "get_test_report",
                description: "Retrieve the latest test execution report summary.",
                inputSchema: {
                    type: "object",
                    properties: {},
                },
            },
            {
                name: "check_test_status",
                description: "Check if a background test suite is still running and see the last few log lines.",
                inputSchema: {
                    type: "object",
                    properties: {},
                },
            },
            {
                name: "check_framework_connection",
                description: "Check if the connection to the framework is healthy.",
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

    if (name === "check_framework_connection") {
        const webEngineExists = fs.existsSync(path.join(rootDir, "web-engine"));
        const sharedLibExists = fs.existsSync(path.join(rootDir, "shared-lib"));
        const reportExists = fs.existsSync(path.join(rootDir, "report.html"));

        return {
            content: [
                {
                    type: "text",
                    text: `Connection Check:\n- Root: ${rootDir}\n- Web Engine: ${webEngineExists ? "OK" : "MISSING"}\n- Shared Lib: ${sharedLibExists ? "OK" : "MISSING"}\n- Last Report: ${reportExists ? "FOUND" : "NOT FOUND"}`
                }
            ]
        };
    }

    if (name === "check_test_status") {
        const logFile = path.join(rootDir, "test_execution.log");
        const logs = fs.existsSync(logFile) ? fs.readFileSync(logFile, "utf8") : "No log file found.";
        const isRunning = logs.includes("Executing") && !logs.includes("Quality Gate");

        return {
            content: [
                {
                    type: "text",
                    text: `Current Status: ${isRunning ? "RUNNING 🏃‍♂️" : "IDLE/COMPLETED ✅"}\n\nRecent Logs:\n${logs.slice(-2000)}`
                }
            ]
        };
    }

    if (name === "run_test_suite") {
        const { testCaseId } = RunTestSuiteSchema.parse(args);

        const logFile = path.join(rootDir, "test_execution.log");
        // Use the project's local npx to ensure it's found
        const npxPath = process.platform === 'win32' ? 'npx.cmd' : 'npx';
        const testCommand = `${npxPath} ts-node web-engine/run-test.ts ${testCaseId ? "--test " + testCaseId : ""}`;

        const command = process.platform === 'win32'
            ? `${testCommand} > "${logFile}" 2>&1`
            : `${testCommand} 2>&1 | tee "${logFile}"`;

        console.error(`[MCP] Executing: ${command}`);

        // If it's the FULL SUITE, run in background and return immediately to avoid Claude timeout
        if (!testCaseId) {
            exec(command, { cwd: rootDir, maxBuffer: 100 * 1024 * 1024 });
            return {
                content: [
                    {
                        type: "text",
                        text: "🚀 Full test suite started in the background. It will take ~7 minutes.\n\nI will continue to run in the background. You can check progress using the 'check_test_status' tool or by checking the 'report.html' file later."
                    }
                ]
            };
        }

        // If it's a SINGLE TEST, try to wait for it (but Claude might still timeout if it's slow)
        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                resolve({
                    content: [{ type: "text", text: "⏳ Test is taking longer than 60s. It is still running in the background. Check 'check_test_status' for updates." }]
                });
            }, 55000); // Resolve just before Claude's timeout

            exec(command, {
                cwd: rootDir,
                maxBuffer: 100 * 1024 * 1024,
                env: { ...process.env, NO_UPDATE_NOTIFIER: 'true' } // Reduce noise
            }, (error, stdout, stderr) => {
                clearTimeout(timeout);
                const fullOutput = fs.existsSync(logFile) ? fs.readFileSync(logFile, 'utf8') : (stdout + "\n" + stderr);

                if (error) {
                    resolve({
                        content: [{ type: "text", text: `Failure: ${error.message}\n\nLogs:\n${fullOutput.slice(-2000)}` }],
                        isError: true,
                    });
                } else {
                    resolve({
                        content: [{ type: "text", text: `Success! Test completed.\n\nSummary:\n${fullOutput.slice(-2000)}` }],
                    });
                }
            });
        });
    }

    if (name === "get_test_report") {
        const reportPath = path.join(rootDir, "report.html");
        if (fs.existsSync(reportPath)) {
            const html = fs.readFileSync(reportPath, "utf8");

            // Extract summary stats using regex
            const platformHealthMatch = html.match(/<span class="label">Platform Health<\/span>\s*<span class="value">(\d+%)<\/span>/);
            const totalDurationMatch = html.match(/<span class="label">Total Execution<\/span>\s*<span class="value">([\d.]+(?:s|ms))<\/span>/);
            const chartDataMatch = html.match(/data: \[(\d+),\s*(\d+),\s*(\d+)\]/); // [Passed, Failed, Healed]

            let summary = `📊 Latest Test Execution Summary:\n`;
            summary += `-----------------------------------\n`;

            if (platformHealthMatch) summary += `✅ Platform Health: ${platformHealthMatch[1]}\n`;
            if (totalDurationMatch) summary += `⏱️ Total Duration: ${totalDurationMatch[1]}\n`;

            if (chartDataMatch) {
                const passed = parseInt(chartDataMatch[1]);
                const failed = parseInt(chartDataMatch[2]);
                const healed = parseInt(chartDataMatch[3]);
                const total = passed + failed + healed;

                summary += `🧪 Total Test Cases: ${total}\n`;
                summary += `   - Passed: ${passed}\n`;
                summary += `   - Failed: ${failed}\n`;
                summary += `   - AI-Healed: ${healed}\n`;
            }

            // Look for failed test cases
            const failedCaseRegex = /<span class="test-case-title">([^<]+)<\/span>\s*<span class="status-pill fail-pill[^>]*>FAIL<\/span>/g;
            let failureLines = [];
            let match;
            while ((match = failedCaseRegex.exec(html)) !== null) {
                failureLines.push(match[1]);
            }

            if (failureLines.length > 0) {
                summary += `\n❌ Failed Test Cases:\n`;
                failureLines.forEach(tc => summary += `   - ${tc}\n`);
            } else if (chartDataMatch && parseInt(chartDataMatch[2]) === 0) {
                summary += `\n✨ All tests passed! ✨\n`;
            }

            summary += `\nFull report available at: ${reportPath}`;

            return {
                content: [
                    {
                        type: "text",
                        text: summary,
                    }
                ]
            };
        } else {
            return {
                content: [{ type: "text", text: "No report found at the root. Run the test suite first." }],
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
