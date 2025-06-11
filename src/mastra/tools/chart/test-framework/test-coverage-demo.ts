#!/usr/bin/env tsx

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { TestCoverageReporter } from './test-coverage-reporter';

/**
 * 测试覆盖报告演示脚本
 */
async function runCoverageDemo() {
  console.log('🔍 启动测试覆盖率分析...\n');
  
  try {
    // 创建覆盖率报告器
    const reporter = new TestCoverageReporter();
    
    // 生成覆盖率报告
    console.log('📊 生成测试覆盖率报告...');
    const report = await reporter.generateCoverageReport();
    
    // 打印控制台报告
    reporter.printConsoleReport(report);
    
    // 生成HTML报告
    console.log('📝 生成HTML报告...');
    const htmlReport = reporter.generateHTMLReport(report);
    
    // 确保输出目录存在
    const outputDir = '.taskmaster/reports';
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }
    
    // 保存HTML报告
    const htmlPath = join(outputDir, 'test-coverage-report.html');
    writeFileSync(htmlPath, htmlReport, 'utf-8');
    console.log(`✅ HTML报告已保存到: ${htmlPath}`);
    
    // 生成JSON报告
    const jsonReport = {
      generatedAt: new Date().toISOString(),
      ...report
    };
    
    const jsonPath = join(outputDir, 'test-coverage-report.json');
    writeFileSync(jsonPath, JSON.stringify(jsonReport, null, 2), 'utf-8');
    console.log(`✅ JSON报告已保存到: ${jsonPath}`);
    
    // 显示简要总结
    console.log('\n📋 报告总结:');
    console.log(`   总覆盖率: ${report.stats.coveragePercentage.toFixed(1)}%`);
    console.log(`   生成器总数: ${report.stats.totalGenerators}`);
    console.log(`   已测试生成器: ${report.stats.testedGenerators}`);
    console.log(`   测试用例总数: ${report.stats.totalTestCases}`);
    console.log(`   通过测试: ${report.stats.passedTestCases}`);
    console.log(`   失败测试: ${report.stats.failedTestCases}`);
    
    if (report.recommendations.length > 0) {
      console.log(`\n🔧 改进建议数量: ${report.recommendations.length}`);
    }
    
    console.log('\n🎉 测试覆盖率分析完成！');
    
  } catch (error) {
    console.error('❌ 生成测试覆盖率报告时出错:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  runCoverageDemo();
}

export { runCoverageDemo }; 