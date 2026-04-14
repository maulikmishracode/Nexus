const express    = require("express");
const { spawn }  = require("child_process");
const router     = express.Router();

router.post("/", async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: "No question" });

  const python = "C:\\Users\\HP\\AppData\\Local\\Programs\\Python\\Python314\\python.exe";
  const script = "C:\\Users\\HP\\Desktop\\Nexus\\pipeline\\run_agent.py";

  const proc = spawn(python, [script, question]);
  let output = "";
  let errors = "";

  proc.stdout.on("data", d => output += d.toString());
  proc.stderr.on("data", d => errors += d.toString());

  proc.on("close", () => {
    try {
      const result = JSON.parse(output);
      res.json(result);
    } catch(e) {
      res.status(500).json({ error: errors });
    }
  });
});

module.exports = router;
