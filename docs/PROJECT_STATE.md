# Estado do projeto

- **Projeto:** Rota & Conta.
- **Versão:** 1.2.0.
- **Repositório de origem:** `AllyssonEstadulho92/calculadora-aplicativo.-`, inicialmente apenas README.
- **Estado:** versão 1.2.0 validada e publicada no Site privado, com publicação no GitHub preparada para a ramificação `feat/rota-conta-v1-20261030`. PR #1 mantém-se em rascunho; `main` não foi alterada.
- **Teste alojado:** `https://rota-e-conta-allysson-2026.major-shell-6297.chatgpt.site` (acesso reservado ao proprietário, com entrada ChatGPT).
- **GitHub:** `https://github.com/AllyssonEstadulho92/calculadora-aplicativo.-/pull/1`.
- **Verificação:** onze testes automatizados aprovados (seis financeiros, cinco de rota), incluindo falhas de rede, moradas não encontradas e validação de backups. Consulta real dos serviços My Geocode e OSRM aprovada em navegador com percurso entre duas praças públicas de Lisboa, apresentando 2,0 km e 3 min com aviso de localização aproximada. O iPhone real ainda está por validar.
- **Funcionalidades:** consulta automática de distância/duração ao confirmar moradas, links oficiais Uber/Bolt/Moovit e cópia de percurso, confirmação de localizações, avisos de precisão, ofertas Uber/Bolt, intervalos e descontos, sugestão com frescura, cálculo multiplicado por viagens e custo equivalente por km do preço observado, registos pagos/planeados, relatórios, orçamento, favoritos, CSV/JSON, PWA.
- **Limitações conscientes:** links oficiais genéricos não preenchem a viagem nem devolvem preços; sem preços em tempo real por API, sem previsão exata de tarifa a partir da morada, sem trânsito em tempo real, sem OCR, sem mapa incorporado, sem sincronização e sem backend. Serviços My Geocode e OSRM dependentes de terceiros e sujeitos a indisponibilidade.
- **Riscos principais:** preço mostrado pode mudar após recolha; geocodificação pode aproximar uma morada e o percurso não inclui trânsito; os serviços externos recebem moradas/coordenadas mediante clique; `localStorage` pode ser limpo; recomendações dependem de inserção correta e momento.
- **Última alteração:** automatização da consulta rodoviária após confirmar moradas, consulta das fontes oficiais e cópia de percurso, a 30/10/2026.
- **Próximo passo:** validar o comportamento real no iPhone, incluindo consulta de moradas, PWA e backup, e planear eventual fornecedor de rotas com garantia de serviço.
