import { describe, it, expect, beforeEach } from 'vitest';
import { BarProgressChartGenerator, BarProgressChartInputSchema } from '../generators/bar-progress-chart.generator';
import { DonutProgressChartGenerator, DonutProgressChartInputSchema } from '../generators/donut-progress-chart.generator';

describe('Progress Charts Generators', () => {
  let barProgressGenerator: BarProgressChartGenerator;
  let donutProgressGenerator: DonutProgressChartGenerator;

  beforeEach(() => {
    barProgressGenerator = new BarProgressChartGenerator();
    donutProgressGenerator = new DonutProgressChartGenerator();
  });

  describe('BarProgressChartGenerator', () => {
    describe('实例创建', () => {
      it('应该正确创建 BarProgressChartGenerator 实例', () => {
        expect(barProgressGenerator).toBeInstanceOf(BarProgressChartGenerator);
        expect(barProgressGenerator).toBeDefined();
      });
    });

    describe('输入验证', () => {
      it('应该验证有效的进度图输入数据', () => {
        const validInput = {
          data: [['开发进度', 75]] as Array<[string, number]>,
          title: '项目进度',
          subtitle: '当前状态'
        };

        expect(() => BarProgressChartInputSchema.parse(validInput)).not.toThrow();
      });

      it('应该为缺失的可选字段提供默认值', () => {
        const minimalInput = {
          data: [['任务完成', 60]] as Array<[string, number]>
        };

        const parsed = BarProgressChartInputSchema.parse(minimalInput);
        expect(parsed.title).toBe('条形进度图');
        expect(parsed.subtitle).toBe('副标题');
        expect(parsed.widthPercent).toBe(1);
        expect(parsed.showLabels).toBe(false);
        expect(parsed.borderRadius).toEqual([0, 0, 0, 0]);
      });

      it('应该拒绝无效的进度值', () => {
        const invalidInput = {
          data: [['错误进度', 150]] as Array<[string, number]>
        };

        expect(() => BarProgressChartInputSchema.parse(invalidInput)).toThrow();
      });

      it('应该拒绝负数进度值', () => {
        const invalidInput = {
          data: [['负数进度', -10]] as Array<[string, number]>
        };

        expect(() => BarProgressChartInputSchema.parse(invalidInput)).toThrow();
      });

      it('应该验证 widthPercent 范围', () => {
        const invalidInput = {
          data: [['测试', 50]] as Array<[string, number]>,
          widthPercent: 1.5
        };

        expect(() => BarProgressChartInputSchema.parse(invalidInput)).toThrow();
      });
    });

    describe('配置生成', () => {
      it('应该生成正确的条形进度图配置', async () => {
        const input = {
          data: [['开发进度', 80]] as Array<[string, number]>,
          title: '项目进度',
          subtitle: '开发阶段',
          widthPercent: 0.8,
          customColor: '#FF6B6B'
        };

        const result = await barProgressGenerator.generateConfig(input);

        // 验证基本结构
        expect(result.data).toBeDefined();
        expect(result.pipe).toBe('key_value');
        expect(result.props.type).toBe('bar-progress');

        // 验证标题配置
        expect(result.props.title).toBeDefined();

        // 验证数据映射
        expect(result.props.map).toHaveLength(2);
        expect(result.props.map[0].name).toBe('名称');
        expect(result.props.map[1].name).toBe('值');
        expect(result.props.map[1].type).toBe('bar');

        // 验证填充配置
        expect(result.props.fill.controlType).toBe('single');
        expect(result.props.fill.props).toHaveLength(1);
        expect(result.props.fill.props[0].color.color).toBe('#FF6B6B');

        // 验证显示配置
        expect(result.props.display.bar).toBeDefined();
        expect(result.props.display.bar.widthPercent).toBe(0.8);
      });

      it('应该正确处理默认配置', async () => {
        const input = {
          data: [['默认进度', 50]] as Array<[string, number]>
        };

        const result = await barProgressGenerator.generateConfig(input);

        expect(result.props.display.bar.widthPercent).toBe(1);
        expect(result.props.display.bar.backgroundColor).toBe(null);
        expect(result.props.label.show).toBe(false);
      });

      it('应该支持标签显示配置', async () => {
        const input = {
          data: [['进度', 90]] as Array<[string, number]>,
          showLabels: true
        };

        const result = await barProgressGenerator.generateConfig(input);

        expect(result.props.label.show).toBe(true);
        expect(result.props.label.numberLabel.show).toBe(true);
      });
    });

    describe('错误处理', () => {
      it('应该拒绝空数据', async () => {
        const input = {
          data: [] as Array<[string, number]>
        };

        await expect(barProgressGenerator.generateConfig(input)).rejects.toThrow('数据格式无效');
      });

      it('应该拒绝超出范围的进度值', async () => {
        const input = {
          data: [['超范围', 120]] as Array<[string, number]>
        };

        await expect(barProgressGenerator.generateConfig(input)).rejects.toThrow('必须在 0-100 范围内');
      });
    });

    describe('Schema 加载', () => {
      it('应该能够加载和合并 schema', async () => {
        const schema = await barProgressGenerator.loadSchema();
        expect(schema).toBeDefined();
        expect(schema.properties).toBeDefined();
      });
    });
  });

  describe('DonutProgressChartGenerator', () => {
    describe('实例创建', () => {
      it('应该正确创建 DonutProgressChartGenerator 实例', () => {
        expect(donutProgressGenerator).toBeInstanceOf(DonutProgressChartGenerator);
        expect(donutProgressGenerator).toBeDefined();
      });
    });

    describe('输入验证', () => {
      it('应该验证有效的圆环进度图输入数据', () => {
        const validInput = {
          data: [['完成度', 65]] as Array<[string, number]>,
          title: '任务进度',
          innerRadiusRatio: 0.7
        };

        expect(() => DonutProgressChartInputSchema.parse(validInput)).not.toThrow();
      });

      it('应该为缺失的可选字段提供默认值', () => {
        const minimalInput = {
          data: [['测试进度', 45]] as Array<[string, number]>
        };

        const parsed = DonutProgressChartInputSchema.parse(minimalInput);
        expect(parsed.title).toBe('圆环进度图');
        expect(parsed.innerRadiusRatio).toBe(0.65);
        expect(parsed.gapPercentage).toBe(0);
        expect(parsed.startAngle).toBe(0);
        expect(parsed.rotateDirection).toBe('clockwise');
      });

      it('应该验证内径比例范围', () => {
        const invalidInput = {
          data: [['测试', 50]] as Array<[string, number]>,
          innerRadiusRatio: 1.2
        };

        expect(() => DonutProgressChartInputSchema.parse(invalidInput)).toThrow();
      });

      it('应该验证起始角度值', () => {
        const invalidInput = {
          data: [['测试', 50]] as Array<[string, number]>,
          startAngle: 45 // 不在允许的角度列表中
        };

        expect(() => DonutProgressChartInputSchema.parse(invalidInput)).toThrow();
      });

      it('应该验证旋转方向枚举', () => {
        const invalidInput = {
          data: [['测试', 50]] as Array<[string, number]>,
          rotateDirection: 'invalid' as any
        };

        expect(() => DonutProgressChartInputSchema.parse(invalidInput)).toThrow();
      });
    });

    describe('配置生成', () => {
      it('应该生成正确的圆环进度图配置', async () => {
        const input = {
          data: [['项目完成度', 75]] as Array<[string, number]>,
          title: '圆环进度',
          subtitle: '总体进度',
          innerRadiusRatio: 0.8,
          startAngle: 90,
          customColor: '#4ECDC4'
        };

        const result = await donutProgressGenerator.generateConfig(input);

        // 验证基本结构
        expect(result.data).toBeDefined();
        expect(result.pipe).toBe('key_value');
        expect(result.props.type).toBe('donut-progress');

        // 验证数据映射
        expect(result.props.map).toHaveLength(2);
        expect(result.props.map[1].type).toBe('pie');

        // 验证填充配置
        expect(result.props.fill.controlType).toBe('single');
        expect(result.props.fill.props[0].color.color).toBe('#4ECDC4');

        // 验证显示配置
        expect(result.props.display.pie).toBeDefined();
        expect(result.props.display.pie.innerRadiusRatio).toBe(0.8);
        expect(result.props.display.pie.startAngle).toBe(90);
      });

      it('应该支持不同的旋转方向', async () => {
        const input = {
          data: [['进度', 60]] as Array<[string, number]>,
          rotateDirection: 'counterclockwise' as const
        };

        const result = await donutProgressGenerator.generateConfig(input);

        expect(result.props.display.pie.rotateDirection).toBe('counterclockwise');
      });

      it('应该正确配置间隙百分比', async () => {
        const input = {
          data: [['测试', 40]] as Array<[string, number]>,
          gapPercentage: 5
        };

        const result = await donutProgressGenerator.generateConfig(input);

        expect(result.props.display.pie.gapPercentage).toBe(5);
      });
    });

    describe('错误处理', () => {
      it('应该拒绝空数据', async () => {
        const input = {
          data: [] as Array<[string, number]>
        };

        await expect(donutProgressGenerator.generateConfig(input)).rejects.toThrow('数据格式无效');
      });

      it('应该拒绝超出范围的进度值', async () => {
        const input = {
          data: [['错误进度', 110]] as Array<[string, number]>
        };

        await expect(donutProgressGenerator.generateConfig(input)).rejects.toThrow('必须在 0-100 范围内');
      });
    });

    describe('Schema 加载', () => {
      it('应该能够加载和合并 schema', async () => {
        const schema = await donutProgressGenerator.loadSchema();
        expect(schema).toBeDefined();
        expect(schema.properties).toBeDefined();
      });
    });
  });

  describe('Progress Charts 集成测试', () => {
    it('应该生成兼容的数据格式', async () => {
      const sampleData = [['开发进度', 80]] as Array<[string, number]>;
      
      const barResult = await barProgressGenerator.generateConfig({ data: sampleData });
      const donutResult = await donutProgressGenerator.generateConfig({ data: sampleData });

      // 验证数据格式一致性
      expect(barResult.pipe).toBe(donutResult.pipe);
      expect(barResult.data).toEqual(donutResult.data);

      // 验证共同的配置项
      expect(barResult.props.fill.controlType).toBe(donutResult.props.fill.controlType);
      expect(barResult.props.map.length).toBe(donutResult.props.map.length);
    });

    it('应该有不同的显示配置', async () => {
      const sampleData = [['测试', 50]] as Array<[string, number]>;
      
      const barResult = await barProgressGenerator.generateConfig({ data: sampleData });
      const donutResult = await donutProgressGenerator.generateConfig({ data: sampleData });

      // 验证显示配置的差异
      expect(barResult.props.display.bar).toBeDefined();
      expect(donutResult.props.display.pie).toBeDefined();
      expect(barResult.props.display).not.toHaveProperty('pie');
      expect(donutResult.props.display).not.toHaveProperty('bar');
    });

    it('应该有正确的 map 类型差异', async () => {
      const sampleData = [['类型测试', 70]] as Array<[string, number]>;
      
      const barResult = await barProgressGenerator.generateConfig({ data: sampleData });
      const donutResult = await donutProgressGenerator.generateConfig({ data: sampleData });

      expect(barResult.props.map[1].type).toBe('bar');
      expect(donutResult.props.map[1].type).toBe('pie');
    });

    it('应该支持相同的主题颜色系统', async () => {
      const sampleData = [['颜色测试', 85]] as Array<[string, number]>;
      
      const barResult = await barProgressGenerator.generateConfig({ 
        data: sampleData, 
        theme: 'dark' 
      });
      const donutResult = await donutProgressGenerator.generateConfig({ 
        data: sampleData, 
        theme: 'dark' 
      });

      // 验证都使用了主题颜色系统
      expect(barResult.props.fill.props[0].color).toBeDefined();
      expect(donutResult.props.fill.props[0].color).toBeDefined();
    });
  });
}); 