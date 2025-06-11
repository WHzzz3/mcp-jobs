import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'path';
import { writeFileSync, mkdirSync, rmSync, existsSync } from 'fs';
import { 
  SampleJsonLoader, 
  ChartSampleConfig, 
  SampleFileInfo,
  LoadResult,
  BatchLoadResult 
} from '../utils/sample-json-loader';

describe('SampleJsonLoader', () => {
  let loader: SampleJsonLoader;
  let testConfigsPath: string;

  beforeEach(() => {
    // 使用实际的configs路径进行测试
    testConfigsPath = 'src/mastra/tools/chart/configs';
    loader = new SampleJsonLoader(testConfigsPath);
  });

  afterEach(() => {
    loader.clearCache();
  });

  describe('基础功能', () => {
    it('应该正确初始化加载器', () => {
      expect(loader).toBeInstanceOf(SampleJsonLoader);
      expect(loader.getCacheStatus().cachedFiles).toBe(0);
    });

    it('应该能够扫描配置目录', () => {
      const files = loader.scanDirectory();
      
      expect(Array.isArray(files)).toBe(true);
      expect(files.length).toBeGreaterThan(0);
      
      // 验证文件信息结构
      const firstFile = files[0];
      expect(firstFile).toHaveProperty('filename');
      expect(firstFile).toHaveProperty('fullPath');
      expect(firstFile).toHaveProperty('chartType');
      expect(firstFile).toHaveProperty('size');
      expect(firstFile).toHaveProperty('lastModified');
      
      // 验证文件名格式
      expect(firstFile.filename).toMatch(/\.sample\.json$/);
      expect(firstFile.chartType).toBeTruthy();
      expect(firstFile.size).toBeGreaterThan(0);
    });

    it('应该能够获取支持的图表类型', () => {
      const chartTypes = loader.getSupportedChartTypes();
      
      expect(Array.isArray(chartTypes)).toBe(true);
      expect(chartTypes.length).toBeGreaterThan(0);
      
      // 验证包含预期的图表类型
      expect(chartTypes).toContain('basic-column');
      expect(chartTypes).toContain('basic-bar');
      expect(chartTypes).toContain('sankey');
      
      // 验证排序
      const sorted = [...chartTypes].sort();
      expect(chartTypes).toEqual(sorted);
    });

    it('应该能够获取统计信息', () => {
      const stats = loader.getStatistics();
      
      expect(stats).toHaveProperty('totalFiles');
      expect(stats).toHaveProperty('totalSize');
      expect(stats).toHaveProperty('chartTypes');
      expect(stats).toHaveProperty('averageSize');
      expect(stats).toHaveProperty('lastModified');
      
      expect(stats.totalFiles).toBeGreaterThan(0);
      expect(stats.totalSize).toBeGreaterThan(0);
      expect(stats.chartTypes).toBeGreaterThan(0);
      expect(stats.averageSize).toBeGreaterThan(0);
      expect(stats.lastModified).toBeInstanceOf(Date);
    });
  });

  describe('文件加载功能', () => {
    it('应该能够加载单个示例文件', () => {
      const result = loader.loadSample('basic-column.sample.json');
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.info).toBeDefined();
      
      if (result.data) {
        expect(result.data).toHaveProperty('data');
        expect(result.data).toHaveProperty('pipe');
        expect(result.data).toHaveProperty('props');
        expect(result.data.props).toHaveProperty('type');
        expect(result.data.props.type).toBe('basic-column');
      }
    });

    it('应该能够根据图表类型加载示例', () => {
      const result = loader.loadByChartType('basic-column');
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      
      if (result.data) {
        expect(result.data.props.type).toBe('basic-column');
      }
    });

    it('应该正确处理不存在的文件', () => {
      const result = loader.loadSample('non-existent.sample.json');
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('文件不存在');
    });

    it('应该能够批量加载所有示例文件', () => {
      const result = loader.loadAllSamples();
      
      expect(result).toHaveProperty('totalFiles');
      expect(result).toHaveProperty('loadedFiles');
      expect(result).toHaveProperty('failedFiles');
      expect(result).toHaveProperty('results');
      expect(result).toHaveProperty('byType');
      
      expect(result.totalFiles).toBeGreaterThan(0);
      expect(result.loadedFiles).toBeGreaterThan(0);
      expect(result.results.length).toBe(result.totalFiles);
      expect(result.byType.size).toBeGreaterThan(0);
      
      // 验证结果结构
      const firstResult = result.results[0];
      expect(firstResult).toHaveProperty('filename');
      expect(firstResult).toHaveProperty('success');
      
      if (firstResult.success) {
        expect(firstResult).toHaveProperty('data');
      } else {
        expect(firstResult).toHaveProperty('error');
      }
    });

    it('应该能够按类型获取示例', () => {
      const samples = loader.getSamplesByType('basic-column');
      
      expect(Array.isArray(samples)).toBe(true);
      if (samples.length > 0) {
        expect(samples[0].props.type).toBe('basic-column');
      }
    });
  });

  describe('缓存功能', () => {
    it('应该使用缓存提高性能', () => {
      // 第一次加载
      const result1 = loader.loadSample('basic-column.sample.json', true);
      expect(result1.success).toBe(true);
      
      // 检查缓存状态
      const cacheStatus1 = loader.getCacheStatus();
      expect(cacheStatus1.cachedFiles).toBe(1);
      
      // 第二次加载（应该从缓存）
      const result2 = loader.loadSample('basic-column.sample.json', true);
      expect(result2.success).toBe(true);
      
      // 缓存应该仍然是1个文件
      const cacheStatus2 = loader.getCacheStatus();
      expect(cacheStatus2.cachedFiles).toBe(1);
    });

    it('应该能够禁用缓存', () => {
      // 禁用缓存加载
      const result = loader.loadSample('basic-column.sample.json', false);
      expect(result.success).toBe(true);
      
      // 缓存应该为空
      const cacheStatus = loader.getCacheStatus();
      expect(cacheStatus.cachedFiles).toBe(0);
    });

    it('应该能够清空缓存', () => {
      // 加载一些文件到缓存
      loader.loadSample('basic-column.sample.json', true);
      loader.loadSample('basic-bar.sample.json', true);
      
      let cacheStatus = loader.getCacheStatus();
      expect(cacheStatus.cachedFiles).toBe(2);
      
      // 清空缓存
      loader.clearCache();
      
      cacheStatus = loader.getCacheStatus();
      expect(cacheStatus.cachedFiles).toBe(0);
      expect(cacheStatus.fileInfoCacheSize).toBe(0);
    });
  });

  describe('数据验证功能', () => {
    it('应该能够验证示例文件结构', () => {
      const result = loader.validateSample('basic-column.sample.json');
      
      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
    });

    it('应该能够提取输入数据', () => {
      const loadResult = loader.loadSample('basic-column.sample.json');
      expect(loadResult.success).toBe(true);
      
      if (loadResult.data) {
        const inputData = loader.extractInputData(loadResult.data);
        
        expect(inputData).toHaveProperty('chartType');
        expect(inputData).toHaveProperty('data');
        expect(inputData).toHaveProperty('title');
        expect(inputData).toHaveProperty('subtitle');
        expect(inputData).toHaveProperty('theme');
        
        expect(inputData.chartType).toBe('basic-column');
        expect(Array.isArray(inputData.data)).toBe(true);
        expect(inputData.theme).toBe('light');
      }
    });

    it('应该正确处理key_value管道类型的数据', () => {
      const loadResult = loader.loadSample('basic-column.sample.json');
      expect(loadResult.success).toBe(true);
      
      if (loadResult.data) {
        const originalDataLength = loadResult.data.data[0].length;
        const inputData = loader.extractInputData(loadResult.data);
        
        // 对于key_value类型，应该移除标题行
        if (loadResult.data.pipe === 'key_value') {
          expect(inputData.data[0].length).toBe(originalDataLength - 1);
        }
      }
    });
  });

  describe('错误处理', () => {
    it('应该正确处理无效的配置目录', () => {
      const invalidLoader = new SampleJsonLoader('/invalid/path');
      
      expect(() => {
        invalidLoader.scanDirectory();
      }).toThrow('扫描目录失败');
    });

    it('应该正确处理损坏的JSON文件', () => {
      // 创建临时测试目录和损坏的JSON文件
      const tempDir = join(process.cwd(), 'temp-test-configs');
      const tempFile = join(tempDir, 'invalid.sample.json');
      
      try {
        mkdirSync(tempDir, { recursive: true });
        writeFileSync(tempFile, '{ invalid json }');
        
        const tempLoader = new SampleJsonLoader(tempDir);
        const result = tempLoader.loadSample('invalid.sample.json');
        
        expect(result.success).toBe(false);
        expect(result.error).toContain('加载文件失败');
      } finally {
        // 清理临时文件
        if (existsSync(tempDir)) {
          rmSync(tempDir, { recursive: true, force: true });
        }
      }
    });
  });

  describe('性能测试', () => {
    it('批量加载应该在合理时间内完成', () => {
      const startTime = Date.now();
      const result = loader.loadAllSamples();
      const endTime = Date.now();
      
      const duration = endTime - startTime;
      
      expect(result.totalFiles).toBeGreaterThan(0);
      expect(duration).toBeLessThan(5000); // 5秒内完成
      
      console.log(`批量加载 ${result.totalFiles} 个文件耗时: ${duration}ms`);
    });

    it('缓存应该显著提高重复加载性能', () => {
      const filename = 'basic-column.sample.json';
      
      // 第一次加载（无缓存）
      loader.clearCache();
      const startTime1 = Date.now();
      const result1 = loader.loadSample(filename, true);
      const endTime1 = Date.now();
      const duration1 = endTime1 - startTime1;
      
      expect(result1.success).toBe(true);
      
      // 第二次加载（使用缓存）
      const startTime2 = Date.now();
      const result2 = loader.loadSample(filename, true);
      const endTime2 = Date.now();
      const duration2 = endTime2 - startTime2;
      
      expect(result2.success).toBe(true);
      
      // 缓存加载应该更快（允许一些误差）
      expect(duration2).toBeLessThanOrEqual(duration1 + 1);
      
      console.log(`首次加载: ${duration1}ms, 缓存加载: ${duration2}ms`);
    });
  });

  describe('集成测试', () => {
    it('应该能够处理所有现有的示例文件', () => {
      const result = loader.loadAllSamples();
      
      // 大部分文件应该成功加载
      const successRate = result.loadedFiles / result.totalFiles;
      expect(successRate).toBeGreaterThan(0.8); // 至少80%成功率
      
      // 验证按类型分组
      for (const [chartType, samples] of result.byType.entries()) {
        expect(samples.length).toBeGreaterThan(0);
        samples.forEach(sample => {
          expect(sample.props.type).toBe(chartType);
        });
      }
    });

    it('应该能够验证所有成功加载的文件', () => {
      const batchResult = loader.loadAllSamples();
      const successfulFiles = batchResult.results
        .filter(r => r.success)
        .map(r => r.filename);
      
      let validationSuccessCount = 0;
      
      for (const filename of successfulFiles) {
        const validationResult = loader.validateSample(filename);
        if (validationResult.success) {
          validationSuccessCount++;
        }
      }
      
      // 成功加载的文件也应该通过验证
      expect(validationSuccessCount).toBe(successfulFiles.length);
    });

    it('应该能够为所有示例生成输入数据', () => {
      const batchResult = loader.loadAllSamples();
      
      for (const result of batchResult.results) {
        if (result.success && result.data) {
          const inputData = loader.extractInputData(result.data);
          
          expect(inputData.chartType).toBe(result.data.props.type);
          expect(Array.isArray(inputData.data)).toBe(true);
          expect(typeof inputData.title).toBe('string');
          expect(typeof inputData.subtitle).toBe('string');
          expect(inputData.theme).toBe('light');
        }
      }
    });
  });
}); 