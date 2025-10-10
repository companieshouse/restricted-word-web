import app from "../app";

// eslint-disable-next-line
const PORT = process.env.PORT;

app.set("port", PORT);

app.listen(PORT, () => {
    console.log(`✅  Application Ready. Running on port ${PORT}`);
});
