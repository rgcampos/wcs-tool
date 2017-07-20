module.exports = {
    logDb: (usuario, acao, obj) => {
        return new Promise((res, rej) => {
            Log.create({
                info: {
                    user: usuario,
                    action: acao,
                    data: obj
                }
            }).then((data) => {
                res(true);
            }).catch((err) => {
                console.log('Erro ao inserir log', err);
                rej(false);
            });
        });

    }
}