# Arquitetura

## Componentes

- `index.html`: ecrãs Comparar, Viagens, Relatórios, Definições e formulário modal.
- `styles.css`: design responsivo mobile-first, estados, contraste e foco.
- `src/core.mjs`: cálculos puros em cêntimos, frescura, comparação, contabilidade mensal e validação das importações.
- `src/routing.mjs`: localização das moradas via My Geocode, percurso rodoviário por OSRM, validação, tempo limite, cache de sessão e erros legíveis.
- `src/app.mjs`: eventos da interface, renderização segura, formulários, persistência e exportação/importação.
- `sw.js`: cache do shell offline, sem dados pessoais, por versão.
- `manifest.webmanifest` e `assets/`: instalação progressiva e ícones.
- `tests/core.test.mjs` e `tests/routing.test.mjs`: testes das regras críticas e respostas simuladas dos serviços de mapa.

## Dados

`localStorage` guarda um objeto `schemaVersion: 1` com `route`, `quotes`, `trips`, `favorites`, `budgetCents`, `mode`. `route.measure` é opcional e guarda distância em metros, duração em segundos, etiquetas identificadas, sinal de incerteza e momento da consulta. Backup v1.0.0 permanece compatível.

As ofertas não são despesas. Cada `quote` tem origem, destino, preço mínimo/máximo inteiro em cêntimos, hora de recolha e dados opcionais de espera. Cada `trip` tem estado `planned` ou `paid`, valor real se pago, data, categoria e pagamento. O relatório ignora viagens planeadas.

## Segurança

- Sem servidor próprio, login, tokens, trackers ou bibliotecas JavaScript externas.
- Escapam-se valores introduzidos antes de os incluir em HTML gerado; URLs externas usam `URLSearchParams`.
- CSP restringe scripts e imagens ao próprio domínio, exceto pré-visualização local `blob:`; apenas `connect-src` autoriza pedidos HTTPS a `api.mygeocode.com` e `router.project-osrm.org` após clique explícito.
- O geocodificador recebe texto das duas moradas; o motor de percurso recebe coordenadas. A localização pode não corresponder ao número de porta e é apresentada ao utilizador para confirmação. O motor de rota de demonstração não inclui trânsito em tempo real nem oferece SLA.
- Importação JSON sujeita a limites de tamanho, estrutura, quantidade e tipos. CSV com prevenção de execução de fórmulas em folhas de cálculo.
- O repositório é público, não há moradas reais, recibos nem fotografias pessoais integrados no código.
- `localStorage` não é encriptado; não guardar dados bancários ou moradas desnecessárias. Não há sincronização.

## Publicação

Ficheiros estáticos preparados para alojamento HTTPS (subpasta ou raiz). A instalação como PWA exige HTTPS e os dados ficam isolados por origem/navegador. Site privado e GitHub são superfícies independentes se ambos forem usados.
