const express = require("express");
const app = express();
const flips = require("./data/flips-data");
const counts = require("./data/counts-data");

// built-in middleware that adds a body property to the request (req.body)
// must come before any handlers that make use of JSON in the body of the request
app.use(express.json())

app.use("/counts/:countId", (req, res, next) => {
  const { countId } = req.params;
  const foundCount = counts[countId];

  if (foundCount === undefined) {
    next(`Count id not found: ${countId}`);
  } else {
    res.json({ data: foundCount }); // Return a JSON object, not a number.
  }
});

app.use("/counts", (req, res) => {
  res.json({ data: counts });
});

app.use("/flips/:flipId", (req, res, next) => {
  const { flipId } = req.params;
  const foundFlip = flips.find((flip) => flip.id === Number(flipId));

  if (foundFlip) {
    res.json({ data: foundFlip });
  } else {
    next(`Flip id not found: ${flipId}`);
  }
});

app.get("/flips", (req, res) => {
  res.json({ data: flips });
});

// Variable to hold the next id.
// Since some ID's may already be used, you find the largest assigned id.
let lastFlipId = flips.reduce((maxId, flip) => Math.max(maxId, flip.id), 0)

app.post("/flips", (request, response, next) => {
  const { data: { result } = {} } = request.body;
  if (result) {
    const newFlip = {
      id: ++lastFlipId, // Increment last id then assign as the current ID
      result,
    };
    flips.push(newFlip);
    counts[result] = counts[result] + 1; // Increment the counts
    response.status(201).json({ data: newFlip });
  } else {
    response.sendStatus(400);
  }
});


// Not found handler
app.use((request, response, next) => {
  next(`Not found: ${request.originalUrl}`);
});

// Error handler
app.use((error, request, response, next) => {
  console.error(error);
  response.send(error);
});

module.exports = app;
