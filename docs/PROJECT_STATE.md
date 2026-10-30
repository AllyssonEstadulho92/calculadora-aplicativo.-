# Estado do projeto

- **Projeto:** Rota & Conta.
- **Versão:** 1.1.0.
- **Repositório de origem:** `AllyssonEstadulho92/calculadora-aplicativo.-`, inicialmente apenas README.
- **Estado:** versão 1.1.0 preparada sobre a ramificação `feat/rota-conta-v1-20261030` do GitHub, com PR #1 em rascunho para `main`; publicação privada a atualizar após testes.
- **Teste alojado:** `https://rota-e-conta-allysson-2026.major-shell-6297.chatgpt.site` (acesso reservado ao proprietário, com entrada ChatGPT).
- **GitHub:** `https://github.com/AllyssonEstadulho92/calculadora-aplicativo.-/pull/1`.
- **Verificação:** onze testes automatizados aprovados (seis financeiros, cinco de rota), incluindo falhas de rede, moradas não encontradas e validação de backups. Consulta real dos fornecedores e iPhone real ainda por validar.
- **Funcionalidades:** consulta de coordenadas mediante clique, distância e duração de rota rodoviária estimadas, confirmação de localizações, avisos de precisão, ofertas Uber/Bolt, intervalos e descontos, sugestão com frescura, cálculo multiplicado por viagens e custo equivalente por km do preço observado, registos pagos/planeados, relatórios, orçamento, favoritos, CSV/JSON, PWA.
- **Limitações conscientes:** sem preços em tempo real por API, sem previsão exata de tarifa a partir da morada, sem trânsito em tempo real, sem OCR, sem mapa incorporado, sem sincronização e sem backend. Serviços My Geocode e OSRM dependentes de terceiros e sujeitos a indisponibilidade.
- **Riscos principais:** preço mostrado pode mudar após recolha; geocodificação pode aproximar uma morada e o percurso não inclui trânsito; os serviços externos recebem moradas/coordenadas mediante clique; `localStorage` pode ser limpo; recomendações dependem de inserção correta e momento.
- **Última alteração:** inclusão da distância pela morada, controlo de precisão e testes de erros, a 30/10/2026.
- **Próximo passo:** validar o serviço externo e o comportamento real no iPhone, incluindo PWA e backup, e planear eventual fornecedor de rotas com garantia de serviço.
