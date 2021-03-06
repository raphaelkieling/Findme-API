const jwt = require('jsonwebtoken');
const secret = require('../../../utils/utils').JWT_SECRET;

const tokenResolvers = {
    Mutation: {
        createToken(parent, { usuario, senha }, { db }) {
            return db.usuario.findOne({
                where: { usuario },
                attributes: ['id','ativo', 'usuario', 'senha', 'pessoaId'],
                include: [
                    {
                        model: db.permissao,
                        attributes: ['id', 'nome']
                    }, {
                        model: db.pessoa,
                        include: [{
                            model: db.categoria,
                            as: 'categorias'
                        }]
                    }]
            }).then((user) => {
                let errorMessage = 'Não autorizado, usuário ou senha incorretas';

                if (!user || !user.isPassword(user.get('senha'), senha))
                    throw new Error(errorMessage);

                if(!user.get('ativo')){
                    throw new Error('Você foi desativado do sistema, contate o suporte!');
                }

                const payload = {
                    sub: user.get('id'),
                    usuario: user.get({ plain: true })
                }

                return {
                    token: jwt.sign(payload, secret)
                }
            })
        }
    }
}

module.exports = tokenResolvers;