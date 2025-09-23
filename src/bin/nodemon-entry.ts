import app from "../app";

const PORT = process.env.NODE_PORT;

app.set("port", PORT);

app.listen(PORT, () => {
    console.log(`✅  Application Ready. Running on port ${PORT}`);
});
