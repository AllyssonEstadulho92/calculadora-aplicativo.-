# Decisões técnicas

| Data | Decisão | Motivo |
| --- | --- | --- |
| 2026-10-30 | Web app/PWA com HTML/CSS/JS nativos | Menor complexidade, sem dependências, adequada a iPhone e desktop. |
| 2026-10-30 | Não prometer preços ao vivo | Uber exige aprovação e proíbe usar a sua API de estimativas para comparação com concorrentes; a Bolt fornece estimativas dinâmicas. |
| 2026-10-30 | Ofertas com cinco minutos de frescura | Reduzir recomendações baseadas em informações antigas, sem afirmar estabilidade dentro desse período. |
| 2026-10-30 | Ordenar preço pelo limite superior | Em intervalos, valor máximo é mais prudente. Resultado marcado como inconclusivo quando os preços se cruzam. |
| 2026-10-30 | Cálculos em cêntimos inteiros | Evitar erros de arredondamento de JavaScript com euros decimais. |
| 2026-10-30 | Só viagem paga conta em despesas | Separar previsão financeira de saída real de dinheiro. |
| 2026-10-30 | Armazenamento local + backup manual | Evitar infraestrutura e recolha de dados pessoais nesta versão. Exige aviso explícito de risco de perda. |
| 2026-10-30 | Captura apenas para consulta visual | OCR automático sem validação poderia inventar/interpretar mal preços e descontos. |
| 2026-10-30 | Rota rodoviária por My Geocode + OSRM mediante clique | Permitir consultar quilómetros e tempo com base nas moradas sem chaves secretas em código público. O geocodificador autoriza uso pessoal sem chave; OSRM é demonstração não comercial e sem garantia de disponibilidade. A integração é substituível. |
| 2026-10-30 | Mostrar confiança e etiquetas da localização | Números de porta podem não ser identificados exatamente; o utilizador confirma a correspondência. Não confundir distância estimada com tarifa da Uber/Bolt. |
| 2026-10-30 | Manter esquema de backup v1 com `route.measure` opcional | Preservar histórico anterior e atualizar a medição sem migração destrutiva. |
| 2026-10-30 | Calcular percurso ao confirmar moradas | Cumprir o pedido de utilização simples, evitando o segundo botão; a transferência de moradas é explicitada antes da confirmação. |
| 2026-10-30 | Adicionar links diretos oficiais e botão para copiar percurso | Permitir consulta prática nas fontes sem afirmar que existe uma API de preços disponível. Links genéricos evitam padrões de deep link não confirmados e partilha silenciosa de moradas. |
| 2026-10-30 | Manter comparação de tarifas apenas com valores observados | Sem autorização de Uber/Bolt/Moovit para API de preços personalizados, o acesso à fonte não equivale à capacidade de extrair cotações automáticas. Não recolher preços por scraping. |
