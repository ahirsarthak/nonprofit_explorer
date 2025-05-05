import { useState } from "react";

const queries = [
  // Revenue & Category
  "Which nonprofit in each state under the Education (B) category has the highest revenue?",
  "List the top 3 nonprofit organizations by revenue in California that are classified under Health (E) and have more than $10 million in assets.",
  "Which states have more than 500 nonprofit organizations with tax-deductible donations allowed?",
  "Get the average income amount for nonprofits in each NTEE major category.",
  "Which 10 nonprofits with ZIP codes starting with ‘90’ have the highest asset amounts?",

  // Filtering + Grouping
  "Find the number of nonprofit organizations per state that were granted tax exemption before 1990.",
  "Which organization types (ORGANIZATION) have the highest average revenue within subsection 501(c)(3)?",
  "What are the 5 most common classification codes used by nonprofits in New York?",
  "List all nonprofits in the ZIP range 10000–19999 that report income over $5 million and are still active.",

  // Text Matching / Fuzzy
  "Find all nonprofits with ‘Children’ or ‘Youth’ in their NAME that have tax-deductible status and are located in Texas.",
  "Which organizations have ‘University’ in their NAME and report over $100 million in revenue?",
  // Status + Time
  "List the nonprofits with asset codes indicating low assets (e.g., ASSET_CD <= 3) but income codes suggesting high income (e.g., INCOME_CD >= 7)."
];

export default function QuerySuggestions({ onPick }) {
    const [show, setShow] = useState(false);
  
    const handleCopy = (text) => {
      navigator.clipboard.writeText(text);
      onPick && onPick(text);
      setShow(false);  // <-- This hides the suggestion list after click
    };
  
    return (
      <div className="text-sm">
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="text-blue-600 hover:underline mb-2"
        >
          {show ? "Hide example queries ▲" : "Need ideas? Show example queries ▼"}
        </button>
  
        {show && (
          <ul className="space-y-2 bg-gray-50 border p-3 rounded">
            {queries.map((q, idx) => (
              <li
                key={idx}
                onClick={() => handleCopy(q)}
                className="cursor-pointer text-gray-700 hover:text-blue-700 transition"
                title="Click to copy and use"
              >
                • {q}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }