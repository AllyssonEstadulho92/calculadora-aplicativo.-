# Especificação funcional | Rota & Conta 1.0.0

## Objetivo e âmbito

Aplicação web progressiva, pessoal, para comparar preços vistos nas aplicações Uber e Bolt, sugerir uma opção com regras explícitas e manter o histórico contabilístico das viagens. Interface em português de Portugal para iPhone e computador.

## Confirmado, inferência, recomendação, por definir

- **Confirmado:** o repositório `AllyssonEstadulho92/calculadora-aplicativo.-` só tinha `README.md`; o utilizador forneceu capturas de seleção de destino, ofertas, intervalos, tempos de recolha e mapa.
- **Inferência:** o utilizador quer introduzir a origem e o destino, comparar opções e controlar o valor pago por mês.
- **Recomendação implementada:** entrada manual dos preços efetivamente mostrados nas duas aplicações, com carimbo temporal e limite de frescura de cinco minutos; sem inventar estimativas ou disponibilidade.
- **Por definir:** integração oficial em tempo real, eventual OCR, sincronização entre dispositivos, dados de rotas por API/cartografia. Não são prometidos nesta versão.

## Fluxo

1. Introduzir origem e destino, opcionalmente hora planeada, e guardar rota.
2. Abrir Uber/Bolt; copiar cada opção (categoria, preço exato ou intervalo, espera, duração, lugares) na ficha Adicionar oferta. Pode consultar uma captura local temporária, sem a carregar para servidor.
3. A área principal mostra a sugestão entre ofertas recentes, ou estado insuficiente/desatualizado; critério alternável entre menor custo e menor espera.
4. A calculadora de rota multiplica os preços indicados pelo número exato de viagens mensais inserido, sem assumir que preços futuros são iguais.
5. Registar viagem planeada ou valor final pago. Só despesas pagas entram no total do mês. Atualizar/Eliminar individualmente no histórico.
6. Ver relatório mensal e orçamento; exportar CSV ou backup JSON e importar uma cópia validada.

## Dados, regras e precisão

- Cêntimos inteiros, formato EUR e `pt-PT`; entrada admite `3,74` ou `3.74`. Máximo €999999,99.
- Oferta: empresa, categoria, rota, preço mínimo/máximo, preço anterior mínimo/máximo opcionais, espera/duração opcionais, lugares, momento de recolha.
- Oferta recente: até cinco minutos. Não há leitura das plataformas, autorização de pagamento, localização GPS nem previsão automática de disponibilidade.
- Sugestão de preço: menor limite superior. Só é **inequivocamente mais barata** quando o seu máximo é inferior ao mínimo seguinte; intervalos cruzados dão resultado inconclusivo, sem certeza falsa.
- Sugestão de rapidez: menor tempo informado até à recolha, não tempo total até ao destino. Se não houver esperas, usar menor preço e indicar o critério real.
- Uma rota marcada para o futuro não recebe recomendação atual, porque as tarifas não são previsíveis para essa hora.
- Cálculo mensal: preço mínimo/máximo × número de viagens inserido (1 a 120); é simulação, não fatura nem preço garantido.
- Despesa contabilística: valor final efetivamente pago, data local, empresa, categoria, percurso e método. Planeamentos excluídos dos totais.
- Orçamento: saldo = orçamento − viagens pagas no mês; um saldo negativo representa excesso.

## Privacidade, acessibilidade e arquitetura

- HTML, CSS e módulos JavaScript nativos, sem dependências de runtime, servidor ou chaves; dados apenas em `localStorage` do navegador utilizado.
- Uma captura selecionada fica disponível só como pré-visualização da sessão de formulário e não é guardada ou enviada.
- PWA com cache apenas dos ficheiros da aplicação, sem armazenamento remoto. Exportação manual importante porque limpar Safari ou mudar de iPhone perde os dados locais.
- Teclado apropriado a valores monetários, etiquetas reais, áreas táteis, estados vazios, avisos acessíveis e interface adaptável.
- Links de rota abrem Google Maps para consulta cartográfica; não afirmam apresentar mapa ao vivo na aplicação.
- Repo público: não incorporar moradas residenciais dos screenshots, tokens, dados de contas ou histórico real.

## Critérios de aceitação

- €3,74 + €3,31 = €7,05 no relatório, sem erro decimal.
- Uma oferta `€3,31 a €4,91` não é declarada mais barata que uma de `€3,74` com certeza.
- Após cinco minutos a oferta deixa de fundamentar a recomendação "agora".
- Rotas distintas não misturam ofertas na comparação.
- Viagens planeadas não aumentam o total pago; o relatório filtra corretamente por mês e empresa.
- Dados importados inválidos são recusados; CSV trata valores com fórmulas.
- iPhone e desktop: formulários, navegação, exportação/importação e persistência locais funcionais.

## Fontes oficiais

- [Uber Developers, Price Estimates](https://developer.uber.com/docs/riders/references/api/v1.2/estimates-price-get), exige aprovação e proíbe comparação via API com serviços concorrentes.
- [Uber Ajuda, obter tarifa](https://help.uber.com/pt-PT/riders/article/c%C3%B3mo-obtener-una-tarifa-estimada-de-tu-viaje?nodeId=cc1efc16-df15-47f3-8057-61c2b75ea529), estima e adverte da variação.
- [Bolt Suporte, preço](https://bolt.eu/pt-pt/support/articles/115002917754/), depende de base, tempo, distância e preço dinâmico.
