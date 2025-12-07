import "dotenv/config";
import app from "./app";

app.listen(3000, () => {
  console.log("Rest is running on port 3000");
});
