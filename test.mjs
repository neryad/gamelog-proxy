import handler from "./api/games.js";
import { EventEmitter } from "events";

// Mock req/res objects
function createMockReq(method = "POST", options = {}) {
  const req = new EventEmitter();
  req.method = method;
  req.headers = options.headers || {};
  req.socket = req.socket || { remoteAddress: "127.0.0.1" };
  return req;
}

function createMockRes() {
  const res = {
    statusCode: 200,
    headers: {},
    body: null,
    setHeader(key, value) {
      this.headers[key] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = JSON.stringify(data);
      return this;
    },
    end() {
      this.body = "";
      return this;
    },
  };
  return res;
}

async function testOPTIONS() {
  const req = createMockReq("OPTIONS");
  const res = createMockRes();
  await handler(req, res);
  console.assert(res.statusCode === 200, "OPTIONS should return 200");
  console.log("✓ OPTIONS test passed");
}

async function testInvalidMethod() {
  const req = createMockReq("GET");
  const res = createMockRes();
  await handler(req, res);
  console.assert(res.statusCode === 405, "GET should return 405");
  console.log("✓ Invalid method test passed");
}

async function testCORSHeaders() {
  const req = createMockReq("OPTIONS");
  const res = createMockRes();
  await handler(req, res);
  console.assert(
    res.headers["Access-Control-Allow-Origin"] === "*",
    "Should have CORS Origin header",
  );
  console.assert(
    res.headers["Access-Control-Allow-Headers"] === "Content-Type",
    "Should have CORS Headers header",
  );
  console.log("✓ CORS headers test passed");
}

async function runTests() {
  console.log("Running gamelog-proxy handler tests...\n");
  try {
    await testOPTIONS();
    await testInvalidMethod();
    await testCORSHeaders();
    console.log("\n✓ All tests passed!");
  } catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
  }
}

runTests();
