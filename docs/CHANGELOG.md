# Changelog

## 1.1.0, 30/10/2026

- Botão para calcular distância e duração de automóvel a partir das moradas confirmadas.
- Localização de cada morada por My Geocode e rota por OSRM de demonstração, com aviso de privacidade e serviços externos.
- Apresentação das moradas identificadas, sinalização de precisão insuficiente e tratamento de erros/indisponibilidade.
- Custo equivalente por quilómetro calculado apenas a partir de um preço real registado, sem inventar tarifas por distância.
- Última medição guardada no backup local, compatível com a estrutura anterior.
- Cinco novos testes de rotas; total de onze testes automatizados.

## 1.0.0, 30/10/2026

- Primeira versão funcional web/PWA para comparação manual Uber/Bolt.
- Sugestão principal com diferença entre menor custo e menor tempo de espera, incluindo intervalos sobrepostos e ofertas expiradas.
- Cálculo do preço registado para uma ou várias viagens mensais.
- Registos financeiros de viagens pagas e planeadas, edição e eliminação.
- Relatório mensal com total, média, desagregação por plataforma e orçamento.
- Locais favoritos, consulta temporária de capturas, exportação CSV/JSON e importação validada.
- Código e regras de cálculo isoladas com testes automatizados.
- Entrada de intervalos também para valores anteriores ao desconto, sem calcular uma percentagem enganadora quando os intervalos se cruzam.
- Publicação de uma versão privada para teste e abertura de PR #1 no GitHub, mantendo `main` inalterada.
