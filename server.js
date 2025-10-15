import app from "./App.js";
import https from "https";
import fs from "fs";

const PORT = 5175;

/*try {
  const options = {
    key: fs.readFileSync('./server.key'),
    cert: fs.readFileSync('./server.cert')
  };

  https.createServer(options, app).listen(PORT,'0.0.0.0', () => {
    console.log(`HTTPS Server is running on port ${PORT}`);
  });
} catch (error) {
  console.error("Failed to start HTTPS server:", error);
  process.exit(1);
}
*/

app.listen(PORT, async () => {
  try {
    console.log(`Server is running on port ${PORT}`);
  } catch (error) {
    console.error("Failed to connect to the database", error);
    process.exit(1);
  }
});
