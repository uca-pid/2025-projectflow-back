const request = require("supertest");
const app = require("@App");

let server;

beforeEach(() => {
  server = app.listen(4000);
});

afterEach(async () => {
  server.close();
});

describe("request test", () => {
  it("should respond with a 200 status code.", async () => {
    await request(app).get("/").expect(200);
  });
});
