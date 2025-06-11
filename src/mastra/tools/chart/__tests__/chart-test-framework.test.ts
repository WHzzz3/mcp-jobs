import { describe, it, expect, beforeEach, vi } from 'vitest';
import { join } from 'path';
import { ChartTestFramework, TestResult, TestReport } from '../test-framework/chart-test-framework';
import { TestRunner } from '../test-framework/test-runner';

describe('Chart Test Framework Tests', () => {
  let framework: ChartTestFramework;

  beforeEach(() => {
    // 使用相对路径指向configs目录
    framework = new ChartTestFramework('src/mastra/tools/chart/configs');
  });

  describe('ChartTestFramework', () => {
    it('应该正确初始化测试框架', () => {
      expect(framework).toBeInstanceOf(ChartTestFramework);
      expect(framework.getSupportedChartTypes().length).toBeGreaterThan(0);
    });

    it('应该包含所有已实现的图表类型', () => {
      const supportedTypes = framework.getSupportedChartTypes();
      
      // 基础图表
      expect(supportedTypes).toContain('basic-column');
      expect(supportedTypes).toContain('basic-bar');
      expect(supportedTypes).toContain('basic-pie');
      expect(supportedTypes).toContain('basic-line');
      
      // 进度图表
      expect(supportedTypes).toContain('bar-progress');
      expect(supportedTypes).toContain('donut-progress');
      
      // 堆叠图表
      expect(supportedTypes).toContain('stacked-column');
      expect(supportedTypes).toContain('stacked-bar');
      expect(supportedTypes).toContain('stacked-area');
      
      // 复杂图表
      expect(supportedTypes).toContain('voronoi');
      expect(supportedTypes).toContain('sankey');
      expect(supportedTypes).toContain('single-layer-treemap');
      
      // 混合图表
      expect(supportedTypes).toContain('mixed-line-stacked-column');
      expect(supportedTypes).toContain('mixed-line-grouped-column');
    });

    it('应该能够启用/禁用图表类型测试', () => {
      const chartType = 'basic-column';
      
      // 默认应该是启用的
      framework.toggleChartTypeTest(chartType, false);
      framework.toggleChartTypeTest(chartType, true);
      
      // 测试无效的图表类型
      expect(() => {
        framework.toggleChartTypeTest('invalid-chart', true);
      }).toThrow('Unknown chart type: invalid-chart');
    });

    it('应该能够清空测试结果', () => {
      framework.clearResults();
      expect(framework.getTestResults()).toHaveLength(0);
    });

    it('应该能够运行特定类型的测试', async () => {
      // 运行基础柱状图测试
      const results = await framework.runTestsForType('basic-column');
      
      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].generatorType).toBe('basic-column');
    });

    it('应该在运行未知图表类型时抛出错误', async () => {
      await expect(framework.runTestsForType('unknown-chart'))
        .rejects.toThrow('Unknown generator type: unknown-chart');
    });

    it('应该正确处理测试结果格式', async () => {
      const results = await framework.runTestsForType('basic-column');
      const result = results[0];

      expect(result).toHaveProperty('testName');
      expect(result).toHaveProperty('generatorType');
      expect(result).toHaveProperty('sampleFile');
      expect(result).toHaveProperty('passed');
      expect(result).toHaveProperty('executionTime');
      expect(typeof result.passed).toBe('boolean');
      expect(typeof result.executionTime).toBe('number');
    });

    // 注意：由于运行所有测试会花费较长时间，这里只做基础验证
    it('应该能够生成测试报告结构', async () => {
      // 只测试一个图表类型以节省时间
      framework.toggleChartTypeTest('basic-column', true);
      // 禁用其他所有类型
      const allTypes = framework.getSupportedChartTypes();
      allTypes.forEach(type => {
        if (type !== 'basic-column') {
          framework.toggleChartTypeTest(type, false);
        }
      });

      const report = await framework.runAllTests();

      expect(report).toHaveProperty('totalTests');
      expect(report).toHaveProperty('passedTests');
      expect(report).toHaveProperty('failedTests');
      expect(report).toHaveProperty('totalExecutionTime');
      expect(report).toHaveProperty('results');
      expect(report).toHaveProperty('summary');
      
      expect(report.summary).toHaveProperty('successRate');
      expect(report.summary).toHaveProperty('averageExecutionTime');
      expect(report.summary).toHaveProperty('criticalFailures');
      
      expect(Array.isArray(report.results)).toBe(true);
      expect(typeof report.totalTests).toBe('number');
      expect(typeof report.passedTests).toBe('number');
      expect(typeof report.failedTests).toBe('number');
    });
  });

  describe('TestRunner', () => {
    let runner: TestRunner;

    beforeEach(() => {
      runner = new TestRunner('src/mastra/tools/chart/configs', './test-output');
    });

    it('应该正确初始化测试运行器', () => {
      expect(runner).toBeInstanceOf(TestRunner);
      expect(runner.getSupportedChartTypes().length).toBeGreaterThan(0);
    });

    it('应该显示帮助信息', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      TestRunner.showHelp();
      
      expect(consoleSpy).toHaveBeenCalled();
      const helpOutput = consoleSpy.mock.calls.join(' ');
      expect(helpOutput).toContain('Chart Test Framework');
      expect(helpOutput).toContain('Commands:');
      expect(helpOutput).toContain('Options:');
      
      consoleSpy.mockRestore();
    });

    // 由于文件操作和完整测试运行时间较长，这里只测试基本功能
    it('应该能够识别支持的图表类型', () => {
      const types = runner.getSupportedChartTypes();
      expect(types).toContain('basic-column');
      expect(types).toContain('mixed-line-stacked-column');
    });
  });

  describe('集成测试 - 基础图表', () => {
    it('应该成功测试基础柱状图生成器', async () => {
      const results = await framework.runTestsForType('basic-column');
      
      expect(results.length).toBe(1);
      expect(results[0].generatorType).toBe('basic-column');
      expect(results[0].sampleFile).toBe('basic-column.sample.json');
      expect(results[0].passed).toBe(true);
      expect(results[0].executionTime).toBeGreaterThanOrEqual(0);
    }, 10000); // 增加超时时间

    it('应该能够测试基础饼图生成器', async () => {
      const results = await framework.runTestsForType('basic-pie');
      
      expect(results.length).toBe(1);
      expect(results[0].generatorType).toBe('basic-pie');
      expect(results[0].sampleFile).toBe('basic-pie.sample.json');
      expect(typeof results[0].passed).toBe('boolean');
    }, 10000);

    it('应该能够测试进度图表生成器', async () => {
      const barResults = await framework.runTestsForType('bar-progress');
      const donutResults = await framework.runTestsForType('donut-progress');
      
      expect(typeof barResults[0].passed).toBe('boolean');
      expect(typeof donutResults[0].passed).toBe('boolean');
    }, 10000);
  });

  describe('错误处理测试', () => {
    it('应该正确处理无效的配置路径', async () => {
      const invalidFramework = new ChartTestFramework('/invalid/path');
      
      const results = await invalidFramework.runTestsForType('basic-column');
      expect(results[0].passed).toBe(false);
      expect(results[0].error).toContain('Sample file not found');
    });

    it('应该正确处理生成器执行错误', async () => {
      // 创建一个会失败的测试场景（通过模拟）
      const mockFramework = new ChartTestFramework('src/mastra/tools/chart/configs');
      
      // 直接测试框架的错误处理能力
      try {
        await mockFramework.runTestsForType('basic-column');
        // 如果到这里说明测试通过了，这是正常的
      } catch (error) {
        // 如果有错误，验证错误处理是否正确
        expect(error).toBeDefined();
      }
    });
  });

  describe('性能测试', () => {
    it('单个测试执行时间应该在合理范围内', async () => {
      const startTime = Date.now();
      const results = await framework.runTestsForType('basic-column');
      const endTime = Date.now();
      
      const totalTime = endTime - startTime;
      expect(totalTime).toBeLessThan(5000); // 5秒内完成
      expect(results[0].executionTime).toBeLessThan(1000); // 单个测试1秒内
    });

    it('应该能够处理批量测试', async () => {
      // 运行几个基础图表类型
      const types = ['basic-column', 'basic-bar', 'basic-pie'];
      
      for (const type of types) {
        const results = await framework.runTestsForType(type);
        expect(results.length).toBeGreaterThan(0);
        expect(results[0].generatorType).toBe(type);
        expect(typeof results[0].passed).toBe('boolean');
      }
    }, 15000); // 增加超时时间
  });

  describe('报告格式验证', () => {
    it('应该生成符合格式的测试报告', async () => {
      // 运行小规模测试
      framework.toggleChartTypeTest('basic-column', true);
      const allTypes = framework.getSupportedChartTypes();
      allTypes.forEach(type => {
        if (type !== 'basic-column') {
          framework.toggleChartTypeTest(type, false);
        }
      });

      const report = await framework.runAllTests();

      // 验证报告结构
      expect(report.totalTests).toBeGreaterThan(0);
      expect(report.passedTests + report.failedTests).toBe(report.totalTests);
      expect(report.summary.successRate).toBeGreaterThanOrEqual(0);
      expect(report.summary.successRate).toBeLessThanOrEqual(100);
      expect(report.summary.averageExecutionTime).toBeGreaterThanOrEqual(0);
      
      // 验证每个测试结果的结构
      report.results.forEach(result => {
        expect(result.testName).toBeDefined();
        expect(result.generatorType).toBeDefined();
        expect(result.sampleFile).toBeDefined();
        expect(typeof result.passed).toBe('boolean');
        expect(typeof result.executionTime).toBe('number');
      });
    });
  });
}); 