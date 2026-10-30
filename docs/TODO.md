# Tarefas

## P0, antes de tratar preço como valor confirmado

- [x] Permitir entrada manual de preço exato ou intervalo e indicar carimbo temporal.
- [x] Separar custos previstos de despesas pagas.
- [x] Impedir inferir preço real apenas a partir de distância ou duração.
- [x] Registar cálculos em cêntimos inteiros e incluir testes.
- [ ] Validar a experiência num iPhone real, incluindo instalação PWA e exportação/importação.
- [ ] Confirmar a precisão da morada selecionada e a resposta real de My Geocode e OSRM em diferentes trajetos; fornecedor externo pode falhar.

## P1

- [x] Registar viagem paga, planeada, edição e eliminação.
- [x] Criar relatórios mensais e orçamento.
- [x] Apoiar comparação de múltiplas categorias de cada plataforma.
- [ ] Melhorar comparação para decisão por hora de chegada quando todas as ofertas fornecerem duração e espera.
- [ ] Adicionar backup/restauro sincronizado só após autenticação e escolha explícita do utilizador.

## P2

- [ ] Avaliar OCR privado no dispositivo, com revisão obrigatória de preços e descontos reconhecidos.
- [x] Acrescentar consulta pontual de distância/duração via serviços externos, com aviso contextual e sem transformar em preços falsos.
- [x] Tornar a consulta de distância automática na confirmação de moradas e facilitar acesso às plataformas oficiais sem inventar preços.
- [ ] Avaliar substituição do servidor OSRM de demonstração por serviço de rotas com garantia de disponibilidade, se a aplicação crescer.
- [ ] Obter documentação/autorização comercial de API de cotações para Uber e Bolt, caso seja realmente oferecida para comparação concorrencial; não prometer consulta de tarifas sem essa autorização.
- [ ] Verificar se os operadores disponibilizam ligações profundas oficiais estáveis para preencher origem e destino sem colocar dados privados em URLs não autorizados.
- [ ] Investigar integração oficial somente se os termos das plataformas autorizarem o caso de uso.
