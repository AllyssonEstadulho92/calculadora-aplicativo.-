# Changelog

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
