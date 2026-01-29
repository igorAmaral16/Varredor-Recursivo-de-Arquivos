const app = require("./src/app");

const PORT = process.env.PORT || 5051;


app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server rodando na porta ${PORT}`);
});
