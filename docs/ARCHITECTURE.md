# Arquitetura

## Componentes

- `index.html`: ecrãs Comparar, Viagens, Relatórios, Definições e formulário modal.
- `styles.css`: design responsivo mobile-first, estados, contraste e foco.
- `src/core.mjs`: cálculos puros em cêntimos, frescura, comparação, contabilidade mensal e validação das importações.
- `src/app.mjs`: eventos da interface, renderização segura, formulários, persistência e exportação/importação.
- `sw.js`: cache do shell offline, sem dados pessoais, por versão.
- `manifest.webmanifest` e `assets/`: instalação progressiva e ícones.
- `tests/core.test.mjs`: testes das regras críticas.

## Dados

`localStorage` guarda um objeto `schemaVersion: 1` com `route`, `quotes`, `trips`, `favorites`, `budgetCents`, `mode`.

As ofertas não são despesas. Cada `quote` tem origem, destino, preço mínimo/máximo inteiro em cêntimos, hora de recolha e dados opcionais de espera. Cada `trip` tem estado `planned` ou `paid`, valor real se pago, data, categoria e pagamento. O relatório ignora viagens planeadas.

## Segurança

- Sem servidor, login, tokens, trackers ou bibliotecas externas.
- Escapam-se valores introduzidos antes de os incluir em HTML gerado; URLs externas usam `URLSearchParams`.
- CSP restringe recursos ao próprio domínio, exceto pré-visualização local de imagem `blob:`.
- Importação JSON sujeita a limites de tamanho, estrutura, quantidade e tipos. CSV com prevenção de execução de fórmulas em folhas de cálculo.
- O repositório é público, não há moradas reais, recibos nem fotografias pessoais integrados no código.
- `localStorage` não é encriptado; não guardar dados bancários ou moradas desnecessárias. Não há sincronização.

## Publicação

Ficheiros estáticos preparados para alojamento HTTPS (subpasta ou raiz). A instalação como PWA exige HTTPS e os dados ficam isolados por origem/navegador. Site privado e GitHub são superfícies independentes se ambos forem usados.
