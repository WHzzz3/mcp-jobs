#!/usr/bin/env ts-node

import { join, resolve } from 'path';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { ChartTestFramework, TestReport } from './chart-test-framework';

/**
 * 测试运行器类
 */
export class TestRunner {
  private framework: ChartTestFramework;
  private outputDir: string;

  constructor(configsPath?: string, outputDir?: string) {
    this.framework = new ChartTestFramework(configsPath);
    this.outputDir = outputDir || join(process.cwd(), 'test-reports');
    
    // 确保输出目录存在
    if (!existsSync(this.outputDir)) {
      mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * 运行所有测试并保存报告
   */
  public async runAllTestsWithReport(): Promise<TestReport> {
    console.log('🔥 Chart Test Framework - Full Test Suite\n');
    
    const report = await this.framework.runAllTests();
    
    // 保存JSON报告
    await this.saveJsonReport(report);
    
    // 保存HTML报告
    await this.saveHtmlReport(report);
    
    return report;
  }

  /**
   * 运行特定图表类型的测试
   */
  public async runSpecificTests(chartTypes: string[]): Promise<void> {
    console.log(`🎯 Running tests for specific chart types: ${chartTypes.join(', ')}\n`);
    
    // 禁用所有测试
    for (const type of this.framework.getSupportedChartTypes()) {
      this.framework.toggleChartTypeTest(type, false);
    }
    
    // 启用指定的测试
    for (const type of chartTypes) {
      this.framework.toggleChartTypeTest(type, true);
    }
    
    const report = await this.framework.runAllTests();
    await this.saveJsonReport(report, `specific-tests-${Date.now()}`);
  }

  /**
   * 保存JSON格式的报告
   */
  private async saveJsonReport(report: TestReport, filename?: string): Promise<void> {
    const fileName = filename || `chart-test-report-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`;
    const filePath = join(this.outputDir, `${fileName}.json`);
    
    try {
      writeFileSync(filePath, JSON.stringify(report, null, 2), 'utf-8');
      console.log(`📄 JSON报告已保存: ${filePath}`);
    } catch (error) {
      console.error(`❌ 保存JSON报告失败: ${error}`);
    }
  }

  /**
   * 保存HTML格式的报告
   */
  private async saveHtmlReport(report: TestReport, filename?: string): Promise<void> {
    const fileName = filename || `chart-test-report-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`;
    const filePath = join(this.outputDir, `${fileName}.html`);
    
    const htmlContent = this.generateHtmlReport(report);
    
    try {
      writeFileSync(filePath, htmlContent, 'utf-8');
      console.log(`🌐 HTML报告已保存: ${filePath}`);
    } catch (error) {
      console.error(`❌ 保存HTML报告失败: ${error}`);
    }
  }

  /**
   * 生成HTML报告内容
   */
  private generateHtmlReport(report: TestReport): string {
    const passedTests = report.results.filter(r => r.passed);
    const failedTests = report.results.filter(r => !r.passed);
    
    return `
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chart Test Framework Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .summary-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
        }
        
        .summary-card h3 {
            margin: 0 0 10px 0;
            color: #555;
        }
        
        .summary-card .value {
            font-size: 2em;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .success { color: #28a745; }
        .warning { color: #ffc107; }
        .danger { color: #dc3545; }
        .info { color: #17a2b8; }
        
        .test-results {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .test-results h2 {
            background: #f8f9fa;
            margin: 0;
            padding: 20px;
            border-bottom: 1px solid #dee2e6;
        }
        
        .test-item {
            padding: 15px 20px;
            border-bottom: 1px solid #dee2e6;
        }
        
        .test-item:last-child {
            border-bottom: none;
        }
        
        .test-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .test-name {
            font-weight: bold;
            font-size: 1.1em;
        }
        
        .test-status {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            font-weight: bold;
        }
        
        .status-passed {
            background: #d4edda;
            color: #155724;
        }
        
        .status-failed {
            background: #f8d7da;
            color: #721c24;
        }
        
        .test-details {
            color: #666;
            font-size: 0.9em;
        }
        
        .error-details {
            background: #fff5f5;
            border: 1px solid #fed7d7;
            border-radius: 4px;
            padding: 10px;
            margin-top: 10px;
            font-family: monospace;
            font-size: 0.8em;
            color: #c53030;
        }
        
        .collapsible {
            cursor: pointer;
            user-select: none;
        }
        
        .collapsible:hover {
            background-color: #f8f9fa;
        }
        
        .content {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease-out;
        }
        
        .content.active {
            max-height: 500px;
        }
        
        .timestamp {
            text-align: center;
            color: #666;
            font-size: 0.9em;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 Chart Test Framework Report</h1>
        <p>自动化图表生成器测试报告</p>
    </div>
    
    <div class="summary">
        <div class="summary-card">
            <h3>总测试数</h3>
            <div class="value info">${report.totalTests}</div>
        </div>
        <div class="summary-card">
            <h3>通过测试</h3>
            <div class="value success">${report.passedTests}</div>
        </div>
        <div class="summary-card">
            <h3>失败测试</h3>
            <div class="value danger">${report.failedTests}</div>
        </div>
        <div class="summary-card">
            <h3>成功率</h3>
            <div class="value ${report.summary.successRate >= 90 ? 'success' : report.summary.successRate >= 70 ? 'warning' : 'danger'}">${report.summary.successRate.toFixed(1)}%</div>
        </div>
        <div class="summary-card">
            <h3>总执行时间</h3>
            <div class="value info">${report.totalExecutionTime}ms</div>
        </div>
        <div class="summary-card">
            <h3>平均执行时间</h3>
            <div class="value info">${report.summary.averageExecutionTime.toFixed(1)}ms</div>
        </div>
    </div>
    
    <div class="test-results">
        <h2>📋 详细测试结果</h2>
        ${report.results.map((result, index) => `
            <div class="test-item ${result.passed ? '' : 'collapsible'}" ${result.passed ? '' : `onclick="toggleContent('content-${index}')"`}>
                <div class="test-header">
                    <span class="test-name">${result.testName}</span>
                    <span class="test-status ${result.passed ? 'status-passed' : 'status-failed'}">
                        ${result.passed ? '✅ PASSED' : '❌ FAILED'}
                    </span>
                </div>
                <div class="test-details">
                    Generator: ${result.generatorType} | Sample: ${result.sampleFile} | Time: ${result.executionTime}ms
                </div>
                ${!result.passed ? `
                    <div class="content" id="content-${index}">
                        <div class="error-details">
                            ${result.error ? `<strong>Error:</strong> ${result.error}` : ''}
                            ${result.differences ? `
                                <strong>Differences:</strong><br>
                                ${result.differences.map(diff => `• ${diff}`).join('<br>')}
                            ` : ''}
                        </div>
                    </div>
                ` : ''}
            </div>
        `).join('')}
    </div>
    
    <div class="timestamp">
        报告生成时间: ${new Date().toLocaleString('zh-CN')}
    </div>
    
    <script>
        function toggleContent(id) {
            const content = document.getElementById(id);
            content.classList.toggle('active');
        }
    </script>
</body>
</html>`;
  }

  /**
   * 获取支持的图表类型
   */
  public getSupportedChartTypes(): string[] {
    return this.framework.getSupportedChartTypes();
  }

  /**
   * 显示帮助信息
   */
  public static showHelp(): void {
    console.log(`
📊 Chart Test Framework - Usage

Commands:
  npm run test:charts               - 运行所有图表测试
  npm run test:charts:basic         - 运行基础图表测试
  npm run test:charts:progress      - 运行进度图表测试
  npm run test:charts:stacked       - 运行堆叠图表测试
  npm run test:charts:complex       - 运行复杂图表测试
  npm run test:charts:mixed         - 运行混合图表测试

Options:
  --type <type>                     - 运行特定类型的测试
  --output <dir>                    - 指定输出目录
  --help                           - 显示帮助信息

Examples:
  ts-node test-runner.ts --type basic-column,basic-bar
  ts-node test-runner.ts --output ./my-reports
    `);
  }
}

// CLI执行
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help')) {
    TestRunner.showHelp();
    process.exit(0);
  }

  const typeIndex = args.indexOf('--type');
  const outputIndex = args.indexOf('--output');
  
  const specificTypes = typeIndex !== -1 && args[typeIndex + 1] 
    ? args[typeIndex + 1].split(',') 
    : null;
  
  const outputDir = outputIndex !== -1 && args[outputIndex + 1] 
    ? args[outputIndex + 1] 
    : undefined;

  const runner = new TestRunner(undefined, outputDir);

  async function runTests() {
    try {
      if (specificTypes) {
        await runner.runSpecificTests(specificTypes);
      } else {
        const report = await runner.runAllTestsWithReport();
        
        // 设置退出码
        if (report.failedTests > 0) {
          console.log('\n🚨 Some tests failed. Exiting with code 1.');
          process.exit(1);
        } else {
          console.log('\n🎉 All tests passed! Exiting with code 0.');
          process.exit(0);
        }
      }
    } catch (error) {
      console.error('❌ Test execution failed:', error);
      process.exit(1);
    }
  }

  runTests();
} 