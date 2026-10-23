import "dotenv/config";
import {
  categories,
  classifyTicket,
  priorities,
} from "./src/services/aiService.js";

const subject = "My royalty payment has not arrived.";
const description =
  "I earned royalties last quarter, but I have not received my payment.";
const startedAt = Date.now();

try {
  const result = await classifyTicket(subject, description);
  const elapsedMs = Date.now() - startedAt;
  const validResult =
    categories.includes(result.category) && priorities.includes(result.priority);

  if (result.source === "gemini" && validResult) {
    console.log(
      "LIVE AI SUCCESS",
      JSON.stringify({
        category: result.category,
        priority: result.priority,
        elapsedMs,
      }),
    );
  } else {
    console.error("FALLBACK USED");
    console.error(
      JSON.stringify({
        category: result.category,
        priority: result.priority,
        source: result.source,
        elapsedMs,
      }),
    );
    process.exitCode = 1;
  }
} catch (error) {
  console.error("FALLBACK USED");
  console.error(`Gemini test failed (${error?.name || "error"}).`);
  process.exitCode = 1;
}
