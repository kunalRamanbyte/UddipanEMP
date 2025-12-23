import * as fs from 'fs';
import * as path from 'path';

export interface TestResult {
    testCaseId: string;
    stepId: string;
    action: string;
    selector: string;
    status: 'PASS' | 'FAIL' | 'HEALED';
    errorMessage?: string;
    duration?: number;
    timestamp: Date;
    logs: string[];
    screenshot?: string;
    confidence?: number;
    healingReason?: string;
}

export class HtmlReporter {
    private results: TestResult[] = [];

    logResult(result: TestResult) {
        this.results.push(result);
    }

    generateReport(outputPath: string) {
        const passCount = this.results.filter(r => r.status === 'PASS').length;
        const failCount = this.results.filter(r => r.status === 'FAIL').length;
        const healedCount = this.results.filter(r => r.status === 'HEALED').length;

        // Group results by testCaseId
        const groupedResults: Record<string, TestResult[]> = {};
        this.results.forEach(r => {
            if (!groupedResults[r.testCaseId]) groupedResults[r.testCaseId] = [];
            groupedResults[r.testCaseId].push(r);
        });

        const totalCases = Object.keys(groupedResults).length;
        const failedCases = Object.values(groupedResults).filter(steps => steps.some(s => s.status === 'FAIL')).length;
        const healedCases = Object.values(groupedResults).filter(steps => !steps.some(s => s.status === 'FAIL') && steps.some(s => s.status === 'HEALED')).length;
        const passedCases = totalCases - failedCases - healedCases;

        const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Automation Test Report</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 40px; background-color: #f8f9fa; color: #333; }
        h1 { color: #2c3e50; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
        
        .dashboard-row { display: flex; gap: 30px; margin-bottom: 30px; align-items: flex-start; }
        .summary-container { flex: 1; display: flex; flex-direction: column; gap: 20px; }
        .summary { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); display: flex; gap: 40px; }
        .summary-item { text-align: center; }
        .summary-item .value { font-size: 24px; font-weight: bold; display: block; color: #007bff; }
        .summary-item .label { color: #666; font-size: 14px; text-transform: uppercase; }
        .chart-container { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); width: 300px; height: 350px; }
        
        .test-case-card { background: white; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); margin-bottom: 15px; overflow: hidden; border-left: 5px solid #ddd; }
        .test-case-card.pass { border-left-color: #28a745; }
        .test-case-card.fail { border-left-color: #dc3545; }
        .test-case-card.healed { border-left-color: #ffc107; }

        .test-case-header { padding: 15px 20px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; background: #fff; transition: background 0.2s; }
        .test-case-header:hover { background: #f1f3f5; }
        .test-case-title { font-weight: bold; font-size: 18px; color: #2c3e50; }
        .test-case-meta { font-size: 13px; color: #666; }

        .steps-table-container { display: none; padding: 0 20px 20px 20px; background: #fafafa; border-top: 1px solid #eee; }
        
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { padding: 12px; border-bottom: 1px solid #eee; text-align: left; font-size: 14px; }
        th { background-color: #f1f3f5; color: #495057; font-weight: 600; }
        
        .status-pill { padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: bold; }
        .pass-pill { background-color: #d4edda; color: #155724; }
        .fail-pill { background-color: #f8d7da; color: #721c24; }
        .healed-pill { background-color: #fff3cd; color: #856404; }
        
        .confidence-badge { font-size: 10px; padding: 2px 6px; border-radius: 4px; background: #e0f2f1; color: #00897b; border: 1px solid #b2dfdb; margin-left: 10px; }
        .healing-reason { font-size: 12px; font-style: italic; color: #666; margin-top: 5px; background: #fffbe6; padding: 5px; border-radius: 4px; border-left: 3px solid #ffe58f; }

        .log-container { font-family: 'Consolas', monospace; font-size: 12px; background: #2d3436; color: #dfe6e9; padding: 10px; border-radius: 4px; margin-top: 8px; display: none; }
        .toggle-logs { color: #007bff; cursor: pointer; text-decoration: underline; font-size: 12px; }
        .screenshot-img { max-width: 100%; border: 2px solid #ddd; border-radius: 4px; margin-top: 10px; cursor: zoom-in; }
        
        .badge { display: inline-block; padding: 3px 8px; border-radius: 12px; font-size: 11px; margin-left: 10px; font-weight: normal; }
        .badge-fail { background: #fee2e2; color: #991b1b; }
    </style>
    <script>
        function toggleSteps(id) {
            const el = document.getElementById(id);
            el.style.display = el.style.display === 'block' ? 'none' : 'block';
        }
        function toggleLogs(id) {
            const el = document.getElementById(id);
            el.style.display = el.style.display === 'block' ? 'none' : 'block';
        }
        window.onload = function() {
            const ctx = document.getElementById('resultsChart').getContext('2d');
            new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: ['Passed', 'Failed', 'Healed'],
                    datasets: [{
                        data: [${passedCases}, ${failedCases}, ${healedCases}],
                        backgroundColor: ['#28a745', '#dc3545', '#ffc107']
                    }]
                },
                options: { maintainAspectRatio: false }
            });
        };
    </script>
</head>
<body>
    <h1>Automation Execution Report</h1>
    
    <div class="dashboard-row">
        <div class="summary-container">
            <div class="summary">
                <div class="summary-item"><span class="value">${totalCases}</span><span class="label">Total Cases</span></div>
                <div class="summary-item"><span class="value">${passedCases}</span><span class="label">Passed</span></div>
                <div class="summary-item"><span class="value">${failedCases}</span><span class="label">Failed</span></div>
                <div class="summary-item"><span class="value">${healedCases}</span><span class="label">Healed</span></div>
            </div>
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <div class="chart-container">
            <canvas id="resultsChart"></canvas>
        </div>
    </div>

    <h2>Test Cases</h2>
    ${Object.entries(groupedResults).map(([caseId, steps], index) => {
            const caseStatus = steps.some(s => s.status === 'FAIL') ? 'fail' :
                steps.some(s => s.status === 'HEALED') ? 'healed' : 'pass';
            const totalDuration = steps.reduce((sum, s) => sum + (s.duration || 0), 0);

            return `
        <div class="test-case-card ${caseStatus}">
            <div class="test-case-header" onclick="toggleSteps('steps-${index}')">
                <div>
                    <span class="test-case-title">${caseId}</span>
                    <span class="status-pill ${caseStatus}-pill" style="margin-left: 15px;">${caseStatus.toUpperCase()}</span>
                </div>
                <div class="test-case-meta">
                    <span>${steps.length} Steps</span> | 
                    <span>${totalDuration}ms</span>
                </div>
            </div>
            <div id="steps-${index}" class="steps-table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Step ID</th>
                            <th>Action</th>
                            <th>Target</th>
                            <th>Status</th>
                            <th>Duration</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${steps.map((r, stepIndex) => `
                        <tr>
                            <td>${r.stepId}</td>
                            <td>${r.action}</td>
                            <td>
                                <code>${r.selector}</code>
                                ${r.confidence !== undefined ? `<span class="confidence-badge">AI Confidence: ${Math.round(r.confidence * 100)}%</span>` : ''}
                                ${r.healingReason ? `<div class="healing-reason">AI Logic: ${r.healingReason}</div>` : ''}
                            </td>
                            <td><span class="status-pill ${r.status.toLowerCase()}-pill">${r.status}</span></td>
                            <td>${r.duration}ms</td>
                        </tr>
                        <tr>
                            <td colspan="5" style="padding: 0 15px 10px 15px; border-top: none;">
                                <span class="toggle-logs" onclick="toggleLogs('logs-${index}-${stepIndex}')">Details & Evidence</span>
                                <div id="logs-${index}-${stepIndex}" class="log-container">
                                    ${(r.logs || []).join('<br>')}
                                    ${r.errorMessage ? `<br><span style="color: #ff7675;">Error: ${r.errorMessage}</span>` : ''}
                                    ${r.screenshot ? `<br><br><img class="screenshot-img" src="data:image/png;base64,${r.screenshot}">` : ''}
                                </div>
                            </td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        `;
        }).join('')}
</body>
</html>`;

        fs.writeFileSync(outputPath, html);
        console.log(`[Reporter] Report generated at: ${outputPath}`);
        return outputPath;
    }
}
