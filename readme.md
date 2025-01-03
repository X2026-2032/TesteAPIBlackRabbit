# Api

AjioPay style api.

## RFs (Requisitos funcionais)

- [x] Deve ser possível se cadastrar;
- [x] Deve ser possível se autenticar;
- [x] Deve ser possível consultar Extrato;
- [x] Deve ser possível realizar uma TED;
- [x] Deve ser possível realizar pagamento de contas;
- [x] Deve ser possível realizar um Pix;
- [x] Deve ser possível registrar uma chave Pix;
- [x] Deve ser possível listar chaves Pix;
- [ ] Deve ser possível registrar QrCode estático;
- [ ] Deve ser possível registrar QrCode dinâmico;

## RNs (Regras de negócio)

- [x] O usuário não deve poder se cadastrar com um e-mail duplicado;

## RNFs (Requisitos não-funcionais)

- [x] Os dados da aplicação precisam estar persistidos em um banco PostgreSQL;
- [x] O usuário deve ser identificado por um JWT (JSON Web Token);
