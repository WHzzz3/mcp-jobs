import { BaseChartInput, BaseChartOutput } from '../interfaces/chart-tool.interface';

/**
 * 默认颜色主题
 */
export const DEFAULT_COLORS = {
  light: [
    { color: '#5AAEF3', opacity: 1 },
    { color: '#FF6B9D', opacity: 1 },
    { color: '#4ECDC4', opacity: 1 },
    { color: '#45B7D1', opacity: 1 },
    { color: '#96CEB4', opacity: 1 },
    { color: '#FFEAA7', opacity: 1 },
    { color: '#DDA0DD', opacity: 1 },
    { color: '#98D8C8', opacity: 1 },
  ],
  dark: [
    { color: '#3B82F6', opacity: 1 },
    { color: '#EF4444', opacity: 1 },
    { color: '#10B981', opacity: 1 },
    { color: '#F59E0B', opacity: 1 },
    { color: '#8B5CF6', opacity: 1 },
    { color: '#06B6D4', opacity: 1 },
    { color: '#84CC16', opacity: 1 },
    { color: '#F97316', opacity: 1 },
  ],
};

/**
 * 生成默认标题配置
 */
export function generateDefaultTitle(title?: string, subtitle?: string) {
  return {
    show: !!title,
    mainTitle: {
      show: !!title,
      text: title || '图表标题',
      fontFamily: 'Misans 常规',
      fontSize: 24,
      color: { color: '#333333', opacity: 1 },
      position: { x: 'center', y: 'top' },
    },
    subTitle: {
      show: !!subtitle,
      text: subtitle || '',
      fontSize: 16,
      color: { color: '#666666', opacity: 1 },
      fontFamily: 'Misans 常规',
    },
  };
}

/**
 * 生成默认背景配置
 */
export function generateDefaultBackground(theme: 'light' | 'dark' = 'light') {
  return {
    show: false,
    color: { 
      color: theme === 'light' ? '#ffffff' : '#1a1a1a', 
      opacity: 1 
    },
    border: { radius: 0 },
    blur: 0,
  };
}

/**
 * 生成默认图例配置
 */
export function generateDefaultLegend() {
  return {
    show: true,
    display: 'horizontal',
    position: { x: 'center', y: 'bottom' },
    fontFamily: 'Misans 常规',
    fontSize: 14,
    color: { color: '#333333', opacity: 1 },
  };
}

/**
 * 生成默认数字格式配置
 */
export function generateDefaultNumberFormat() {
  return {
    separatorType: '1000.00',
    decimalPlaces: null,
  };
}

/**
 * 生成默认动画配置
 */
export function generateDefaultAnimation() {
  return {
    show: false,
    transition: false,
    moveStyle: null,
    duration: 2,
    startDelay: 0,
    endPause: 1,
    loop: false,
  };
}

/**
 * 生成默认内边距配置
 */
export function generateDefaultPadding() {
  return {
    top: 20,
    bottom: 23,
    left: 24,
    right: 24,
  };
}

/**
 * 根据主题获取颜色
 */
export function getThemeColors(theme: 'light' | 'dark' = 'light', count: number = 1) {
  const colors = DEFAULT_COLORS[theme];
  const result = [];
  
  for (let i = 0; i < count; i++) {
    result.push(colors[i % colors.length]);
  }
  
  return result;
}

/**
 * 生成默认填充配置
 */
export function generateDefaultFill(
  chartType: string, 
  theme: 'light' | 'dark' = 'light',
  dataLength: number = 1
) {
  const colors = getThemeColors(theme, dataLength);
  const controlType = dataLength > 1 ? 'multiple' : 'single';
  
  return {
    controlType,
    props: colors.map(color => ({
      color,
      shadow: {
        show: false,
        type: 'outer',
        angle: 45,
        blur: chartType.includes('progress') ? 2 : 5,
        color: { color: '#000000', opacity: chartType.includes('progress') ? 0.1 : 0.3 },
        radius: chartType.includes('progress') ? 1 : 3,
      },
      border: {
        type: 'solid',
        width: 0,
        color: null,
      },
    })),
  };
}

/**
 * 生成默认标签配置
 */
export function generateDefaultLabel() {
  return {
    show: false,
    numberLabel: {
      show: false,
      positionChoice: 'right',
      fontFamily: 'Misans 常规',
      fontSize: 21,
      color: { color: '#333333', opacity: 1 },
    },
    highlight: false,
    overlap: false,
  };
}

/**
 * 处理图表数据格式
 */
export function processChartData(data: any[][]): any[][][] {
  if (!data || data.length === 0) {
    throw new Error('Data is required for chart generation');
  }

  // 确保数据格式为三维数组
  return [data];
}

/**
 * 验证数据格式
 */
export function validateChartData(data: any[][]): void {
  if (!Array.isArray(data)) {
    throw new Error('Data must be an array');
  }

  if (data.length < 2) {
    throw new Error('Data must have at least 2 rows (header and data)');
  }

  const headerLength = data[0]?.length || 0;
  if (headerLength < 2) {
    throw new Error('Data must have at least 2 columns');
  }

  // 验证每行数据长度一致
  for (let i = 1; i < data.length; i++) {
    if (data[i].length !== headerLength) {
      throw new Error(`Row ${i} has inconsistent column count`);
    }
  }
}

/**
 * 生成图表的默认 props 配置
 */
export function generateDefaultProps(
  chartType: string,
  input: BaseChartInput
): BaseChartOutput['props'] {
  const theme = input.theme || 'light';
  const dataLength = input.data ? input.data.length - 1 : 1; // 减去header行

  return {
    type: chartType,
    title: generateDefaultTitle(input.title, input.subtitle),
    background: generateDefaultBackground(theme),
    legend: generateDefaultLegend(),
    numberFormat: generateDefaultNumberFormat(),
    animation: generateDefaultAnimation(),
    tooltip: false,
    padding: generateDefaultPadding(),
    fill: generateDefaultFill(chartType, theme, dataLength),
    label: generateDefaultLabel(),
  };
}

/**
 * 创建完整的图表配置输出
 */
export function createChartOutput(
  chartType: string,
  input: BaseChartInput,
  customProps: Partial<BaseChartOutput['props']> = {}
): BaseChartOutput {
  if (!input.data) {
    throw new Error('Data is required for chart generation');
  }

  validateChartData(input.data);
  
  const processedData = processChartData(input.data);
  const defaultProps = generateDefaultProps(chartType, input);
  
  return {
    data: processedData,
    pipe: 'key_value',
    props: {
      ...defaultProps,
      ...customProps,
    },
  };
}

/**
 * 深度合并对象
 */
export function deepMerge<T>(target: T, source: Partial<T>): T {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] !== undefined) {
      if (
        typeof source[key] === 'object' && 
        source[key] !== null && 
        !Array.isArray(source[key]) &&
        typeof result[key] === 'object' && 
        result[key] !== null && 
        !Array.isArray(result[key])
      ) {
        result[key] = deepMerge(result[key], source[key] as any);
      } else {
        result[key] = source[key] as any;
      }
    }
  }
  
  return result;
} 