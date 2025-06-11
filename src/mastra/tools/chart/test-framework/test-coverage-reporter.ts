import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import { ChartTestFramework } from './chart-test-framework';
import { SampleJsonLoader } from '../utils/sample-json-loader';

/**
 * 测试覆盖率统计接口
 */
export interface CoverageStats {
  totalGenerators: number;
  testedGenerators: number;
  totalTestCases: number;
  passedTestCases: number;
  failedTestCases: number;
  coveragePercentage: number;
  testsByCategory: Map<string, number>;
  performance: {
    averageExecutionTime: number;
    maxExecutionTime: number;
    minExecutionTime: number;
  };
}

/**
 * 生成器覆盖率信息
 */
export interface GeneratorCoverage {
  generatorName: string;
  chartType: string;
  category: string;
  hasSampleFile: boolean;
  hasTestFile: boolean;
  testResults?: {
    passed: boolean;
    executionTime: number;
    error?: string;
  };
}

/**
 * 测试覆盖率报告生成器
 */
export class TestCoverageReporter {
  private testFramework: ChartTestFramework;
  private sampleLoader: SampleJsonLoader;
  private generatorsPath: string;
  private testsPath: string;

  constructor(
    configsPath: string = 'src/mastra/tools/chart/configs',
    generatorsPath: string = 'src/mastra/tools/chart/generators',
    testsPath: string = 'src/mastra/tools/chart/__tests__'
  ) {
    this.testFramework = new ChartTestFramework(configsPath);
    this.sampleLoader = new SampleJsonLoader(configsPath);
    this.generatorsPath = generatorsPath;
    this.testsPath = testsPath;
  }

  /**
   * 生成完整的测试覆盖率报告
   */
  public async generateCoverageReport(): Promise<{
    stats: CoverageStats;
    generatorCoverage: GeneratorCoverage[];
    recommendations: string[];
  }> {
    // 扫描所有生成器
    const generators = this.scanGenerators();
    
    // 扫描测试文件
    const testFiles = this.scanTestFiles();
    
    // 运行测试框架
    const testReport = await this.testFramework.runAllTests();
    
    // 分析覆盖率
    const generatorCoverage = this.analyzeGeneratorCoverage(generators, testFiles, testReport);
    
    // 计算统计信息
    const stats = this.calculateCoverageStats(generatorCoverage, testReport);
    
    // 生成建议
    const recommendations = this.generateRecommendations(generatorCoverage, stats);

    return {
      stats,
      generatorCoverage,
      recommendations
    };
  }

  /**
   * 扫描所有图表生成器
   */
  private scanGenerators(): Array<{ name: string; chartType: string; category: string }> {
    const generators: Array<{ name: string; chartType: string; category: string }> = [];
    
    try {
      const files = readdirSync(this.generatorsPath);
      
      for (const file of files) {
        if (file.endsWith('.generator.ts')) {
          const name = file.replace('.generator.ts', '');
          const chartType = name.replace(/-/g, '-');
          const category = this.categorizeGenerator(chartType);
          
          generators.push({ name, chartType, category });
        }
      }
    } catch (error) {
      console.warn(`扫描生成器时出错: ${error}`);
    }
    
    return generators;
  }

  /**
   * 扫描测试文件
   */
  private scanTestFiles(): string[] {
    const testFiles: string[] = [];
    
    try {
      const files = readdirSync(this.testsPath);
      
      for (const file of files) {
        if (file.endsWith('.test.ts')) {
          testFiles.push(file);
        }
      }
    } catch (error) {
      console.warn(`扫描测试文件时出错: ${error}`);
    }
    
    return testFiles;
  }

  /**
   * 分析生成器覆盖率
   */
  private analyzeGeneratorCoverage(
    generators: Array<{ name: string; chartType: string; category: string }>,
    testFiles: string[],
    testReport: any
  ): GeneratorCoverage[] {
    const coverage: GeneratorCoverage[] = [];
    
    for (const generator of generators) {
      const hasSampleFile = this.checkSampleFileExists(generator.chartType);
      const hasTestFile = this.checkTestFileExists(generator.name, testFiles);
      
      // 查找对应的测试结果
      const testResult = testReport.results?.find((r: any) => 
        r.generatorType === generator.chartType
      );

      const generatorCoverage: GeneratorCoverage = {
        generatorName: generator.name,
        chartType: generator.chartType,
        category: generator.category,
        hasSampleFile,
        hasTestFile,
      };

      if (testResult) {
        generatorCoverage.testResults = {
          passed: testResult.passed,
          executionTime: testResult.executionTime,
          error: testResult.error
        };
      }

      coverage.push(generatorCoverage);
    }
    
    return coverage;
  }

  /**
   * 检查示例文件是否存在
   */
  private checkSampleFileExists(chartType: string): boolean {
    try {
      const result = this.sampleLoader.loadByChartType(chartType);
      return result.success;
    } catch {
      return false;
    }
  }

  /**
   * 检查测试文件是否存在
   */
  private checkTestFileExists(generatorName: string, testFiles: string[]): boolean {
    const possibleNames = [
      `${generatorName}.test.ts`,
      `${generatorName}.generator.test.ts`,
      `${generatorName.replace(/-/g, '-')}.test.ts`
    ];
    
    return testFiles.some(file => possibleNames.includes(file));
  }

  /**
   * 分类生成器
   */
  private categorizeGenerator(chartType: string): string {
    if (chartType.includes('basic-')) return 'basic';
    if (chartType.includes('progress')) return 'progress';
    if (chartType.includes('stacked-')) return 'stacked';
    if (chartType.includes('mixed-')) return 'mixed';
    if (chartType.includes('voronoi') || chartType.includes('sankey') || chartType.includes('treemap')) {
      return 'complex';
    }
    return 'other';
  }

  /**
   * 计算覆盖率统计信息
   */
  private calculateCoverageStats(
    generatorCoverage: GeneratorCoverage[],
    testReport: any
  ): CoverageStats {
    const totalGenerators = generatorCoverage.length;
    const testedGenerators = generatorCoverage.filter(g => g.testResults).length;
    const totalTestCases = testReport.totalTests || 0;
    const passedTestCases = testReport.passedTests || 0;
    const failedTestCases = testReport.failedTests || 0;
    
    const coveragePercentage = totalGenerators > 0 ? 
      (testedGenerators / totalGenerators) * 100 : 0;

    // 按分类统计测试数量
    const testsByCategory = new Map<string, number>();
    generatorCoverage.forEach(g => {
      const count = testsByCategory.get(g.category) || 0;
      testsByCategory.set(g.category, count + (g.testResults ? 1 : 0));
    });

    // 性能统计
    const executionTimes = testReport.results?.map((r: any) => r.executionTime) || [];
    const averageExecutionTime = executionTimes.length > 0 ? 
      executionTimes.reduce((sum: number, time: number) => sum + time, 0) / executionTimes.length : 0;
    const maxExecutionTime = executionTimes.length > 0 ? Math.max(...executionTimes) : 0;
    const minExecutionTime = executionTimes.length > 0 ? Math.min(...executionTimes) : 0;

    return {
      totalGenerators,
      testedGenerators,
      totalTestCases,
      passedTestCases,
      failedTestCases,
      coveragePercentage,
      testsByCategory,
      performance: {
        averageExecutionTime,
        maxExecutionTime,
        minExecutionTime
      }
    };
  }

  /**
   * 生成改进建议
   */
  private generateRecommendations(
    generatorCoverage: GeneratorCoverage[],
    stats: CoverageStats
  ): string[] {
    const recommendations: string[] = [];

    // 检查未测试的生成器
    const untestedGenerators = generatorCoverage.filter(g => !g.testResults);
    if (untestedGenerators.length > 0) {
      recommendations.push(
        `需要为以下 ${untestedGenerators.length} 个生成器添加测试: ${untestedGenerators.map(g => g.generatorName).join(', ')}`
      );
    }

    // 检查缺少示例文件的生成器
    const missingSampleFiles = generatorCoverage.filter(g => !g.hasSampleFile);
    if (missingSampleFiles.length > 0) {
      recommendations.push(
        `需要为以下生成器添加示例文件: ${missingSampleFiles.map(g => g.generatorName).join(', ')}`
      );
    }

    // 检查失败的测试
    const failedTests = generatorCoverage.filter(g => g.testResults && !g.testResults.passed);
    if (failedTests.length > 0) {
      recommendations.push(
        `需要修复以下失败的测试: ${failedTests.map(g => g.generatorName).join(', ')}`
      );
    }

    // 覆盖率建议
    if (stats.coveragePercentage < 80) {
      recommendations.push(
        `测试覆盖率 ${stats.coveragePercentage.toFixed(1)}% 低于建议的80%，需要增加更多测试`
      );
    }

    // 性能建议
    if (stats.performance.averageExecutionTime > 100) {
      recommendations.push(
        `平均执行时间 ${stats.performance.averageExecutionTime.toFixed(2)}ms 较长，考虑优化测试性能`
      );
    }

    // 分类覆盖建议
    const categories = ['basic', 'progress', 'stacked', 'mixed', 'complex'];
    categories.forEach(category => {
      const categoryGenerators = generatorCoverage.filter(g => g.category === category);
      const categoryTested = categoryGenerators.filter(g => g.testResults).length;
      if (categoryGenerators.length > 0 && categoryTested === 0) {
        recommendations.push(`${category} 分类的生成器还没有测试覆盖`);
      }
    });

    return recommendations;
  }

  /**
   * 生成HTML格式的报告
   */
  public generateHTMLReport(reportData: {
    stats: CoverageStats;
    generatorCoverage: GeneratorCoverage[];
    recommendations: string[];
  }): string {
    const { stats, generatorCoverage, recommendations } = reportData;
    
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>图表生成器测试覆盖率报告</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        h1, h2 { color: #333; margin-bottom: 20px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: #f8f9fa; padding: 20px; border-radius: 6px; text-align: center; border-left: 4px solid #007acc; }
        .stat-value { font-size: 2em; font-weight: bold; color: #007acc; }
        .stat-label { color: #666; margin-top: 5px; }
        .progress-bar { width: 100%; height: 8px; background: #e9ecef; border-radius: 4px; overflow: hidden; margin: 10px 0; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #28a745, #20c997); transition: width 0.3s ease; }
        .coverage-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .coverage-table th, .coverage-table td { padding: 12px; text-align: left; border-bottom: 1px solid #dee2e6; }
        .coverage-table th { background: #f8f9fa; font-weight: 600; }
        .status-pass { color: #28a745; font-weight: bold; }
        .status-fail { color: #dc3545; font-weight: bold; }
        .status-missing { color: #6c757d; }
        .recommendations { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 20px; }
        .recommendations h3 { color: #856404; margin-top: 0; }
        .recommendations ul { margin: 0; padding-left: 20px; }
        .recommendations li { margin: 8px 0; color: #856404; }
        .category-${stats.coveragePercentage >= 80 ? 'good' : stats.coveragePercentage >= 60 ? 'warning' : 'danger'} {
            border-left-color: ${stats.coveragePercentage >= 80 ? '#28a745' : stats.coveragePercentage >= 60 ? '#ffc107' : '#dc3545'};
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 图表生成器测试覆盖率报告</h1>
        <p>生成时间: ${new Date().toLocaleString('zh-CN')}</p>
        
        <div class="stats-grid">
            <div class="stat-card category-${stats.coveragePercentage >= 80 ? 'good' : stats.coveragePercentage >= 60 ? 'warning' : 'danger'}">
                <div class="stat-value">${stats.coveragePercentage.toFixed(1)}%</div>
                <div class="stat-label">测试覆盖率</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${stats.coveragePercentage}%"></div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.testedGenerators}/${stats.totalGenerators}</div>
                <div class="stat-label">已测试生成器</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.passedTestCases}</div>
                <div class="stat-label">通过测试</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.failedTestCases}</div>
                <div class="stat-label">失败测试</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.performance.averageExecutionTime.toFixed(1)}ms</div>
                <div class="stat-label">平均执行时间</div>
            </div>
        </div>

        <h2>📋 生成器覆盖详情</h2>
        <table class="coverage-table">
            <thead>
                <tr>
                    <th>生成器名称</th>
                    <th>图表类型</th>
                    <th>分类</th>
                    <th>示例文件</th>
                    <th>测试状态</th>
                    <th>执行时间</th>
                </tr>
            </thead>
            <tbody>
                ${generatorCoverage.map(g => `
                    <tr>
                        <td>${g.generatorName}</td>
                        <td>${g.chartType}</td>
                        <td>${g.category}</td>
                        <td>${g.hasSampleFile ? '<span class="status-pass">✓ 存在</span>' : '<span class="status-missing">✗ 缺失</span>'}</td>
                        <td>${g.testResults ? 
                            (g.testResults.passed ? '<span class="status-pass">✓ 通过</span>' : '<span class="status-fail">✗ 失败</span>') 
                            : '<span class="status-missing">未测试</span>'}</td>
                        <td>${g.testResults ? `${g.testResults.executionTime.toFixed(1)}ms` : '-'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        ${recommendations.length > 0 ? `
        <div class="recommendations">
            <h3>🔧 改进建议</h3>
            <ul>
                ${recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        </div>
        ` : ''}
    </div>
</body>
</html>
    `;
  }

  /**
   * 打印控制台报告
   */
  public printConsoleReport(reportData: {
    stats: CoverageStats;
    generatorCoverage: GeneratorCoverage[];
    recommendations: string[];
  }): void {
    const { stats, generatorCoverage, recommendations } = reportData;

    console.log('\n🎯 ═══════════════════════════════════════════════════════════════');
    console.log('📊 图表生成器测试覆盖率报告');
    console.log('═══════════════════════════════════════════════════════════════\n');

    console.log('📈 总体统计:');
    console.log(`   测试覆盖率: ${stats.coveragePercentage.toFixed(1)}%`);
    console.log(`   已测试生成器: ${stats.testedGenerators}/${stats.totalGenerators}`);
    console.log(`   通过测试: ${stats.passedTestCases}`);
    console.log(`   失败测试: ${stats.failedTestCases}`);
    console.log(`   平均执行时间: ${stats.performance.averageExecutionTime.toFixed(2)}ms`);

    console.log('\n📋 分类覆盖:');
    stats.testsByCategory.forEach((count, category) => {
      const totalInCategory = generatorCoverage.filter(g => g.category === category).length;
      const percentage = totalInCategory > 0 ? (count / totalInCategory) * 100 : 0;
      console.log(`   ${category}: ${count}/${totalInCategory} (${percentage.toFixed(1)}%)`);
    });

    if (recommendations.length > 0) {
      console.log('\n🔧 改进建议:');
      recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
    }

    console.log('\n═══════════════════════════════════════════════════════════════\n');
  }
} 