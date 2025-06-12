import { google } from "@ai-sdk/google";
import { Agent } from "@mastra/core/agent";
import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
import {
  chartTypeRegistry,
  initializeChartRegistry,
} from "../tools/chart/registry";
import { BaseChartInput } from "../tools/chart/interfaces/chart-tool.interface";

// 方案1: 使用 JSON 字符串输入
const chartRequestSchema = z.object({
  chartType: z
    .string()
    .describe("图表类型 (如: basic-column, basic-line, basic-pie 等)"),
  // 改为字符串，在执行时解析为数组
  data: z
    .string()
    .describe(
      '图表数据 JSON 字符串，格式: [[["标题1", "标题2"], ["数据1", "数据2"]]]'
    ),
  title: z.string().describe("图表标题"),
  // theme: z.enum(["light", "dark"]).describe("图表主题 (light, dark)"),
  colors: z
    .string()
    .describe("图表主题颜色数组字符串，格式['#000000', '#FFFFFF']"),
});

// 输出 schema
const chartOutputSchema = z.any();

// 单一步骤：生成图表配置
const generateChartConfig = createStep({
  id: "generate-chart-config",
  description: "Generates chart configuration using the appropriate chart tool",
  inputSchema: chartRequestSchema,
  outputSchema: chartOutputSchema,
  execute: async ({ inputData }) => {
    if (!inputData) {
      throw new Error("Input data not found");
    }

    const {
      chartType,
      data: dataString,
      title,
      colors: colorString,
    } = inputData;

    // 解析 JSON 字符串为数组
    let colors: string[];
    try {
      colors = JSON.parse(colorString);
      if (!Array.isArray(colors)) {
        throw new Error("colors must be an array");
      }
    } catch (error) {
      throw new Error(
        'Invalid JSON format for data. Expected format: ["#000000", "#ffffff"]'
      );
    }

    let data: (string | number)[][][];
    try {
      data = JSON.parse(dataString);
      if (!Array.isArray(data)) {
        throw new Error("Data must be an array");
      }
    } catch (error) {
      throw new Error(
        'Invalid JSON format for data. Expected format: [["col1", "col2"], ["val1", "val2"]]'
      );
    }
    await initializeChartRegistry({ includeTypes: [chartType] });

    // 验证数据结构
    if (!data || data.length === 0) {
      throw new Error("Chart data cannot be empty");
    }

    // 获取对应的图表工具
    const chartTool = chartTypeRegistry.getTool(chartType);
    if (!chartTool) {
      const availableTypes = chartTypeRegistry.getRegisteredTypes();
      throw new Error(
        `Chart tool for '${chartType}' not found. Available types: ${availableTypes.join(", ")}`
      );
    }

    try {
      // 准备图表工具的输入数据
      const chartInput: BaseChartInput = {
        chartType,
        data,
        title,
        colors,
      };

      // 使用图表工具生成配置
      const config = await chartTool.generateConfig(chartInput);
      console.log(config);

      return config;
    } catch (error) {
      throw new Error(
        `Failed to generate ${chartType} chart: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },
});

// 创建图表生成工作流
const chartWorkflow = createWorkflow({
  id: "chart-generation-workflow",
  inputSchema: chartRequestSchema,
  outputSchema: chartRequestSchema,
}).then(generateChartConfig);

chartWorkflow.commit();

// 导出工作流和相关类型
export { chartWorkflow, chartRequestSchema };

// 类型定义
export type ChartRequest = z.infer<typeof chartRequestSchema>;
