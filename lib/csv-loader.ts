import type { Question } from "./types";

const CSV_URL =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/leetcode_problem-j949BIPrcSNZSL5jl6ItR0TgP1bZ7o.csv";
const CSV_CACHE_KEY = "leetcode_csv_dataset_cache";
const CACHE_EXPIRY_DAYS = 7;

interface CSVRow {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  acceptance_rate: number;
  url: string;
  companies: string;
  related_topics: string;
}

function mapDifficultyToLevel(difficulty: string): "easy" | "medium" | "hard" {
  const normalized = difficulty.toLowerCase().trim();
  if (normalized === "easy") return "easy";
  if (normalized === "medium") return "medium";
  if (normalized === "hard") return "hard";
  return "medium";
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

function parseCSV(csvText: string): CSVRow[] {
  const lines = csvText.split("\n").filter((line) => line.trim());
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  const rows: CSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length < 3) continue;

    const row: CSVRow = {
      id: Number.parseInt(values[headers.indexOf("id")] || values[0]) || i,
      title: values[headers.indexOf("title")] || "",
      description: values[headers.indexOf("description")] || "",
      difficulty: values[headers.indexOf("difficulty")] || "medium",
      acceptance_rate:
        Number.parseFloat(values[headers.indexOf("acceptance_rate")] || "0") ||
        0,
      url: values[headers.indexOf("url")] || "",
      companies: values[headers.indexOf("companies")] || "",
      related_topics: values[headers.indexOf("related_topics")] || "",
    };

    if (row.title && row.description) {
      rows.push(row);
    }
  }

  return rows;
}

function convertCSVToQuestions(csvRows: CSVRow[]): Question[] {
  return csvRows.map((row) => {
    const topics = row.related_topics
      ? row.related_topics.split(",").map((t) => t.trim())
      : ["general"];
    const primaryTopic = topics[0] || "general";

    return {
      id: `csv-${row.id}`,
      title: row.title,
      description: row.description,
      difficulty: mapDifficultyToLevel(row.difficulty),
      topic: primaryTopic,
      subtopic: topics[1] || primaryTopic,
      type: "code-writing",
      tags: topics,
      prerequisites: [],
      estimatedTime: 600,
      starterCode: "",
      expectedOutput: "",
      hints: [],
      testCases: [],
      companies: row.companies
        ? row.companies.split(",").map((c) => c.trim())
        : [],
      acceptanceRate: row.acceptance_rate,
      url: row.url,
    };
  });
}

export async function loadCSVDataset(): Promise<Question[]> {
  if (typeof window === "undefined") return [];

  try {
    console.log(" Fetching LeetCode dataset from CSV...");

    const response = await fetch(CSV_URL);
    if (!response.ok) {
      console.error(" Failed to fetch CSV:", response.statusText);
      return [];
    }

    const csvText = await response.text();
    const csvRows = parseCSV(csvText);
    const questions = convertCSVToQuestions(csvRows);

    console.log(` Loaded ${questions.length} problems from CSV`);

    // Cache the dataset
    const cacheData = {
      version: "v1",
      timestamp: Date.now(),
      questions,
    };
    localStorage.setItem(CSV_CACHE_KEY, JSON.stringify(cacheData));

    return questions;
  } catch (error) {
    console.error(" Error loading CSV dataset:", error);
    return [];
  }
}

export function getCachedCSVQuestions(): Question[] {
  if (typeof window === "undefined") return [];

  try {
    const cached = localStorage.getItem(CSV_CACHE_KEY);
    if (!cached) return [];

    const cacheData = JSON.parse(cached);
    const cacheAge = Date.now() - cacheData.timestamp;
    const maxAge = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

    if (cacheAge > maxAge) {
      localStorage.removeItem(CSV_CACHE_KEY);
      return [];
    }

    return cacheData.questions || [];
  } catch (error) {
    console.error(" Error reading CSV cache:", error);
    return [];
  }
}
