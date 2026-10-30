# Estado do projeto

- **Projeto:** Rota & Conta.
- **Versão:** 1.1.0.
- **Repositório de origem:** `AllyssonEstadulho92/calculadora-aplicativo.-`, inicialmente apenas README.
- **Estado:** versão 1.1.0 enviada para a ramificação `feat/rota-conta-v1-20261030` do GitHub, com PR #1 em rascunho para `main`, e publicada como segunda versão do Site privado; `main` não foi alterada.
- **Teste alojado:** `https://rota-e-conta-allysson-2026.major-shell-6297.chatgpt.site` (acesso reservado ao proprietário, com entrada ChatGPT).
- **GitHub:** `https://github.com/AllyssonEstadulho92/calculadora-aplicativo.-/pull/1`.
- **Verificação:** onze testes automatizados aprovados (seis financeiros, cinco de rota), incluindo falhas de rede, moradas não encontradas e validação de backups. Consulta real dos serviços My Geocode e OSRM aprovada em navegador com percurso entre duas praças públicas de Lisboa, apresentando 2,0 km e 3 min com aviso de localização aproximada. O iPhone real ainda está por validar.
- **Funcionalidades:** consulta de coordenadas mediante clique, distância e duração de rota rodoviária estimadas, confirmação de localizações, avisos de precisão, ofertas Uber/Bolt, intervalos e descontos, sugestão com frescura, cálculo multiplicado por viagens e custo equivalente por km do preço observado, registos pagos/planeados, relatórios, orçamento, favoritos, CSV/JSON, PWA.
- **Limitações conscientes:** sem preços em tempo real por API, sem previsão exata de tarifa a partir da morada, sem trânsito em tempo real, sem OCR, sem mapa incorporado, sem sincronização e sem backend. Serviços My Geocode e OSRM dependentes de terceiros e sujeitos a indisponibilidade.
- **Riscos principais:** preço mostrado pode mudar após recolha; geocodificação pode aproximar uma morada e o percurso não inclui trânsito; os serviços externos recebem moradas/coordenadas mediante clique; `localStorage` pode ser limpo; recomendações dependem de inserção correta e momento.
- **Última alteração:** inclusão, testes e publicação privada da distância pela morada em v1.1.0; atualização do PR #1 no GitHub, a 30/10/2026.
- **Próximo passo:** validar o comportamento real no iPhone, incluindo consulta de moradas, PWA e backup, e planear eventual fornecedor de rotas com garantia de serviço.
