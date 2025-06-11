#!/usr/bin/env ts-node

import { ChartTestFramework } from './chart-test-framework';
import { TestRunner } from './test-runner';

/**
 * 测试框架演示脚本
 */
async function runDemo() {
  console.log('🎯 Chart Test Framework Demo\n');
  
  try {
    // 创建测试框架实例
    const framework = new ChartTestFramework('src/mastra/tools/chart/configs');
    
    // 1. 显示支持的图表类型
    console.log('📊 支持的图表类型:');
    const supportedTypes = framework.getSupportedChartTypes();
    supportedTypes.forEach((type, index) => {
      console.log(`  ${index + 1}. ${type}`);
    });
    console.log('');
    
    // 2. 运行单个图表类型测试
    console.log('🔧 运行基础柱状图测试...');
    const basicColumnResults = await framework.runTestsForType('basic-column');
    const result = basicColumnResults[0];
    console.log(`测试结果: ${result.passed ? '✅ 通过' : '❌ 失败'}`);
    console.log(`执行时间: ${result.executionTime}ms`);
    if (!result.passed && result.error) {
      console.log(`错误信息: ${result.error}`);
    }
    console.log('');
    
    // 3. 运行批量测试（只测试几个基础类型以节省时间）
    console.log('🚀 运行批量基础图表测试...');
    
    // 禁用所有类型
    supportedTypes.forEach(type => {
      framework.toggleChartTypeTest(type, false);
    });
    
    // 只启用基础图表类型
    const basicTypes = ['basic-column', 'basic-bar', 'basic-pie', 'basic-line'];
    basicTypes.forEach(type => {
      framework.toggleChartTypeTest(type, true);
    });
    
    const report = await framework.runAllTests();
    
    console.log('\n📈 测试总结:');
    console.log(`总测试数: ${report.totalTests}`);
    console.log(`通过测试: ${report.passedTests} ✅`);
    console.log(`失败测试: ${report.failedTests} ❌`);
    console.log(`成功率: ${report.summary.successRate.toFixed(1)}%`);
    console.log(`平均执行时间: ${report.summary.averageExecutionTime.toFixed(1)}ms`);
    
    if (report.failedTests > 0) {
      console.log('\n❌ 失败的测试:');
      report.results
        .filter(r => !r.passed)
        .forEach(r => {
          console.log(`  • ${r.testName}: ${r.error || '结构验证失败'}`);
        });
    }
    
    // 4. 演示TestRunner功能
    console.log('\n🏃 TestRunner演示...');
    const runner = new TestRunner('src/mastra/tools/chart/configs', './demo-reports');
    
    console.log(`支持的图表类型数量: ${runner.getSupportedChartTypes().length}`);
    
    console.log('\n🎉 演示完成！');
    console.log('\n💡 提示:');
    console.log('  - 使用 TestRunner.runAllTestsWithReport() 生成完整报告');
    console.log('  - 使用 TestRunner.runSpecificTests([types]) 测试特定类型');
    console.log('  - 报告会保存为JSON和HTML格式');
    console.log('  - HTML报告包含交互式界面');
    
  } catch (error) {
    console.error('❌ 演示过程中发生错误:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  runDemo();
}

export { runDemo }; 