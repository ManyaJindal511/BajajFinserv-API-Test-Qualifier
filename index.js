import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const EMAIL = process.env.EMAIL;

const fibonacci = (n) => {
  if (n <= 0) return [];
  const res = [0];
  if (n === 1) return res;
  res.push(1);
  for (let i = 2; i < n; i++) {
    res.push(res[i - 1] + res[i - 2]);
  }
  return res;
};

const isPrime = (num) => {
  if (num < 2) return false;
  for (let i = 2; i * i <= num; i++) {
    if (num % i === 0) return false;
  }
  return true;
};

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));

const hcf = (arr) => arr.reduce((a, b) => gcd(a, b));

const lcm = (arr) => {
  const lcmTwo = (a, b) => (a * b) / gcd(a, b);
  return arr.reduce((a, b) => lcmTwo(a, b));
};


app.get("/health", (req, res) => {
  res.status(200).json({
    is_success: true,
    official_email: EMAIL,
  });
});

app.post("/bfhl", async (req, res) => {
  try {
    const body = req.body;
    const keys = Object.keys(body);

    if (keys.length !== 1) {
      return res.status(400).json({
        is_success: false,
        message: "Exactly one key is required",
      });
    }

    const key = keys[0];
    let data;

    if (key === "fibonacci") {
      const n = body[key];
      if (!Number.isInteger(n) || n < 0)
        throw new Error("Invalid fibonacci input");
      data = fibonacci(n);
    }

    else if (key === "prime") {
      if (!Array.isArray(body[key]))
        throw new Error("Prime input must be an array");
      data = body[key].filter(isPrime);
    }

    else if (key === "hcf") {
      if (!Array.isArray(body[key]))
        throw new Error("HCF input must be an array");
      data = hcf(body[key]);
    }

    else if (key === "lcm") {
      if (!Array.isArray(body[key]))
        throw new Error("LCM input must be an array");
      data = lcm(body[key]);
    }

    else if (key === "AI") {
  try {
    const prompt = `Answer in ONE WORD only.\nQuestion: ${body[key]}`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      }
    );

    let text =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    data = text
      .trim()
      .split(/\s+/)[0]          
      .replace(/[^A-Za-z]/g, ""); 

    if (!data) data = "Unknown";

  } catch (err) {
    data = "Unknown";
  }
}



    else {
      return res.status(400).json({
        is_success: false,
        message: "Invalid key",
      });
    }

    res.status(200).json({
      is_success: true,
      official_email: EMAIL,
      data,
    });

  } catch (error) {
    res.status(500).json({
      is_success: false,
      message: error.message,
    });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
