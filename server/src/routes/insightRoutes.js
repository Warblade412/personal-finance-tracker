import express from "express";
import OpenAI from "openai";
import Expense from "../models/Expense.js";
import Insight from "../models/Insight.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

function summarizeExpenses(expenses) {
  const categoryTotals = {};
  const monthlyTotals = {};
  let total = 0;

  for (const expense of expenses) {
    total += expense.amount;
    categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;

    const month = expense.date.toISOString().slice(0, 7);
    monthlyTotals[month] = (monthlyTotals[month] || 0) + expense.amount;
  }

  const highestCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0] || [
    "None",
    0
  ];

  return {
    total: Number(total.toFixed(2)),
    expenseCount: expenses.length,
    highestCategory: {
      name: highestCategory[0],
      amount: Number(highestCategory[1].toFixed(2))
    },
    categoryTotals,
    monthlyTotals
  };
}

function sanitizePlanningSummary(planning = {}) {
  const budget = planning.budget;
  const emergencyFund = planning.emergencyFund;

  return {
    budget: budget
      ? {
          monthlyIncome: toOptionalNumber(budget.monthlyIncome),
          monthlySpending: toOptionalNumber(budget.monthlySpending),
          savingsGoalPercent: toOptionalNumber(budget.savingsGoalPercent),
          savingsGoalAmount: toOptionalNumber(budget.savingsGoalAmount),
          remainingAfterExpenses: toOptionalNumber(budget.remainingAfterExpenses),
          remainingAfterSavingsGoal: toOptionalNumber(budget.remainingAfterSavingsGoal)
        }
      : null,
    emergencyFund: emergencyFund
      ? {
          monthlyExpenses: toOptionalNumber(emergencyFund.monthlyExpenses),
          currentSavings: toOptionalNumber(emergencyFund.currentSavings),
          targetMonths: toOptionalNumber(emergencyFund.targetMonths),
          monthlyContribution: toOptionalNumber(emergencyFund.monthlyContribution),
          targetAmount: toOptionalNumber(emergencyFund.targetAmount),
          remainingAmount: toOptionalNumber(emergencyFund.remainingAmount),
          monthsToGoal: toOptionalNumber(emergencyFund.monthsToGoal)
        }
      : null
  };
}

function toOptionalNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

router.get("/latest", async (req, res, next) => {
  try {
    const insight = await Insight.findOne({ user: req.user._id });
    res.json({ insight });
  } catch (error) {
    next(error);
  }
});

router.post("/generate", async (req, res, next) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ message: "OPENAI_API_KEY is not configured on the server." });
    }

    const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 }).limit(250);

    if (expenses.length === 0) {
      return res.status(400).json({ message: "Add at least one expense before generating insights." });
    }

    const summary = {
      expenses: summarizeExpenses(expenses),
      planning: sanitizePlanningSummary(req.body.planning)
    };
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const model = process.env.OPENAI_MODEL || "gpt-5.4-mini";
    const prompt =
      "You are a helpful personal finance assistant. Based on this user's finance summary, write a short insight in simple language. Use exactly these labels: Spending Pattern:, Budget Status:, Emergency Fund:, Action Suggestions:. Under Budget Status, include only budget details if budget is not null; otherwise say budget data was not provided. Under Emergency Fund, include only emergency fund progress if emergencyFund is not null; otherwise say emergency fund data was not provided. Put saving tips only under Action Suggestions as 1) and 2). Keep it under 180 words. Do not provide professional financial advice.";

    const response = await client.responses.create({
      model,
      input: `${prompt}\n\nUser finance summary:\n${JSON.stringify(summary)}`,
      max_output_tokens: 260
    });

    const content = response.output_text?.trim();
    if (!content) {
      return res.status(502).json({ message: "OpenAI did not return an insight. Please try again." });
    }

    const insight = await Insight.findOneAndUpdate(
      { user: req.user._id },
      { content, summarySnapshot: summary },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ insight });
  } catch (error) {
    next(error);
  }
});

export default router;
