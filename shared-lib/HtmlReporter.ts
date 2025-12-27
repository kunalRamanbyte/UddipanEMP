import * as fs from 'fs';
import * as path from 'path';

export interface TestResult {
    testCaseId: string;
    testCaseName?: string;
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
    retryCount?: number;
    isHealed?: boolean;
}

export class HtmlReporter {
    private results: TestResult[] = [];

    logResult(result: TestResult) {
        // Automatically set isHealed if status is HEALED
        if (result.status === 'HEALED') result.isHealed = true;
        this.results.push(result);
    }

    generateReport(outputPath: string, startTime: Date, endTime: Date) {
        const totalDuration = this.results.reduce((sum, r) => sum + (r.duration || 0), 0);
        const totalRetries = this.results.reduce((sum, r) => sum + (r.retryCount || 0), 0);
        const healedCount = this.results.filter(r => r.status === 'HEALED').length;
        const totalSteps = this.results.length;

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

        // Manager Insights
        const flakiestTests = Object.entries(groupedResults)
            .map(([id, steps]) => ({ id, retries: steps.reduce((s, st) => s + (st.retryCount || 0), 0) }))
            .filter(t => t.retries > 0)
            .sort((a, b) => b.retries - a.retries)
            .slice(0, 3);

        const mostHealed = Object.entries(
            this.results.filter(r => r.status === 'HEALED').reduce((acc, r) => {
                acc[r.selector] = (acc[r.selector] || 0) + 1;
                return acc;
            }, {} as Record<string, number>)
        ).sort((a, b) => b[1] - a[1]).slice(0, 3);

        const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Automation Test Report</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 40px; background-color: #f8f9fa; color: #333; }
        h1 { color: #2c3e50; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
        
        .dashboard-row { display: flex; gap: 20px; margin-bottom: 30px; flex-wrap: wrap; }
        .summary-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); flex: 1; min-width: 200px; border-top: 4px solid #007bff; }
        .summary-card.success { border-top-color: #28a745; }
        .summary-card.warning { border-top-color: #ffc107; }
        .summary-card.danger { border-top-color: #dc3545; }
        
        .summary-card .value { font-size: 28px; font-weight: bold; display: block; color: #333; }
        .summary-card .label { color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
        .summary-card .sub-value { font-size: 11px; color: #888; margin-top: 5px; }
        
        .insight-section { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .insight-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .insight-card h3 { margin-top: 0; color: #2c3e50; font-size: 16px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
        
        .metric-list { list-style: none; padding: 0; margin: 0; }
        .metric-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #fafafa; font-size: 14px; }
        .metric-item:last-child { border-bottom: none; }
        .metric-item .tag { background: #f1f3f5; padding: 2px 8px; border-radius: 4px; font-size: 12px; }

        .chart-container { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); width: 300px; }
        
        .test-case-card { background: white; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); margin-bottom: 15px; overflow: hidden; border-left: 5px solid #ddd; }
        .test-case-card.pass { border-left-color: #28a745; }
        .test-case-card.fail { border-left-color: #dc3545; }
        .test-case-card.healed { border-left-color: #ffc107; }

        .test-case-header { padding: 15px 20px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; background: #fff; transition: background 0.2s; }
        .test-case-header:hover { background: #f1f3f5; }
        .test-case-title { font-weight: bold; font-size: 18px; color: #2c3e50; }
        .test-case-meta { font-size: 13px; color: #666; }

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
            new Chart(document.getElementById('resultsChart'), {
                type: 'doughnut',
                data: {
                    labels: ['Passed', 'Failed', 'Healed'],
                    datasets: [{
                        data: [${passedCases}, ${failedCases}, ${healedCases}],
                        backgroundColor: ['#28a745', '#dc3545', '#ffc107']
                    }]
                },
                options: { maintainAspectRatio: false, cutout: '70%' }
            });
        };
    </script>
</head>
<body>
    <h1>Quality Observability Dashboard</h1>
    
    <div class="dashboard-row">
        <div class="summary-card success">
            <span class="label">Platform Health</span>
            <span class="value">${Math.round(((passedCases + healedCases) / totalCases) * 100)}%</span>
            <span class="sub-value">Start: ${startTime.toLocaleString()}</span>
        </div>
        <div class="summary-card">
            <span class="label">Total Execution</span>
            <span class="value">${(totalDuration / 1000).toFixed(1)}s</span>
            <span class="sub-value">End: ${endTime.toLocaleString()}</span>
        </div>
        <div class="summary-card warning">
            <span class="label">AI Healing ROI</span>
            <span class="value">${healedCount} Saves</span>
        </div>
        <div class="summary-card danger">
            <span class="label">Total Retries</span>
            <span class="value">${totalRetries}</span>
        </div>
    </div>

    <div class="insight-section">
        <div class="insight-card">
            <h3>🛡️ Resilience & Stability Insights</h3>
            <ul class="metric-list">
                <li class="metric-item">
                    <span>Healing Success Rate</span>
                    <span class="tag">${Math.round((healedCount / (healedCount + failedCases || 1)) * 100)}%</span>
                </li>
                <li class="metric-item">
                    <span>Avg. Step Duration</span>
                    <span class="tag">${Math.round(totalDuration / totalSteps)}ms</span>
                </li>
                <li class="metric-item">
                    <span>Automation Coverage</span>
                    <span class="tag">${totalCases} Cases</span>
                </li>
            </ul>
        </div>

        <div class="insight-card">
            <h3>⚠️ Technical Debt (Most Healed)</h3>
            <ul class="metric-list">
                ${mostHealed.length > 0 ? mostHealed.map(([sel, count]) => `
                    <li class="metric-item">
                        <code style="font-size: 11px;">${sel.substring(0, 30)}...</code>
                        <span class="tag" style="background:#fff3cd; color:#856404">${count} Fixes</span>
                    </li>
                `).join('') : '<li class="metric-item">No healing needed yet! ✅</li>'}
            </ul>
        </div>

        <div class="insight-card">
            <h3>🌊 Flaky Test Analysis (Top Retries)</h3>
            <ul class="metric-list">
                ${flakiestTests.length > 0 ? flakiestTests.map(t => `
                    <li class="metric-item">
                        <span>${t.id}</span>
                        <span class="tag" style="background:#fee2e2; color:#991b1b">${t.retries} Retries</span>
                    </li>
                `).join('') : '<li class="metric-item">Zero flakiness detected! 🚀</li>'}
            </ul>
        </div>
        
        <div class="chart-container">
            <canvas id="resultsChart"></canvas>
        </div>
    </div>

    <h2>Execution Details</h2>
    ${Object.entries(groupedResults).map(([caseId, steps], index) => {
            const caseStatus = steps.some(s => s.status === 'FAIL') ? 'fail' :
                steps.some(s => s.status === 'HEALED') ? 'healed' : 'pass';
            const totalDuration = steps.reduce((sum, s) => sum + (s.duration || 0), 0);

            return `
        <div class="test-case-card ${caseStatus}">
            <div class="test-case-header" onclick="toggleSteps('steps-${index}')">
                <div>
                    <span class="test-case-title">${steps[0].testCaseName || caseId}</span>
                    <span class="status-pill ${caseStatus}-pill" style="margin-left: 15px;">${caseStatus.toUpperCase()}</span>
                </div>
                <div class="test-case-meta">
                    <span>${steps.length} Steps</span> | 
                    <span>${totalDuration}ms</span>
                </div>
            </div>
            <div id="steps-${index}" class="steps-table-container " style="display:none">
                <table>
                    <thead>
                        <tr>
                            <th>Step ID</th>
                            <th>Action</th>
                            <th>Target</th>
                            <th>Status</th>
                            <th>Time</th>
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
                            <td>
                                <span class="status-pill ${r.status.toLowerCase()}-pill">${r.status}</span>
                                ${r.retryCount ? `<span class="badge badge-fail">Retries: ${r.retryCount}</span>` : ''}
                            </td>
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

        const fs = require('fs');
        const path = require('path');
        fs.writeFileSync(outputPath, html);
        console.log(`[Reporter] Observability Report generated at: ${outputPath}`);
        return outputPath;
    }
}
