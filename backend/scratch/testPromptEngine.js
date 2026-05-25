/**
 * Verification Script for AI Prompt Management Architecture & Confidence Scorer
 */

const {
  buildChatPrompt,
  buildTenantPrompt,
  buildLaborPrompt,
  buildContractAnalysisPrompt,
  buildDocumentSimplificationPrompt,
  ensureStructuredResponse,
} = require("../ai/promptManager");

const { calculateConfidence } = require("../utils/confidenceScorer");

console.log("=========================================");
console.log("   EthioLegal AI Prompt Registry Test    ");
console.log("=========================================\n");

// 1. Test Multilingual System Prompt Compiling
console.log("--- 1. Testing System Prompts ---");
const enChat = buildChatPrompt({ message: "Hello", language: "English" });
const amChat = buildChatPrompt({ message: "ሰላም", language: "Amharic" });
const orChat = buildChatPrompt({ message: "Akkam", language: "Afaan Oromo" });

console.log("English System Instruction Sample:");
console.log(enChat.systemInstruction.substring(0, 300) + "...\n");
console.log("Amharic System Instruction Sample:");
console.log(amChat.systemInstruction.substring(0, 300) + "...\n");
console.log("Afaan Oromo System Instruction Sample:");
console.log(orChat.systemInstruction.substring(0, 300) + "...\n");

// 2. Test Reusable Templates
console.log("--- 2. Testing Reusable Templates ---");
const tenantResult = buildTenantPrompt({ message: "Can I be evicted?", language: "English" });
const laborResult = buildLaborPrompt({ message: "Overtime rights", language: "Amharic" });
const simplificationResult = buildDocumentSimplificationPrompt({ text: "This agreement is made...", language: "Afaan Oromo" });
const contractResult = buildContractAnalysisPrompt({ text: "Tenant will pay deposit", filename: "lease.pdf", language: "English" });

console.log("Tenant prompt compiled: " + (tenantResult.prompt.includes("evicted") ? "PASS" : "FAIL"));
console.log("Labor prompt compiled: " + (laborResult.prompt.includes("Overtime rights") ? "PASS" : "FAIL"));
console.log("Simplification prompt compiled: " + (simplificationResult.prompt.includes("made...") ? "PASS" : "FAIL"));
console.log("Contract prompt compiled: " + (contractResult.prompt.includes("deposit") ? "PASS" : "FAIL"));
console.log("Contract system instructions is JSON-oriented: " + (contractResult.systemInstruction.includes("JSON") ? "PASS" : "FAIL") + "\n");

// 3. Test Confidence Scorer
console.log("--- 3. Testing Confidence Scorer ---");
const test1 = calculateConfidence("Here is the legal response which is clear and matching Civil Code Art. 2975.", true);
const test2 = calculateConfidence("I am unsure about this since the provided text does not say. The details are unknown and may vary.", false);
const test3 = calculateConfidence("ሰላም፣ መረጃው በግልጽ አልተቀመጠም፤ እርግጠኛ አይደለሁም ምክንያቱም መረጃ የለም።", true);

console.log(`High confidence (Context Used + Citations): Expected ~97, Got: ${test1}`);
console.log(`Low confidence (No Context + Uncertainty phrases): Expected ~50, Got: ${test2}`);
console.log(`Medium-low confidence (Context Used + Amharic Uncertainty): Expected ~71, Got: ${test3}\n`);

// 4. Test Structured Response formatting fallback
console.log("--- 4. Testing Post-processing formatting ---");
const unstructuredText = "This is a brief answer text. It does not contain any headers.";
const formatted = ensureStructuredResponse(unstructuredText, "English");

console.log("Structured response contains ## Summary: " + (formatted.includes("## Summary") ? "PASS" : "FAIL"));
console.log("Structured response contains ## Explanation: " + (formatted.includes("## Explanation") ? "PASS" : "FAIL"));
console.log("Structured response contains disclaimer: " + (formatted.includes("⚠️") ? "PASS" : "FAIL"));

console.log("\n=========================================");
console.log("          All Unit Tests Complete        ");
console.log("=========================================");
